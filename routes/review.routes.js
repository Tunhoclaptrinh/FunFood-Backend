const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);
router.post('/', protect, [
  body('restaurantId').notEmpty().withMessage('Restaurant is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required')
], reviewController.createReview);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;