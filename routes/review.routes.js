const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');

/// Public routes
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/type/:type', reviewController.getByType);

// Protected routes
router.use(protect);

router.post('/',
  validateSchema('review'),
  reviewController.create
);

router.get('/user/me', reviewController.getMyReviews);
router.get('/user/stats', reviewController.getStats);
router.get('/check/:type/:targetId', reviewController.checkReview);

router.put('/:id',
  validateSchema('review'),
  reviewController.update
);

router.delete('/:id', reviewController.delete);

// Admin routes
router.get('/', authorize('admin'), reviewController.getAll);

module.exports = router;
