import express from 'express';
import { 
  createVetClinic, 
  getAllVetClinics, 
  getVetClinicById, 
  updateVetClinic, 
  deleteVetClinic, 
  findNearbyVetClinics, 
  findNearbyVetClinicsGoogle, 
  getVetClinicDetailsGoogle 
} from '../controllers/vetClinic.controller.js';

const router = express.Router();

/**
 * @route   POST /api/vet-clinics
 * @desc    Create a new vet clinic
 * @access  Private/Admin
 */
router.post('/', createVetClinic);

/**
 * @route   GET /api/vet-clinics
 * @desc    Get all vet clinics with optional filtering
 * @access  Public
 */
router.get('/', getAllVetClinics);

/**
 * @route   GET /api/vet-clinics/search/nearby
 * @desc    Find nearby vet clinics (MongoDB)
 * @access  Public
 */
router.get('/search/nearby', findNearbyVetClinics);

/**
 * @route   GET /api/vet-clinics/google/nearby
 * @desc    Find nearby vet clinics (Google Places API)
 * @access  Public
 */
router.get('/google/nearby', findNearbyVetClinicsGoogle);

/**
 * @route   GET /api/vet-clinics/google/:placeId
 * @desc    Get details of a vet clinic from Google Places API
 * @access  Public
 */
router.get('/google/:placeId', getVetClinicDetailsGoogle);

/**
 * @route   GET /api/vet-clinics/:id
 * @desc    Get a vet clinic by ID
 * @access  Public
 */
router.get('/:id', getVetClinicById);

/**
 * @route   PUT /api/vet-clinics/:id
 * @desc    Update a vet clinic
 * @access  Private/Admin
 */
router.put('/:id', updateVetClinic);

/**
 * @route   DELETE /api/vet-clinics/:id
 * @desc    Delete a vet clinic
 * @access  Private/Admin
 */
router.delete('/:id', deleteVetClinic);

export default router; 