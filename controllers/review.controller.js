const { validationResult } = require('express-validator');
const db = require('../config/database');

exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const reviews = db.findMany('reviews', { restaurantId: parseInt(restaurantId) });

    // Enrich with user details
    const enrichedReviews = reviews.map(review => {
      const user = db.findById('users', review.userId);
      return {
        ...review,
        user: user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        } : null
      };
    });

    // Sort by date descending
    enrichedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: enrichedReviews.length,
      data: enrichedReviews
    });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { restaurantId, orderId, rating, comment } = req.body;

    // Check if restaurant exists
    const restaurant = db.findById('restaurants', restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user already reviewed this restaurant
    const existingReview = db.findOne('reviews', {
      userId: req.user.id,
      restaurantId: parseInt(restaurantId)
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this restaurant'
      });
    }

    const review = db.create('reviews', {
      userId: req.user.id,
      restaurantId: parseInt(restaurantId),
      orderId: orderId || null,
      rating,
      comment,
      createdAt: new Date().toISOString()
    });

    // Update restaurant rating
    const allReviews = db.findMany('reviews', { restaurantId: parseInt(restaurantId) });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    db.update('restaurants', restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const review = db.findById('reviews', req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization
    if (review.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const updated = db.update('reviews', req.params.id, {
      rating,
      comment
    });

    // Update restaurant rating
    const allReviews = db.findMany('reviews', { restaurantId: review.restaurantId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    db.update('restaurants', review.restaurantId, {
      rating: Math.round(avgRating * 10) / 10
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = db.findById('reviews', req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    db.delete('reviews', req.params.id);

    // Update restaurant rating
    const allReviews = db.findMany('reviews', { restaurantId: review.restaurantId });
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    db.update('restaurants', review.restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
