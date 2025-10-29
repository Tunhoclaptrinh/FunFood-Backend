const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');

// Public routes
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

// Protected routes
router.get('/', protect, authorize('admin'), reviewController.getAll);
router.get('/user/me', protect, reviewController.getMyReviews);
router.post('/', protect, validation.review.create, reviewController.create);
router.put('/:id', protect, validation.review.update, reviewController.update);
router.delete('/:id', protect, reviewController.delete);

module.exports = router;