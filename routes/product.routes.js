const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');
const productController = require('../controllers/product.controller');

router.get('/', productController.getAll);
router.get('/search', productController.search);
router.get('/discounted', productController.getDiscounted);
router.get('/:id', productController.getById);
router.post('/', protect, authorize('admin'), validation.product.create, productController.create);
router.put('/:id', protect, authorize('admin'), validation.product.update, productController.update);
router.patch('/bulk/availability', protect, authorize('admin'), productController.bulkUpdateAvailability);
router.delete('/:id', protect, authorize('admin'), productController.delete);

module.exports = router;