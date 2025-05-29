import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  updateProductStock,
  addProductRating,
  getRelatedProducts,
  getProductsBySeller
} from '../controllers/product.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/seller/:userId', getProductsBySeller);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

// Protected routes - require authentication
router.post('/:id/rating', isAuthenticated, addProductRating);

// User and Admin routes
router.post('/', isAuthenticated, createProduct); // Both users and admins can create products
router.put('/:id', isAuthenticated, updateProduct); // Owner verification happens in controller
router.delete('/:id', isAuthenticated, deleteProduct); // Owner verification happens in controller

// Admin-only routes
router.patch('/:id/stock', isAuthenticated, isAdmin, updateProductStock);

export default router; 