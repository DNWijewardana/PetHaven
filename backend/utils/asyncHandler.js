/**
 * Async handler wrapper for Express route handlers
 * Automatically catches errors and passes them to the next middleware
 * @param {Function} fn - The async route handler function to wrap
 * @returns {Function} - Wrapped function that catches errors
 */
export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}; 