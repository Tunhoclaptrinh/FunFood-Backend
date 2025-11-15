// routes/favorite.routes.js - UPDATED: Unified routes
const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// ==================== UNIFIED ROUTES ====================

// Get all favorites (both restaurants + products)
router.get('/', favoriteController.getFavorites);

// Get favorites by type
router.get('/:type', favoriteController.getFavoritesByType);

// Get favorite IDs by type (lightweight)
router.get('/:type/ids', favoriteController.getFavoriteIds);

// Get trending favorites
router.get('/trending/:type', favoriteController.getTrendingFavorites);

// Get favorite statistics
router.get('/stats/summary', favoriteController.getFavoriteStats);

// Check if item is favorited
router.get('/:type/:id/check', favoriteController.checkFavorite);

// Toggle favorite (add or remove)
router.post('/:type/:id/toggle', favoriteController.toggleFavorite);

// Add to favorites
router.post('/:type/:id', favoriteController.addFavorite);

// Remove from favorites
router.delete('/:type/:id', favoriteController.removeFavorite);

// Clear favorites by type
router.delete('/:type', favoriteController.clearByType);

// Clear all favorites
router.delete('/', favoriteController.clearAll);

module.exports = router;