const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const importExportController = require('../controllers/importExport.controller');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');

// Import/Export
router.get('/template', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'users';
  importExportController.downloadTemplate(req, res, next);
});

router.get('/schema', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'users';
  importExportController.getSchema(req, res, next);
});

router.post('/import',
  protect,
  authorize('admin'),
  importExportController.getUploadMiddleware(),
  (req, res, next) => {
    req.params.entity = 'users';
    importExportController.importData(req, res, next);
  }
);

router.get('/export',
  protect,
  authorize('admin'),
  (req, res, next) => {
    req.params.entity = 'users';
    importExportController.exportData(req, res, next);
  }
);

// Admin routes
router.get('/', protect, authorize('admin'), userController.getAll);
router.get('/stats/summary', protect, authorize('admin'), userController.getUserStats);
router.patch('/:id/status', protect, authorize('admin'), userController.toggleUserStatus);
router.delete('/:id/permanent', protect, authorize('admin'), userController.permanentDeleteUser);

// User routes
router.get('/:id', protect, userController.getById);
router.get('/:id/activity', protect, userController.getUserActivity);

// Update profile - validate name, phone, address, avatar
router.put('/profile',
  protect,
  validateFields('user', ['name', 'phone', 'address', 'avatar']),
  userController.updateProfile
);

module.exports = router;