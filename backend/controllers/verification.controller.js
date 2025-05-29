import Verification from '../models/Verification.js';
import Pet from '../models/PetModel.js';
import User from '../models/UserModel.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Initiate a verification process for a pet
 */
export const initiateVerification = async (req, res) => {
  try {
    const { petId, verificationMethod } = req.body;
    
    // Get the current user
    const currentUser = req.user;
    
    // Find the pet
    const pet = await Pet.findById(petId);
    if (!pet) {
      throw new ApiError(404, 'Pet not found');
    }
    
    // Determine if the current user is the finder or the claimant
    const isPetFinder = pet.owner === currentUser.email;
    
    // If user isn't finder or trying to claim someone else's lost pet, reject
    if (pet.type === 'found' && !isPetFinder) {
      throw new ApiError(403, 'Only the finder of this pet can initiate verification');
    }
    
    if (pet.type === 'lost' && isPetFinder) {
      throw new ApiError(403, 'You cannot claim your own lost pet');
    }
    
    // Find or create user records
    const finderUser = await User.findOne({ email: pet.owner });
    if (!finderUser) {
      throw new ApiError(404, 'Pet owner/finder not found in user database');
    }
    
    let claimantUser = await User.findOne({ email: currentUser.email });
    if (!claimantUser) {
      // Create a user record if needed
      claimantUser = new User({
        name: currentUser.name,
        email: currentUser.email,
        picture: currentUser.picture,
        auth0_id: currentUser._id
      });
      await claimantUser.save();
    }
    
    // Check if a verification process already exists
    const existingVerification = await Verification.findOne({
      pet: petId,
      finder: finderUser._id,
      claimant: claimantUser._id
    });
    
    if (existingVerification) {
      return res.status(200).json({
        message: 'Verification process already initiated',
        verification: existingVerification
      });
    }
    
    // Create new verification process
    const verification = new Verification({
      pet: petId,
      finder: pet.type === 'found' ? finderUser._id : claimantUser._id,
      claimant: pet.type === 'found' ? claimantUser._id : finderUser._id,
      verificationMethod,
      status: 'PENDING',
      verificationData: {}
    });
    
    await verification.save();
    
    res.status(201).json({
      message: 'Verification process initiated successfully',
      verification
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Submit verification data (tag ID, microchip number, security questions, etc.)
 */
export const submitVerificationData = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { uniqueIdentifier, questions, ownerPhotos } = req.body;
    
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw new ApiError(404, 'Verification process not found');
    }
    
    // Make sure the current user is the claimant
    if (verification.claimant.toString() !== req.user._id) {
      throw new ApiError(403, 'Only the claimant can submit verification data');
    }
    
    // Update verification data based on method
    switch (verification.verificationMethod) {
      case 'TAG':
      case 'MICROCHIP':
        verification.verificationData.uniqueIdentifier = uniqueIdentifier;
        break;
      case 'QUESTIONS':
        verification.verificationData.questions = questions;
        break;
      case 'PHOTO':
        verification.verificationData.ownerPhotos = ownerPhotos;
        break;
    }
    
    await verification.save();
    
    res.status(200).json({
      message: 'Verification data submitted successfully',
      verification
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Respond to verification (finder approving or rejecting the claim)
 */
export const respondToVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { status, finderPhotos, adminNotes } = req.body;
    
    const verification = await Verification.findById(verificationId)
      .populate('pet')
      .populate('finder')
      .populate('claimant');
    
    if (!verification) {
      throw new ApiError(404, 'Verification process not found');
    }
    
    // Make sure the current user is the finder
    if (verification.finder._id.toString() !== req.user._id) {
      throw new ApiError(403, 'Only the finder can respond to verification requests');
    }
    
    // Update verification status
    verification.status = status;
    
    // If photos were provided (for PHOTO verification)
    if (finderPhotos) {
      verification.verificationData.finderPhotos = finderPhotos;
    }
    
    // If admin notes provided
    if (adminNotes) {
      verification.verificationData.adminNotes = adminNotes;
    }
    
    // If verified, update the pet status
    if (status === 'VERIFIED') {
      const pet = verification.pet;
      pet.type = 'adopted'; // or another status indicating the pet has been reunited with owner
      await pet.save();
    }
    
    await verification.save();
    
    res.status(200).json({
      message: `Verification ${status.toLowerCase()} successfully`,
      verification
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Send a message in the verification chat
 */
export const sendMessage = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { message } = req.body;
    
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw new ApiError(404, 'Verification process not found');
    }
    
    // Check if user is part of this verification process
    const isParticipant = 
      verification.finder.toString() === req.user._id || 
      verification.claimant.toString() === req.user._id;
      
    if (!isParticipant) {
      throw new ApiError(403, 'You are not authorized to participate in this chat');
    }
    
    // Check if verification has expired
    if (new Date() > new Date(verification.expiresAt)) {
      throw new ApiError(400, 'This verification process has expired');
    }
    
    // Add message to chat history
    verification.chatHistory.push({
      sender: req.user._id,
      message
    });
    
    await verification.save();
    
    // Populate and return the updated verification
    const populatedVerification = await Verification.findById(verificationId)
      .populate('pet')
      .populate('finder', 'name email picture')
      .populate('claimant', 'name email picture')
      .populate('chatHistory.sender', 'name email picture');
    
    res.status(200).json({
      message: 'Message sent successfully',
      verification: populatedVerification
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Get all verifications for the current user
 */
export const getUserVerifications = async (req, res) => {
  try {
    const verifications = await Verification.find({
      $or: [
        { finder: req.user._id },
        { claimant: req.user._id }
      ]
    })
    .populate('pet')
    .populate('finder', 'name email picture')
    .populate('claimant', 'name email picture')
    .sort({ updatedAt: -1 });
    
    res.status(200).json(verifications);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Get a single verification by ID
 */
export const getVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;
    
    const verification = await Verification.findById(verificationId)
      .populate('pet')
      .populate('finder', 'name email picture')
      .populate('claimant', 'name email picture')
      .populate('chatHistory.sender', 'name email picture');
    
    if (!verification) {
      throw new ApiError(404, 'Verification process not found');
    }
    
    // Check if user is part of this verification process
    const isParticipant = 
      verification.finder._id.toString() === req.user._id || 
      verification.claimant._id.toString() === req.user._id;
      
    if (!isParticipant) {
      throw new ApiError(403, 'You are not authorized to view this verification process');
    }
    
    res.status(200).json(verification);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Report a dispute for admin review
 */
export const reportDispute = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { disputeReason } = req.body;
    
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw new ApiError(404, 'Verification process not found');
    }
    
    // Check if user is part of this verification process
    const isParticipant = 
      verification.finder.toString() === req.user._id || 
      verification.claimant.toString() === req.user._id;
      
    if (!isParticipant) {
      throw new ApiError(403, 'You are not authorized to report a dispute for this verification');
    }
    
    // Update status and add dispute reason
    verification.status = 'DISPUTED';
    verification.disputeReason = disputeReason;
    
    await verification.save();
    
    res.status(200).json({
      message: 'Dispute reported successfully',
      verification
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Admin resolution of disputes (for admin users only)
 */
export const resolveDispute = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { status, adminNotes } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Only admins can resolve disputes');
    }
    
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw new ApiError(404, 'Verification process not found');
    }
    
    // Update verification status
    verification.status = status;
    verification.verificationData.adminNotes = adminNotes;
    
    // If verified, update the pet status
    if (status === 'VERIFIED') {
      const pet = await Pet.findById(verification.pet);
      if (pet) {
        pet.type = 'adopted'; // or another status indicating the pet has been reunited with owner
        await pet.save();
      }
    }
    
    await verification.save();
    
    res.status(200).json({
      message: 'Dispute resolved successfully',
      verification
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}; 