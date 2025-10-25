const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, favoriteController.getFavorites);
router.post('/:restaurantId', protect, favoriteController.addFavorite);
router.delete('/:restaurantId', protect, favoriteController.removeFavorite);
router.get('/check/:restaurantId', protect, favoriteController.checkFavorite);

module.exports = router;