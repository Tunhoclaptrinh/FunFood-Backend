// UPDATED: Support both Restaurant & Product
const BaseService = require('../utils/BaseService');
const db = require('../config/database');

class ReviewService extends BaseService {
  constructor() {
    super('reviews');
  }

  /**
   * Validate before create
   * Support both restaurant and product reviews
   */
  async validateCreate(data) {
    const { type, restaurantId, productId, userId } = data;

    // Validate type
    if (!['restaurant', 'product'].includes(type)) {
      return {
        success: false,
        message: 'Type must be "restaurant" or "product"',
        statusCode: 400
      };
    }

    // Validate restaurant exists
    const restaurant = db.findById('restaurants', restaurantId);
    if (!restaurant) {
      return {
        success: false,
        message: 'Restaurant not found',
        statusCode: 404
      };
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        message: 'Rating must be between 1 and 5',
        statusCode: 400
      };
    }

    // If product review, validate product exists
    if (type === 'product') {
      if (!productId) {
        return {
          success: false,
          message: 'Product ID is required for product review',
          statusCode: 400
        };
      }

      const product = db.findById('products', productId);
      if (!product) {
        return {
          success: false,
          message: 'Product not found',
          statusCode: 404
        };
      }

      // Check product belongs to restaurant
      if (product.restaurantId !== parseInt(restaurantId)) {
        return {
          success: false,
          message: 'Product does not belong to this restaurant',
          statusCode: 400
        };
      }

      // Check duplicate product review
      const existingReview = db.findOne('reviews', {
        userId: parseInt(userId),
        type: 'product',
        productId: parseInt(productId)
      });

      if (existingReview) {
        return {
          success: false,
          message: 'You have already reviewed this product',
          statusCode: 400
        };
      }
    }

    // If restaurant review, check duplicate
    if (type === 'restaurant') {
      const existingReview = db.findOne('reviews', {
        userId: parseInt(userId),
        type: 'restaurant',
        restaurantId: parseInt(restaurantId)
      });

      if (existingReview) {
        return {
          success: false,
          message: 'You have already reviewed this restaurant',
          statusCode: 400
        };
      }
    }

