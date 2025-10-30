const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');
const importExportController = require('../controllers/importExport.controller');

// ==================== IMPORT/EXPORT ROUTES (ADMIN ONLY) ====================

router.get('/template', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'promotions';
  importExportController.downloadTemplate(req, res, next);
});

router.get('/schema', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'promotions';
  importExportController.getSchema(req, res, next);
});

router.post('/import', protect, authorize('admin'),
  importExportController.getUploadMiddleware(),
  (req, res, next) => {
    req.params.entity = 'promotions';
    importExportController.importData(req, res, next);
  }
);

router.get('/export', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'promotions';
  importExportController.exportData(req, res, next);
});

// ==================== ORIGINAL CRUD ROUTES ====================

// Public routes
router.get('/', promotionController.getAll);
router.get('/active', promotionController.getActivePromotions);
router.get('/code/:code', promotionController.getByCode);

// Protected routes
router.post('/validate', protect, validation.promotion.validate, promotionController.validatePromotion);

// Admin routes
router.post('/', protect, authorize('admin'), validation.promotion.create, promotionController.create);
router.put('/:id', protect, authorize('admin'), promotionController.update);
router.patch('/:id/toggle', protect, authorize('admin'), promotionController.toggleActive);
router.delete('/:id', protect, authorize('admin'), promotionController.delete);

module.exports = router;