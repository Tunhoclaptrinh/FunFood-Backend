// UPDATED: Unified routes like favorites
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');

// ==================== PUBLIC ROUTES ====================

// Get restaurant reviews
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

// Get product reviews
router.get('/product/:productId', reviewController.getProductReviews);

// Get reviews by type (restaurant or product)
router.get('/type/:type', reviewController.getByType);

// ==================== PROTECTED ROUTES ====================

// Apply authentication to all routes below
router.use(protect);

// Create review (restaurant or product)
router.post('/', validation.review.create, reviewController.create);

// Get my reviews
router.get('/user/me', reviewController.getMyReviews);

// Get my review stats
router.get('/user/stats', reviewController.getStats);

// Check if user reviewed
router.get('/check/:type/:targetId', reviewController.checkReview);

// Update review
router.put('/:id', validation.review.update, reviewController.update);

// Delete review
router.delete('/:id', reviewController.delete);

// ==================== ADMIN ROUTES ====================

// Get all reviews (admin only)
router.get('/', authorize('admin'), reviewController.getAll);

module.exports = router;