import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { isAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', isAdmin, userController.getAllUsers);

// Update admin status for a user
router.post('/update-admin-status', isAdmin, userController.updateAdminStatus);

// Admin stats
router.get('/stats', isAdmin, async (req, res) => {
  try {
    // This is a placeholder. In a real application, you would aggregate 
    // stats from your database collections
    const stats = {
      user_count: await getUserCount(),
      lost_count: await getLostPetsCount(),
      adopt_count: await getAdoptionCount(),
      verifications_count: await getVerificationsCount(),
      community_posts_count: await getCommunityPostsCount(),
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin statistics' });
  }
});

// Helper functions to get counts (these would need to be implemented based on your models)
async function getUserCount() {
  // This is a placeholder. Implement actual count from your User model
  return 0;
}

async function getLostPetsCount() {
  // This is a placeholder. Implement actual count from your LostPet model
  return 0;
}

async function getAdoptionCount() {
  // This is a placeholder. Implement actual count from your Adoption model
  return 0;
}

async function getVerificationsCount() {
  // This is a placeholder. Implement actual count from your Verification model
  return 0;
}

async function getCommunityPostsCount() {
  // This is a placeholder. Implement actual count from your Post model
  return 0;
}

export default router; 