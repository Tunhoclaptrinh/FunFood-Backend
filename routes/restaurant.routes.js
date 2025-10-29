const express = require('express');
const router = express.Router();
const validation = require('../middleware/validation.middleware');
const { protect, authorize } = require('../middleware/auth.middleware');
const restaurantController = require('../controllers/restaurant.controller');

router.get('/', restaurantController.getAll);
router.get('/nearby', restaurantController.getNearby);
router.get('/search', restaurantController.search);
router.get('/:id', restaurantController.getById);
router.get('/:id/products', restaurantController.getMenu);
router.post('/', protect, authorize('admin'), validation.restaurant.create, restaurantController.create);
router.put('/:id', protect, authorize('admin'), validation.restaurant.update, restaurantController.update);
router.delete('/:id', protect, authorize('admin'), restaurantController.delete);

module.exports = router;