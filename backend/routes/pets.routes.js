import express from 'express';
import * as petsController from '../controllers/pets.controller.js';

const router = express.Router();

// Get latest pet reports
router.get('/latest', petsController.getLatestPets);

// Get lost pets
router.get('/lost', petsController.getLostPets);

// Get found pets
router.get('/found', petsController.getFoundPets);

// Get pets for adoption
router.get('/adoption', petsController.getPetsForAdoption);

// Get all adopt pets from Pet model (not posts)
router.get('/adopt', async (req, res) => {
  try {
    // Directly import Pet model for this route
    const Pet = (await import('../models/PetModel.js')).default;
    const pets = await Pet.find({ type: "adopt" });
    res.status(200).json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete pet by validating owner is the same as the one who posted it
router.delete('/delete', async (req, res) => {
  const { id, owner } = req.body;
  try {
    // Import Pet model
    const Pet = (await import('../models/PetModel.js')).default;
    
    // Check all required fields
    if (!id || !owner) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check if pet exists
    const isPetExist = await Pet.findById(id);
    if (!isPetExist) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }
    
    // Check if owner is the same as the one who posted it
    if (isPetExist.owner !== owner) {
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this pet.",
      });
    }
    
    // Delete pet
    await Pet.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Pet deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit a pet for adoption
router.post('/adopt', petsController.createAdoptionPost);

export default router; 