import express from 'express';
import * as verificationController from '../controllers/verification.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// All verification routes require authentication
router.use(isAuthenticated);

// Initiate verification process
router.post('/', verificationController.initiateVerification);

// Get all verifications for current user
router.get('/', verificationController.getUserVerifications);

// Get a specific verification
router.get('/:verificationId', verificationController.getVerification);

// Submit verification data (microchip, tag, photos, questions, etc)
router.post('/:verificationId/data', verificationController.submitVerificationData);

// Respond to verification (finder approving or rejecting)
router.put('/:verificationId/respond', verificationController.respondToVerification);

// Chat functionality
router.post('/:verificationId/chat', verificationController.sendMessage);

// Report a dispute
router.post('/:verificationId/dispute', verificationController.reportDispute);

// Admin resolution of disputes
router.put('/:verificationId/resolve', verificationController.resolveDispute);

export default router; 