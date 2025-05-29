import { ApiError } from '../utils/ApiError.js';
import Post from '../models/Post.js';
import Pet from '../models/PetModel.js';

// Get latest pet reports
export async function getLatestPets(req, res) {
  try {
    const latestPets = await Post.find({
      category: { $in: ['LOST_PETS', 'FOUND_PETS', 'ADOPTION'] }
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('author', 'name email picture');

    res.json(latestPets);
  } catch (error) {
    console.error('Error fetching latest pets:', error);
    res.status(500).json({ message: error.message });
  }
}

// Get lost pets
export async function getLostPets(req, res) {
  try {
    const lostPets = await Post.find({ category: 'LOST_PETS' })
      .sort({ createdAt: -1 })
      .populate('author', 'name email picture');

    res.json(lostPets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get found pets
export async function getFoundPets(req, res) {
  try {
    const foundPets = await Post.find({ category: 'FOUND_PETS' })
      .sort({ createdAt: -1 })
      .populate('author', 'name email picture');

    res.json(foundPets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get pets for adoption
export async function getPetsForAdoption(req, res) {
  try {
    const adoptionPets = await Post.find({ category: 'ADOPTION' })
      .sort({ createdAt: -1 })
      .populate('author', 'name email picture');

    res.json(adoptionPets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Create a pet adoption post
export async function createAdoptionPost(req, res) {
  try {
    const { name, type, location, description, image, owner, mobileNumber, preferredContact } = req.body;

    // Validate required fields
    if (!name || !location || !description || !image || !owner) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create a new Pet document
    const newPet = new Pet({
      name,
      type: 'adopt', // Always set type as adopt
      owner,
      location,
      description,
      image
    });

    // Save the pet to the database
    const savedPet = await newPet.save();

    // We are NOT creating a post in the community anymore
    // This ensures listings only appear in assist-or-adopt-pets

    return res.status(201).json({
      success: true,
      message: 'Pet successfully listed for adoption',
      data: savedPet
    });
  } catch (error) {
    console.error('Error creating adoption post:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while listing the pet for adoption'
    });
  }
} 