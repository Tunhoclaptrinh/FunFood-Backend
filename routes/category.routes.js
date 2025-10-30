const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');
const categoryController = require('../controllers/category.controller');
const importExportController = require('../controllers/importExport.controller');

// ==================== IMPORT/EXPORT ROUTES (ADMIN ONLY) ====================

router.get('/template', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'categories';
  importExportController.downloadTemplate(req, res, next);
});

router.get('/schema', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'categories';
  importExportController.getSchema(req, res, next);
});

router.post('/import', protect, authorize('admin'),
  importExportController.getUploadMiddleware(),
  (req, res, next) => {
    req.params.entity = 'categories';
    importExportController.importData(req, res, next);
  }
);

router.get('/export', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'categories';
  importExportController.exportData(req, res, next);
});

// ==================== ORIGINAL CRUD ROUTES ====================

router.get('/', categoryController.getAll);
router.get('/search', categoryController.search);
router.get('/:id', categoryController.getById);
router.post('/', protect, authorize('admin'), validation.category.create, categoryController.create);
router.put('/:id', protect, authorize('admin'), validation.category.update, categoryController.update);
router.delete('/:id', protect, authorize('admin'), categoryController.delete);

module.exports = router;