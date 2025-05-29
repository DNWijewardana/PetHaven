import express from 'express';
import { 
  getAllMedicalGuides, 
  getMedicalGuideById, 
  getMedicalGuidesByCategory,
  searchMedicalGuides
} from '../controllers/medicalGuide.controller.js';

const router = express.Router();

// Get all medical guides
router.get('/', getAllMedicalGuides);

// Search medical guides
router.get('/search', searchMedicalGuides);

// Get medical guides by category
router.get('/category/:category', getMedicalGuidesByCategory);

// Get medical guide by ID
router.get('/:id', getMedicalGuideById);

export default router; 