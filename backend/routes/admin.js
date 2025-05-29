import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.middleware.js';
import { getAdminEmails, addAdminEmail, removeAdminEmail } from '../utils/adminConfig.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

// Get all admin emails (admin only)
router.get('/emails', isAuthenticated, isAdmin, (req, res) => {
  const adminEmails = getAdminEmails();
  res.json({ success: true, adminEmails });
});

// Add new admin email (admin only)
router.post('/emails', isAuthenticated, isAdmin, (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const added = addAdminEmail(email);
  
  if (!added) {
    throw new ApiError(400, 'Email already exists in admin list');
  }

  res.json({ 
    success: true, 
    message: 'Admin email added successfully',
    adminEmails: getAdminEmails()
  });
});

// Remove admin email (admin only)
router.delete('/emails/:email', isAuthenticated, isAdmin, (req, res) => {
  const { email } = req.params;
  
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const removed = removeAdminEmail(email);
  
  if (!removed) {
    throw new ApiError(404, 'Email not found in admin list');
  }

  res.json({ 
    success: true, 
    message: 'Admin email removed successfully',
    adminEmails: getAdminEmails()
  });
});

export default router; 