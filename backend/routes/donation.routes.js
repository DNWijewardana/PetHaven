import express from 'express';
import { 
  createDonation,
  getDonations,
  getDonationById,
  updateDonationStatus,
  getDonationStatistics
} from '../controllers/donation.controller.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/', createDonation);
router.get('/statistics', getDonationStatistics);

// Protected routes (require authentication)
router.get('/my-donations', isAuthenticated, getDonations);
router.get('/:id', isAuthenticated, getDonationById);

// Admin routes
router.get('/', isAdmin, getDonations);
router.patch('/:id/status', isAdmin, updateDonationStatus);

export default router; 