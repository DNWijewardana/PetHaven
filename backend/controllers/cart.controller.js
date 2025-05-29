import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get or create a user's cart
 */
export const getCart = asyncHandler(async (req, res) => {
  const { user } = req;
  
  if (!user || !user.email) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  // Find the user's cart or create a new one
  let cart = await Cart.findOne({ user: user.email });
  
  if (!cart) {
    cart = await Cart.create({
      user: user.email,
      items: []
    });
  }
  
  // Populate product details for cart items
  await cart.populate('items.product');
  
  // Calculate totals
  const totals = await cart.calculateTotals();
  
  res.status(200).json({
    success: true,
    cart: {
      _id: cart._id,
      items: cart.items,
      ...totals
    }
  });
});

/**
 * Add a product to the cart
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { user } = req;
  const { productId, quantity = 1, prescriptionFile = null } = req.body;
  
  if (!user || !user.email) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }
  
  // Validate the product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Check if product requires prescription
  if (product.requiresPrescription && !prescriptionFile) {
    throw new ApiError(400, 'This product requires a prescription');
  }
  
  // Check if product is in stock
  if (!product.inStock || product.stockQuantity < quantity) {
    throw new ApiError(400, 'Product is out of stock or insufficient stock');
  }
  
  // Find or create the cart
  let cart = await Cart.findOne({ user: user.email });
  if (!cart) {
    cart = await Cart.create({ user: user.email, items: [] });
  }
  
  // Check if item is already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );
  
  if (existingItemIndex > -1) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
    
    // Update prescription file if provided
    if (prescriptionFile) {
      cart.items[existingItemIndex].prescriptionFile = prescriptionFile;
    }
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      prescriptionFile
    });
  }
  
  // Reset cart expiration
  cart.createdAt = Date.now();
  
  await cart.save();
  
  // Populate product details and calculate totals
  await cart.populate('items.product');
  const totals = await cart.calculateTotals();
  
  res.status(200).json({
    success: true,
    message: 'Product added to cart',
    cart: {
      _id: cart._id,
      items: cart.items,
      ...totals
    }
  });
});

/**
 * Update quantity of an item in the cart
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { user } = req;
  const { itemId, quantity } = req.body;
  
  if (!user || !user.email) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  if (!itemId || quantity === undefined) {
    throw new ApiError(400, 'Item ID and quantity are required');
  }
  
  // Validate quantity
  if (quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1');
  }
  
  // Find the cart
  const cart = await Cart.findOne({ user: user.email });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }
  
  // Find the item in the cart
  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }
  
  // Get product to check stock
  const product = await Product.findById(cart.items[itemIndex].product);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Check if requested quantity is available
  if (quantity > product.stockQuantity) {
    throw new ApiError(400, 'Requested quantity exceeds available stock');
  }
  
  // Update quantity
  cart.items[itemIndex].quantity = quantity;
  
  // Reset cart expiration
  cart.createdAt = Date.now();
  
  await cart.save();
  
  // Populate product details and calculate totals
  await cart.populate('items.product');
  const totals = await cart.calculateTotals();
  
  res.status(200).json({
    success: true,
    message: 'Cart item updated',
    cart: {
      _id: cart._id,
      items: cart.items,
      ...totals
    }
  });
});

/**
 * Remove an item from the cart
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  const { user } = req;
  const { itemId } = req.params;
  
  if (!user || !user.email) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  if (!itemId) {
    throw new ApiError(400, 'Item ID is required');
  }
  
  // Find the cart
  const cart = await Cart.findOne({ user: user.email });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }
  
  // Find the item in the cart
  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }
  
  // Remove item
  cart.items.splice(itemIndex, 1);
  
  // Reset cart expiration
  cart.createdAt = Date.now();
  
  await cart.save();
  
  // Populate product details and calculate totals
  await cart.populate('items.product');
  const totals = await cart.calculateTotals();
  
  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    cart: {
      _id: cart._id,
      items: cart.items,
      ...totals
    }
  });
});

/**
 * Clear the cart
 */
export const clearCart = asyncHandler(async (req, res) => {
  const { user } = req;
  
  if (!user || !user.email) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  // Find the cart
  const cart = await Cart.findOne({ user: user.email });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }
  
  // Clear items
  cart.items = [];
  
  // Reset cart expiration
  cart.createdAt = Date.now();
  
  await cart.save();
  
  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    cart: {
      _id: cart._id,
      items: [],
      subtotal: 0,
      charityAmount: 0,
      total: 0
    }
  });
}); 