import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { 
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cart.controller.js';

const router = express.Router();

// All cart routes require authentication
router.use(isAuthenticated);

// Get user's cart
router.get('/', getCart);

// Add product to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update', updateCartItem);

// Remove item from cart
router.delete('/remove/:itemId', removeCartItem);

// Clear cart
router.delete('/clear', clearCart);

export default router; 