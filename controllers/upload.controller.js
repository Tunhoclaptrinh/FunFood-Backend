const uploadService = require('../services/upload.service');
const db = require('../config/database');

class UploadController {
  /**
   * Get upload middleware based on type
   */
  getUploadMiddleware(type) {
    return (req, res, next) => {
      const middleware = uploadService.getSingleUpload('image', type);
      middleware(req, res, (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        next();
      });
    };
  }

  /**
   * Upload avatar
   * POST /api/upload/avatar
   */
  uploadAvatar = async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const result = await uploadService.uploadAvatar(req.file, req.user.id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      // Update user avatar in database
      const updatedUser = db.update('users', req.user.id, {
        avatar: result.url,
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: result.url,
          filename: result.filename,
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            avatar: updatedUser.avatar
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload product image
   * POST /api/upload/product/:productId
   */
  uploadProductImage = async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { productId } = req.params;

      // Check product exists
      const product = db.findById('products', productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Manager check: must own the product's restaurant
      if (req.user.role === 'manager') {
        const restaurant = db.findOne('restaurants', {
          managerId: req.user.id,
          id: product.restaurantId
        });

        if (!restaurant) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to update this product'
          });
        }
      }

      const result = await uploadService.uploadProductImage(req.file, productId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      // Update product image in database
      const updatedProduct = db.update('products', productId, {
        image: result.url,
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Product image uploaded successfully',
        data: {
          url: result.url,
          filename: result.filename,
          product: {
            id: updatedProduct.id,
            name: updatedProduct.name,
            image: updatedProduct.image
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload restaurant image
   * POST /api/upload/restaurant/:restaurantId
   */
  uploadRestaurantImage = async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { restaurantId } = req.params;

      // Check restaurant exists
      const restaurant = db.findById('restaurants', restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const result = await uploadService.uploadRestaurantImage(req.file, restaurantId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      // Update restaurant image in database
      const updatedRestaurant = db.update('restaurants', restaurantId, {
        image: result.url,
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Restaurant image uploaded successfully',
        data: {
          url: result.url,
          filename: result.filename,
          restaurant: {
            id: updatedRestaurant.id,
            name: updatedRestaurant.name,
            image: updatedRestaurant.image
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload category image
   * POST /api/upload/category/:categoryId
   */
  uploadCategoryImage = async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { categoryId } = req.params;

      // Check category exists
      const category = db.findById('categories', categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const result = await uploadService.uploadCategoryImage(req.file, categoryId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      // Update category image in database
      const updatedCategory = db.update('categories', categoryId, {
        image: result.url,
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Category image uploaded successfully',
        data: {
          url: result.url,
          filename: result.filename,
          category: {
            id: updatedCategory.id,
            name: updatedCategory.name,
            image: updatedCategory.image
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete file
   * DELETE /api/upload/file?url=/uploads/avatars/file.jpg
   */
  deleteFile = async (req, res, next) => {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL parameter is required'
        });
      }

      const result = await uploadService.deleteFile(url);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get file info
   * GET /api/upload/file/info?url=/uploads/avatars/file.jpg
   */
  getFileInfo = async (req, res, next) => {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL parameter is required'
        });
      }

      const result = await uploadService.getFileInfo(url);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get storage statistics
   * GET /api/upload/stats
   */
  getStorageStats = async (req, res, next) => {
    try {
      const result = await uploadService.getStorageStats();

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cleanup old files
   * POST /api/upload/cleanup
   */
  cleanupOldFiles = async (req, res, next) => {
    try {
      const { days = 30 } = req.body;

      const result = await uploadService.cleanupOldFiles(days);

      res.json({
        success: true,
        message: result.message,
        data: {
          deletedCount: result.deletedCount
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UploadController();