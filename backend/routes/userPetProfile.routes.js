import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import {
  getUserPetProfiles,
  getPetProfileById,
  createPetProfile,
  updatePetProfile,
  addVaccineRecord,
  removeVaccineRecord,
  deactivatePetProfile,
  reactivatePetProfile
} from '../controllers/userPetProfile.controller.js';

const router = express.Router();

// Get all pet profiles for a user
router.get('/user/:userId', isAuthenticated, getUserPetProfiles);

// Get a specific pet profile
router.get('/:profileId', isAuthenticated, getPetProfileById);

// Create a new pet profile
router.post('/', isAuthenticated, createPetProfile);

// Update a pet profile
router.put('/:profileId', isAuthenticated, updatePetProfile);

// Add a vaccine record to a pet profile
router.post('/:profileId/vaccines', isAuthenticated, addVaccineRecord);

// Remove a vaccine record from a pet profile
router.delete('/:profileId/vaccines/:vaccineId', isAuthenticated, removeVaccineRecord);

// Deactivate a pet profile (soft delete)
router.patch('/:profileId/deactivate', isAuthenticated, deactivatePetProfile);

// Reactivate a pet profile
router.patch('/:profileId/reactivate', isAuthenticated, reactivatePetProfile);

export default router; 