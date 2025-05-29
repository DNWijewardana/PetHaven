// Delete product (Admin only)
router.delete('/:productId', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    await Product.findByIdAndDelete(productId);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}); 