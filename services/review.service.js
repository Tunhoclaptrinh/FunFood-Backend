const BaseService = require('../utils/BaseService');
const db = require('../config/database');

class ReviewService extends BaseService {
  constructor() {
    super('reviews');
  }

  async validateCreate(data) {
    const restaurant = db.findById('restaurants', data.restaurantId);
    if (!restaurant) {
      return {
        success: false,
        message: 'Restaurant not found',
        statusCode: 404
      };
    }

    const existingReview = db.findOne('reviews', {
      userId: data.userId,
      restaurantId: parseInt(data.restaurantId)
    });

    if (existingReview) {
      return {
        success: false,
        message: 'You have already reviewed this restaurant',
        statusCode: 400
      };
    }

    if (data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        message: 'Rating must be between 1 and 5',
        statusCode: 400
      };
    }

    return { success: true };
  }

  async beforeCreate(data) {
    return {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async afterCreate(review) {
    // Update restaurant rating
    this.updateRestaurantRating(review.restaurantId);

    // Create notification for user
    db.create('notifications', {
      userId: review.userId,
      title: 'Review Submitted',
      message: `Your review for restaurant has been submitted successfully`,
      type: 'review',
      refId: review.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  async afterUpdate(review) {
    this.updateRestaurantRating(review.restaurantId);
  }

  async afterDelete(reviewId) {
    // Get review data before it was deleted (we need restaurantId)
    // Since it's already deleted, we'll need to pass restaurantId separately
    // This is a limitation - in real app, we'd pass it in beforeDelete
  }

  updateRestaurantRating(restaurantId) {
    const allReviews = db.findMany('reviews', { restaurantId: parseInt(restaurantId) });

    if (allReviews.length === 0) {
      db.update('restaurants', restaurantId, {
        rating: 0,
        totalReviews: 0
      });
      return;
    }

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    db.update('restaurants', restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });
  }

  async getRestaurantReviews(restaurantId, options = {}) {
    const result = db.findAllAdvanced('reviews', {
      ...options,
      filter: {
        ...options.filter,
        restaurantId: parseInt(restaurantId)
      }
    });

    const enrichedReviews = result.data.map(review => {
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

    return {
      success: true,
      data: enrichedReviews,
      pagination: result.pagination
    };
  }

  async getMyReviews(userId, options = {}) {
    const result = db.findAllAdvanced('reviews', {
      ...options,
      filter: {
        ...options.filter,
        userId: userId
      }
    });

    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  async deleteReview(reviewId, userId, userRole) {
    const review = db.findById('reviews', reviewId);

    if (!review) {
      return {
        success: false,
        message: 'Review not found',
        statusCode: 404
      };
    }

    if (review.userId !== userId && userRole !== 'admin') {
      return {
        success: false,
        message: 'Not authorized to delete this review',
        statusCode: 403
      };
    }

    const restaurantId = review.restaurantId;
    db.delete('reviews', reviewId);

    // Update restaurant rating
    this.updateRestaurantRating(restaurantId);

    return {
      success: true,
      message: 'Review deleted successfully'
    };
  }
}

module.exports = new ReviewService();