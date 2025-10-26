const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', restaurantController.getRestaurants);
router.get('/search', restaurantController.searchRestaurants);
router.get('/:id', restaurantController.getRestaurant);
router.get('/:id/products', restaurantController.getRestaurantProducts);
router.get('/nearby', restaurantController.getNearbyRestaurants);
router.post('/', protect, authorize('admin'), restaurantController.createRestaurant);
router.put('/:id', protect, authorize('admin'), restaurantController.updateRestaurant);
router.delete('/:id', protect, authorize('admin'), restaurantController.deleteRestaurant);

module.exports = router;