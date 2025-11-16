const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const importExportController = require('../controllers/importExport.controller');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');


// Import/Export
router.get('/template', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'promotions';
  importExportController.downloadTemplate(req, res, next);
});

router.get('/schema', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'promotions';
  importExportController.getSchema(req, res, next);
});

router.post('/import',
  protect,
  authorize('admin'),
  importExportController.getUploadMiddleware(),
  (req, res, next) => {
    req.params.entity = 'promotions';
    importExportController.importData(req, res, next);
  }
);

router.get('/export',
  protect,
  authorize('admin'),
  (req, res, next) => {
    req.params.entity = 'promotions';
    importExportController.exportData(req, res, next);
  }
);

// Public routes
router.get('/', promotionController.getAll);
router.get('/active', promotionController.getActivePromotions);
router.get('/code/:code', promotionController.getByCode);

// Protected routes
router.post('/validate',
  protect,
  validateFields('promotion', ['code', 'orderValue']),
  promotionController.validatePromotion
);

// Admin routes
router.post('/',
  protect,
  authorize('admin'),
  validateSchema('promotion'),
  promotionController.create
);

router.put('/:id',
  protect,
  authorize('admin'),
  validateSchema('promotion'),
  promotionController.update
);

router.patch('/:id/toggle', protect, authorize('admin'), promotionController.toggleActive);
router.delete('/:id', protect, authorize('admin'), promotionController.delete);

module.exports = router;