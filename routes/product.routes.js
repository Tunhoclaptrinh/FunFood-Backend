const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');
const productController = require('../controllers/product.controller');
const importExportController = require('../controllers/importExport.controller');

// ==================== IMPORT/EXPORT ROUTES (ADMIN ONLY) ====================
// Must be before /:id routes to avoid conflicts

// Download template for import
router.get('/template', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'products';
  importExportController.downloadTemplate(req, res, next);
});

// Get schema (for building UI)
router.get('/schema', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'products';
  importExportController.getSchema(req, res, next);
});

// Import products from Excel/CSV
router.post('/import', protect, authorize('admin'),
  importExportController.getUploadMiddleware(),
  (req, res, next) => {
    req.params.entity = 'products';
    importExportController.importData(req, res, next);
  }
);

// Export products to Excel/CSV
router.get('/export', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'products';
  importExportController.exportData(req, res, next);
});

// ==================== ORIGINAL CRUD ROUTES ====================

router.get('/', productController.getAll);
router.get('/search', productController.search);
router.get('/discounted', productController.getDiscounted);
router.get('/:id', productController.getById);
router.post('/', protect, authorize('admin'), validation.product.create, productController.create);
router.put('/:id', protect, authorize('admin'), validation.product.update, productController.update);
router.patch('/bulk/availability', protect, authorize('admin'), productController.bulkUpdateAvailability);
router.delete('/:id', protect, authorize('admin'), productController.delete);

module.exports = router;