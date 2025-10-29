const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { protect } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');

router.get('/', protect, favoriteController.getFavorites);
router.get('/restaurants', protect, favoriteController.getFavoriteRestaurantIds);
router.get('/check/:restaurantId', protect, favoriteController.checkFavorite);
router.post('/:restaurantId', protect, favoriteController.addFavorite);
router.post('/toggle/:restaurantId', protect, favoriteController.toggleFavorite);
router.delete('/:restaurantId', protect, favoriteController.removeFavorite);
router.delete('/', protect, favoriteController.clearAll)

module.exports = router;