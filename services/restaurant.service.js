const BaseService = require('../utils/BaseService');
const db = require('../config/database');
const { calculateDistance } = require('../utils/helpers');


class RestaurantService extends BaseService {
  constructor() {
    super('restaurants');  // Collection name
  }

  /**
   * Validate before create restaurant
   */
  async validateCreate(data) {
    // Check category exists
    const category = db.findById('categories', data.categoryId);
    if (!category) {
      return {
        success: false,
        message: 'Category not found',
        statusCode: 404
      };
    }

    // Check duplicate name
    const existing = db.findOne('restaurants', { name: data.name });
    if (existing) {
      return {
        success: false,
        message: 'Restaurant name already exists',
        statusCode: 400
      };
    }

    return { success: true };
  }

  /**
 * Transform data before create
 */
  async beforeCreate(data) {
    return {
      ...data,
      rating: 0,
      totalReviews: 0,
      isOpen: data.isOpen !== undefined ? data.isOpen : true,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Validate before delete
   */
  async validateDelete(id) {
    // Check if has products
    const products = db.findMany('products', { restaurantId: parseInt(id) });
    if (products.length > 0) {
      return {
        success: false,
        message: 'Cannot delete restaurant with existing products',
        statusCode: 400
      };
    }

    return { success: true };
  }
  /**
 * Get nearby restaurants (GPS)
 */
  async getNearby(latitude, longitude, radius = 5, options = {}) {
    try {
      const allRestaurants = db.findAll('restaurants');

      // Calculate distance for each
      const restaurantsWithDistance = allRestaurants
        .map(restaurant => {
          if (!restaurant.latitude || !restaurant.longitude) return null;

          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            restaurant.latitude,
            restaurant.longitude
          );

          return {
            ...restaurant,
            distance: parseFloat(distance.toFixed(2))
          };
        })
        .filter(r => r && r.distance <= parseFloat(radius))
        .sort((a, b) => a.distance - b.distance);

      // Apply additional filters if provided
      let filtered = restaurantsWithDistance;
      if (options.filter) {
        filtered = db.applyFilters(restaurantsWithDistance, options.filter);
      }

      // Apply pagination
      const pagination = db.applyPagination(
        filtered,
        options.page || 1,
        options.limit || 10
      );

      return {
        success: true,
        data: pagination.data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: pagination.totalPages,
          hasNext: pagination.hasNext,
          hasPrev: pagination.hasPrev
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
     * Get restaurant menu (products)
     */
  async getMenu(restaurantId, options = {}) {
    try {
      // Check restaurant exists
      const restaurant = await this.findById(restaurantId);
      if (!restaurant.success) {
        return restaurant;
      }

      // Get products with filters
      const result = db.findAllAdvanced('products', {
        ...options,
        filter: {
          ...options.filter,
          restaurantId: parseInt(restaurantId)
        }
      });

      return {
        success: true,
        data: result.data,
        pagination: result.pagination
      };
    } catch (error) {
      throw error;
    }
  }

  /**
  * Update restaurant rating (called after review)
  */
  async updateRating(restaurantId) {
    try {
      const reviews = db.findMany('reviews', { restaurantId: parseInt(restaurantId) });

      if (reviews.length === 0) {
        db.update('restaurants', restaurantId, {
          rating: 0,
          totalReviews: 0
        });
        return;
      }

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      db.update('restaurants', restaurantId, {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length
      });

      return {
        success: true,
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RestaurantService();