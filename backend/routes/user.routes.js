import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// Register or update user from Auth0
router.post('/register', userController.registerUser);

// Get user profile
router.get('/profile/:sub', userController.getProfile);

// Update user profile
router.put('/profile/:sub', userController.updateProfile);

export default router; 