import { ApiError } from '../utils/ApiError.js';
import { isAdminEmail } from '../utils/adminConfig.js';

// Middleware to check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
  try {
    // Get user data from request body
    const user = req.body.user || req.body.author;
    
    if (!user || !user.email) {
      throw new ApiError(401, 'Authentication required');
    }

    // Set user data in request object
    req.user = {
      _id: user.sub || user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      isAdmin: isAdminEmail(user.email)
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(new ApiError(401, 'Authentication failed'));
  }
};

/**
 * Middleware to check if user has admin privileges
 */
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required before checking admin status');
    }
    
    // Check if user has admin email
    if (!isAdminEmail(req.user.email)) {
      throw new ApiError(403, 'Admin access required for this operation');
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    next(new ApiError(401, 'Authentication failed'));
  }
}; 