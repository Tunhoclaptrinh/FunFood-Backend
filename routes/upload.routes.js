const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Avatar upload (Customer only)
router.post('/avatar',
  protect,
  uploadController.getUploadMiddleware('avatar'),
  uploadController.uploadAvatar
);

// Product image (Admin & Manager)
router.post('/product/:productId',
  protect,
  authorize('admin', 'manager'),
  uploadController.getUploadMiddleware('product'),
  uploadController.uploadProductImage
);

// Restaurant image (Admin only)
router.post('/restaurant/:restaurantId',
  protect,
  authorize('admin'),
  uploadController.getUploadMiddleware('restaurant'),
  uploadController.uploadRestaurantImage
);

// Category image (Admin only)
router.post('/category/:categoryId',
  protect,
  authorize('admin'),
  uploadController.getUploadMiddleware('category'),
  uploadController.uploadCategoryImage
);

// Delete file (Admin only)
router.delete('/file',
  protect,
  authorize('admin'),
  uploadController.deleteFile
);

// Get file info
router.get('/file/info',
  protect,
  uploadController.getFileInfo
);

// Storage stats (Admin only)
router.get('/stats',
  protect,
  authorize('admin'),
  uploadController.getStorageStats
);

// Cleanup old files (Admin only)
router.post('/cleanup',
  protect,
  authorize('admin'),
  uploadController.cleanupOldFiles
);

module.exports = router;