const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const restaurantController = require('../controllers/restaurant.controller');
const importExportController = require('../controllers/importExport.controller');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');


// Import/Export
router.get('/template', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'restaurants';
  importExportController.downloadTemplate(req, res, next);
});

router.get('/schema', protect, authorize('admin'), (req, res, next) => {
  req.params.entity = 'restaurants';
  importExportController.getSchema(req, res, next);
});

router.post('/import',
  protect,
  authorize('admin'),
  importExportController.getUploadMiddleware(),
  (req, res, next) => {
    req.params.entity = 'restaurants';
    importExportController.importData(req, res, next);
  }
);

router.get('/export',
  protect,
  authorize('admin'),
  (req, res, next) => {
    req.params.entity = 'restaurants';
    importExportController.exportData(req, res, next);
  }
);

// CRUD
router.get('/', restaurantController.getAll);
router.get('/nearby', restaurantController.getNearby);
router.get('/search', restaurantController.search);
router.get('/:id', restaurantController.getById);
router.get('/:id/products', restaurantController.getMenu);

router.post('/',
  protect,
  authorize('admin'),
  validateSchema('restaurant'),
  restaurantController.create
);

router.put('/:id',
  protect,
  authorize('admin'),
  validateSchema('restaurant'),
  restaurantController.update
);

router.delete('/:id', protect, authorize('admin'), restaurantController.delete);

module.exports = router;
