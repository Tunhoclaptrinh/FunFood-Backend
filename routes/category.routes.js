const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const categoryController = require('../controllers/category.controller');
const importExportController = require('../controllers/importExport.controller');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');

// Import/Export
router.get('/template', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'categories';
  importExportController.downloadTemplate(req, res, next);
});

router.get('/schema', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'categories';
  importExportController.getSchema(req, res, next);
});

router.post('/import',
  protect,
  authorize('admin'),
  importExportController.getUploadMiddleware(),
  (req, res, next) => {
    req.params.entity = 'categories';
    importExportController.importData(req, res, next);
  }
);

router.get('/export',
  protect,
  authorize('admin'),
  (req, res, next) => {
    req.params.entity = 'categories';
    importExportController.exportData(req, res, next);
  }
);

// CRUD
router.get('/', categoryController.getAll);
router.get('/search', categoryController.search);
router.get('/:id', categoryController.getById);

router.post('/',
  protect,
  authorize('admin'),
  validateSchema('category'),
  categoryController.create
);

router.put('/:id',
  protect,
  authorize('admin'),
  validateSchema('category'),
  categoryController.update
);

router.delete('/:id', protect, authorize('admin'), categoryController.delete);

module.exports = router;