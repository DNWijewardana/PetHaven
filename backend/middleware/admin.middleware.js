import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware to check if user has admin privileges
 */
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required before checking admin status');
    }
    
    // Check if user has admin role or isAdmin flag
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      throw new ApiError(403, 'Admin access required for this operation');
    }
    
    next();
  } catch (error) {
    next(error);
  }
}; 