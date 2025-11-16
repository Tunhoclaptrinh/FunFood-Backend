const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const productController = require('../controllers/product.controller');
const importExportController = require('../controllers/importExport.controller');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');

// Import/Export
router.get('/template', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'products';
  importExportController.downloadTemplate(req, res, next);
});

router.get('/schema', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'products';
  importExportController.getSchema(req, res, next);
});

router.post('/import',
  protect,
  authorize('admin'),
  importExportController.getUploadMiddleware(),
  (req, res, next) => {
    req.params.entity = 'products';
    importExportController.importData(req, res, next);
  }
);

router.get('/export',
  protect,
  authorize('admin'),
  (req, res, next) => {
    req.params.entity = 'products';
    importExportController.exportData(req, res, next);
  }
);

// CRUD
router.get('/', productController.getAll);
router.get('/search', productController.search);
router.get('/discounted', productController.getDiscounted);
router.get('/:id', productController.getById);

router.post('/',
  protect,
  authorize('admin'),
  validateSchema('product'),
  productController.create
);

router.put('/:id',
  protect,
  authorize('admin'),
  validateSchema('product'),
  productController.update
);

router.patch('/bulk/availability',
  protect,
  authorize('admin'),
  productController.bulkUpdateAvailability
);

router.delete('/:id', protect, authorize('admin'), productController.delete);

module.exports = router;
