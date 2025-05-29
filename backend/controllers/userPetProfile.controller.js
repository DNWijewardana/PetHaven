import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import UserPetProfile from '../models/UserPetProfile.js';
import Report from '../models/Report.js';
import Pet from '../models/PetModel.js';

/**
 * Get all pet profiles for a user
 */
export const getUserPetProfiles = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { includeInactive = false } = req.query;

  // Verify the user has permission to access these profiles
  if (req.user.sub !== userId && !req.user.isAdmin) {
    throw new ApiError(403, 'You do not have permission to access these pet profiles');
  }

  // Build query
  const query = { userId };
  if (!includeInactive) {
    query.isActive = true;
  }

  const petProfiles = await UserPetProfile.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: petProfiles
  });
});

/**
 * Get a specific pet profile by ID
 */
export const getPetProfileById = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  const petProfile = await UserPetProfile.findById(profileId);

  if (!petProfile) {
    throw new ApiError(404, 'Pet profile not found');
  }

  // Verify the user has permission to access this profile
  if (petProfile.userId !== req.user.sub && !req.user.isAdmin) {
    throw new ApiError(403, 'You do not have permission to access this pet profile');
  }

  res.status(200).json({
    success: true,
    data: petProfile
  });
});

/**
 * Create a new pet profile
 */
export const createPetProfile = asyncHandler(async (req, res) => {
  const {
    petName,
    petType,
    breed,
    age,
    gender,
    color,
    weight,
    microchipId,
    profileImage,
    additionalImages,
    source,
    sourceReference,
    sourceModel,
    notes,
    medicalInfo
  } = req.body;

  // Validate required fields
  if (!petName || !petType || !source) {
    throw new ApiError(400, 'Please provide all required fields');
  }

  // Validate source reference if provided
  if (sourceReference && sourceModel) {
    let referenceModel;
    switch (sourceModel) {
      case 'Report':
        referenceModel = Report;
        break;
      case 'Pet':
        referenceModel = Pet;
        break;
      default:
        throw new ApiError(400, 'Invalid source model');
    }

    const sourceDoc = await referenceModel.findById(sourceReference);
    if (!sourceDoc) {
      throw new ApiError(404, 'Source reference not found');
    }
  }

  const newPetProfile = await UserPetProfile.create({
    userId: req.user.sub,
    petName,
    petType,
    breed,
    age,
    gender,
    color,
    weight,
    microchipId,
    profileImage,
    additionalImages,
    source,
    sourceReference,
    sourceModel,
    notes,
    medicalInfo
  });

  res.status(201).json({
    success: true,
    data: newPetProfile
  });
});

/**
 * Update an existing pet profile
 */
export const updatePetProfile = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const updateData = req.body;

  // Find the pet profile
  const petProfile = await UserPetProfile.findById(profileId);
  
  if (!petProfile) {
    throw new ApiError(404, 'Pet profile not found');
  }

  // Verify the user has permission to update this profile
  if (petProfile.userId !== req.user.sub && !req.user.isAdmin) {
    throw new ApiError(403, 'You do not have permission to update this pet profile');
  }

  // Update the profile
  const updatedProfile = await UserPetProfile.findByIdAndUpdate(
    profileId,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedProfile
  });
});

/**
 * Add a vaccine record to a pet profile
 */
export const addVaccineRecord = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  const { name, date, fileUrl, notes } = req.body;

  // Validate required fields
  if (!name || !date || !fileUrl) {
    throw new ApiError(400, 'Please provide all required fields');
  }

  // Find the pet profile
  const petProfile = await UserPetProfile.findById(profileId);
  
  if (!petProfile) {
    throw new ApiError(404, 'Pet profile not found');
  }

  // Verify the user has permission to update this profile
  if (petProfile.userId !== req.user.sub && !req.user.isAdmin) {
    throw new ApiError(403, 'You do not have permission to update this pet profile');
  }

  // Add the vaccine record
  petProfile.vaccines.push({
    name,
    date,
    fileUrl,
    notes
  });

  await petProfile.save();

  res.status(200).json({
    success: true,
    data: petProfile
  });
});

/**
 * Remove a vaccine record from a pet profile
 */
export const removeVaccineRecord = asyncHandler(async (req, res) => {
  const { profileId, vaccineId } = req.params;

  // Find the pet profile
  const petProfile = await UserPetProfile.findById(profileId);
  
  if (!petProfile) {
    throw new ApiError(404, 'Pet profile not found');
  }

  // Verify the user has permission to update this profile
  if (petProfile.userId !== req.user.sub && !req.user.isAdmin) {
    throw new ApiError(403, 'You do not have permission to update this pet profile');
  }

  // Remove the vaccine record
  petProfile.vaccines = petProfile.vaccines.filter(
    vaccine => vaccine._id.toString() !== vaccineId
  );

  await petProfile.save();

  res.status(200).json({
    success: true,
    data: petProfile
  });
});

/**
 * Deactivate (soft delete) a pet profile
 */
export const deactivatePetProfile = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  // Find the pet profile
  const petProfile = await UserPetProfile.findById(profileId);
  
  if (!petProfile) {
    throw new ApiError(404, 'Pet profile not found');
  }

  // Verify the user has permission to deactivate this profile
  if (petProfile.userId !== req.user.sub && !req.user.isAdmin) {
    throw new ApiError(403, 'You do not have permission to deactivate this pet profile');
  }

  // Deactivate the profile
  petProfile.isActive = false;
  await petProfile.save();

  res.status(200).json({
    success: true,
    message: 'Pet profile deactivated successfully'
  });
});

/**
 * Reactivate a pet profile
 */
export const reactivatePetProfile = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  // Find the pet profile
  const petProfile = await UserPetProfile.findById(profileId);
  
  if (!petProfile) {
    throw new ApiError(404, 'Pet profile not found');
  }

  // Verify the user has permission to reactivate this profile
  if (petProfile.userId !== req.user.sub && !req.user.isAdmin) {
    throw new ApiError(403, 'You do not have permission to reactivate this pet profile');
  }

  // Reactivate the profile
  petProfile.isActive = true;
  await petProfile.save();

  res.status(200).json({
    success: true,
    message: 'Pet profile reactivated successfully'
  });
}); 