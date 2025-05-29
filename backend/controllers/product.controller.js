import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all products with filtering, sorting, and pagination
export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    category,
    petType,
    minPrice,
    maxPrice,
    inStock,
    brand,
    featured,
    search
  } = req.query;

  const queryObject = {};

  // Apply filters
  if (category) queryObject.category = category;
  if (petType) queryObject.petType = petType;
  if (minPrice && maxPrice) {
    queryObject.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
  } else if (minPrice) {
    queryObject.price = { $gte: Number(minPrice) };
  } else if (maxPrice) {
    queryObject.price = { $lte: Number(maxPrice) };
  }
  if (inStock === 'true') queryObject.inStock = true;
  if (brand) queryObject.brand = brand;
  if (featured === 'true') queryObject.featured = true;
  
  // Search functionality
  if (search) {
    queryObject.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  
  // Execute query with pagination
  const products = await Product.find(queryObject)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));
  
  // Get total count for pagination
  const totalProducts = await Product.countDocuments(queryObject);
  
  res.status(200).json({
    success: true,
    count: products.length,
    totalProducts,
    totalPages: Math.ceil(totalProducts / Number(limit)),
    currentPage: Number(page),
    products
  });
});

// Get a single product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  res.status(200).json({
    success: true,
    product
  });
});

// Create a new product
export const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  
  console.log('Product data received:', JSON.stringify(productData, null, 2));
  
  // Ensure stockQuantity logic is consistent with inStock
  if (productData.stockQuantity > 0) {
    productData.inStock = true;
  } else {
    productData.inStock = false;
  }
  
  // Validate seller information for user listings
  if (productData.isUserListing && (!productData.seller || !productData.seller.name || !productData.seller.email)) {
    throw new ApiError(400, 'Seller information is required for user listings');
  }
  
  // Set the user ID in seller object if authenticated user is creating the listing
  if (productData.isUserListing && req.user) {
    // Use the Auth0 sub or _id directly without trying to convert to ObjectId
    productData.seller.user = req.user._id || req.user.sub;
  }
  
  const product = await Product.create(productData);
  
  res.status(201).json({
    success: true,
    product
  });
});

// Update a product
export const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const updateData = req.body;
  
  // Ensure stockQuantity logic is consistent with inStock
  if (updateData.stockQuantity !== undefined) {
    updateData.inStock = updateData.stockQuantity > 0;
  }
  
  // First, fetch the existing product to check ownership
  const existingProduct = await Product.findById(productId);
  
  if (!existingProduct) {
    throw new ApiError(404, 'Product not found');
  }
  
  // For user listings, check if the current user is the owner
  if (existingProduct.isUserListing && 
      existingProduct.seller && 
      existingProduct.seller.user && 
      req.user) {
    // Use string comparison for both ObjectId and string Auth0 IDs
    const userId = req.user._id || req.user.sub;
    const sellerId = existingProduct.seller.user.toString ? existingProduct.seller.user.toString() : existingProduct.seller.user;
    
    if (userId !== sellerId) {
      throw new ApiError(403, 'You are not authorized to update this product');
    }
  }
  
  // If updating seller info, ensure required fields are present
  if (updateData.seller) {
    if (!updateData.seller.name || !updateData.seller.email) {
      throw new ApiError(400, 'Seller name and email are required');
    }
    
    // Preserve the original seller user ID
    updateData.seller.user = existingProduct.seller.user;
  }
  
  const product = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    product
  });
});

// Delete a product
export const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  
  // First, fetch the product to check ownership
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // For user listings, check if the current user is the owner
  if (product.isUserListing && 
      product.seller && 
      product.seller.user && 
      req.user) {
    // Use string comparison for both ObjectId and string Auth0 IDs
    const userId = req.user._id || req.user.sub;
    const sellerId = product.seller.user.toString ? product.seller.user.toString() : product.seller.user;
    
    if (userId !== sellerId) {
      throw new ApiError(403, 'You are not authorized to delete this product');
    }
  }
  
  await Product.findByIdAndDelete(productId);
  
  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// Get featured products
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 8;
  
  const featuredProducts = await Product.find({ featured: true })
    .sort('-createdAt')
    .limit(Number(limit));
  
  res.status(200).json({
    success: true,
    count: featuredProducts.length,
    products: featuredProducts
  });
});

// Get products by category
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 10, page = 1 } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const products = await Product.find({ category })
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));
  
  const totalProducts = await Product.countDocuments({ category });
  
  res.status(200).json({
    success: true,
    count: products.length,
    totalProducts,
    totalPages: Math.ceil(totalProducts / Number(limit)),
    currentPage: Number(page),
    products
  });
});

// Update product stock
export const updateProductStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stockQuantity } = req.body;
  
  if (stockQuantity === undefined) {
    throw new ApiError(400, 'Stock quantity is required');
  }
  
  const product = await Product.findById(id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  product.stockQuantity = stockQuantity;
  product.inStock = stockQuantity > 0;
  
  await product.save();
  
  res.status(200).json({
    success: true,
    product
  });
});

// Add product rating and review
export const addProductRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, review } = req.body;
  const userId = req.user._id || req.user.sub; // Use Auth0 ID if _id not available
  
  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }
  
  const product = await Product.findById(id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Check if user already rated this product
  const existingRatingIndex = product.ratings.findIndex(
    item => {
      const itemUser = item.user.toString ? item.user.toString() : item.user;
      const currentUser = userId.toString ? userId.toString() : userId;
      return itemUser === currentUser;
    }
  );
  
  if (existingRatingIndex >= 0) {
    // Update existing rating
    product.ratings[existingRatingIndex].rating = rating;
    product.ratings[existingRatingIndex].review = review;
  } else {
    // Add new rating
    product.ratings.push({
      user: userId,
      rating,
      review
    });
  }
  
  // Calculate average rating
  await product.calculateAverageRating();
  
  res.status(200).json({
    success: true,
    product
  });
});

// Get related products (same category, different product)
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;
  
  const product = await Product.findById(id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  const relatedProducts = await Product.find({
    _id: { $ne: id },
    category: product.category
  })
    .limit(Number(limit));
  
  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    products: relatedProducts
  });
});

// Get products by seller
export const getProductsBySeller = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, page = 1 } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  // Query products where seller.user could be either ObjectId or string
  const products = await Product.find({ 'seller.user': userId })
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));
  
  const totalProducts = await Product.countDocuments({ 'seller.user': userId });
  
  res.status(200).json({
    success: true,
    count: products.length,
    totalProducts,
    totalPages: Math.ceil(totalProducts / Number(limit)),
    currentPage: Number(page),
    products
  });
}); 