    return { success: true };
  }

  /**
   * Transform data before create
   */
  async beforeCreate(data) {
    return {
      ...data,
      type: data.type || 'restaurant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Hook after create - update ratings
   */
  async afterCreate(review) {
    // Update restaurant rating
    this.updateRestaurantRating(review.restaurantId);

    // Update product rating if it's a product review
    if (review.type === 'product' && review.productId) {
      this.updateProductRating(review.productId);
    }

    // Create notification
    db.create('notifications', {
      userId: review.userId,
      title: 'Review Submitted',
      message: `Your ${review.type} review has been submitted successfully`,
      type: 'review',
      refId: review.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Hook after update - update ratings
   */
  async afterUpdate(review) {
    this.updateRestaurantRating(review.restaurantId);

    if (review.type === 'product' && review.productId) {
      this.updateProductRating(review.productId);
    }
  }

  /**
   * Update restaurant rating - calculate from all reviews
   */
  updateRestaurantRating(restaurantId) {
    const allReviews = db.findMany('reviews', {
      restaurantId: parseInt(restaurantId),
      type: 'restaurant'
    });

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

  /**
   * Update product rating - calculate from all reviews
   */
  updateProductRating(productId) {
    const allReviews = db.findMany('reviews', {
      productId: parseInt(productId),
      type: 'product'
    });

    if (allReviews.length === 0) {
      // Remove rating if no reviews
      const product = db.findById('products', productId);
      if (product) {
        db.update('products', productId, {
          rating: 0,
          totalReviews: 0
        });
      }
      return;
    }

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    db.update('products', productId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });
  }

  /**
   * Get reviews by type (unified method like favorites)
   */
  async getReviewsByType(type, options = {}) {
    if (!['restaurant', 'product'].includes(type)) {
      return {
        success: false,
        message: 'Invalid type. Must be "restaurant" or "product"',
        statusCode: 400
      };
    }

    const result = db.findAllAdvanced('reviews', {
      ...options,
      filter: {
        ...options.filter,
        type
      }
    });

    const enrichedReviews = result.data.map(review => {
      const user = db.findById('users', review.userId);
      let target = null;

      if (type === 'restaurant') {
        target = db.findById('restaurants', review.restaurantId);
      } else {
        target = db.findById('products', review.productId);
      }

      return {
        ...review,
        user: user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        } : null,
        target: target ? {
          id: target.id,
          name: target.name
        } : null
      };
    });

    return {
      success: true,
      data: enrichedReviews,
      pagination: result.pagination
    };
  }

  /**
   * Get restaurant reviews
   */
  async getRestaurantReviews(restaurantId, options = {}) {
    const result = db.findAllAdvanced('reviews', {
      ...options,
      filter: {
        ...options.filter,
        restaurantId: parseInt(restaurantId),
        type: 'restaurant'
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

  /**
   * Get product reviews
   */
  async getProductReviews(productId, options = {}) {
    const result = db.findAllAdvanced('reviews', {
      ...options,
      filter: {
        ...options.filter,
        productId: parseInt(productId),
        type: 'product'
      }
    });

    const enrichedReviews = result.data.map(review => {
      const user = db.findById('users', review.userId);
      const product = db.findById('products', review.productId);
      return {
        ...review,
        user: user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        } : null,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price
        } : null
      };
    });

    return {
      success: true,
      data: enrichedReviews,
      pagination: result.pagination
    };
  }

  /**
   * Get my reviews (by current user)
   */
  async getMyReviews(userId, options = {}) {
    const result = db.findAllAdvanced('reviews', {
      ...options,
      filter: {
        ...options.filter,
        userId: userId
      }
    });

    const enrichedReviews = result.data.map(review => {
      let target = null;

      if (review.type === 'restaurant') {
        target = db.findById('restaurants', review.restaurantId);
      } else {
        target = db.findById('products', review.productId);
      }

      return {
        ...review,
        target: target ? {
          id: target.id,
          name: target.name,
          type: review.type
        } : null
      };
    });

    return {
      success: true,
      data: enrichedReviews,
      pagination: result.pagination
    };
  }

  /**
   * Get review stats for dashboard
   */
  async getReviewStats(userId) {
    const myReviews = db.findMany('reviews', { userId });
    const restaurants = db.findMany('reviews', { userId, type: 'restaurant' });
    const products = db.findMany('reviews', { userId, type: 'product' });

    const stats = {
      total: myReviews.length,
      byType: {
        restaurant: restaurants.length,
        product: products.length
      },
      averageRating: myReviews.length > 0
        ? Math.round((myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length) * 10) / 10
        : 0,
      ratingDistribution: {
        1: myReviews.filter(r => r.rating === 1).length,
        2: myReviews.filter(r => r.rating === 2).length,
        3: myReviews.filter(r => r.rating === 3).length,
        4: myReviews.filter(r => r.rating === 4).length,
        5: myReviews.filter(r => r.rating === 5).length
      }
    };

    return {
      success: true,
      data: stats
    };
  }

  /**
   * Check if user reviewed
   */
  async checkReview(userId, type, targetId) {
    let query = {
      userId,
      type
    };

    if (type === 'restaurant') {
      query.restaurantId = parseInt(targetId);
    } else {
      query.productId = parseInt(targetId);
    }

    const review = db.findOne('reviews', query);

    return {
      success: true,
      hasReview: !!review,
      data: review || null
    };
  }

  /**
   * Delete review with cleanup
   */
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
    const productId = review.productId;

    db.delete('reviews', reviewId);

    // Update ratings
    this.updateRestaurantRating(restaurantId);
    if (productId && review.type === 'product') {
      this.updateProductRating(productId);
    }

    return {
      success: true,
      message: 'Review deleted successfully'
    };
  }
}

module.exports = new ReviewService();