// routes/favorite.routes.js - UPDATED: Unified routes
const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');
router.use(protect); // All routes need auth

router.get('/', favoriteController.getFavorites);
router.get('/:type', favoriteController.getFavoritesByType);
router.get('/:type/ids', favoriteController.getFavoriteIds);
router.get('/trending/:type', favoriteController.getTrendingFavorites);
router.get('/stats/summary', favoriteController.getFavoriteStats);
router.get('/:type/:id/check', favoriteController.checkFavorite);

router.post('/:type/:id/toggle',
  validateFields('favorite', ['type']),
  favoriteController.toggleFavorite
);

router.post('/:type/:id',
  validateFields('favorite', ['type']),
  favoriteController.addFavorite
);

router.delete('/:type/:id', favoriteController.removeFavorite);
router.delete('/:type', favoriteController.clearByType);
router.delete('/', favoriteController.clearAll);

module.exports = router;