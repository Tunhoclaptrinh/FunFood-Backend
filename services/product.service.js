const BaseService = require('../utils/BaseService');
const db = require('../config/database');

/**
 * Product Service - Extend BaseService
 */
class ProductService extends BaseService {
  constructor() {
    super('products');
  }

  async validateCreate(data) {
    // Check restaurant exists
    const restaurant = db.findById('restaurants', data.restaurantId);
    if (!restaurant) {
      return {
        success: false,
        message: 'Restaurant not found',
        statusCode: 404
      };
    }

    // Check category exists
    if (data.categoryId) {
      const category = db.findById('categories', data.categoryId);
      if (!category) {
        return {
          success: false,
          message: 'Category not found',
          statusCode: 404
        };
      }
    }

    return { success: true };
  }

  async beforeCreate(data) {
    return {
      ...data,
      available: data.available !== undefined ? data.available : true,
      discount: data.discount || 0,
      createdAt: new Date().toISOString()
    };
  }

  async beforeUpdate(id, data) {
    return {
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Get products by restaurant
   */
  async getByRestaurant(restaurantId, options = {}) {
    try {
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
   * Get products with discount
   */
  async getDiscounted(options = {}) {
    try {
      const result = db.findAllAdvanced('products', {
        ...options,
        filter: {
          ...options.filter,
          discount_ne: 0,
          available: true
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
   * Get products by price range
   */
  async getByPriceRange(minPrice, maxPrice, options = {}) {
    try {
      const result = db.findAllAdvanced('products', {
        ...options,
        filter: {
          ...options.filter,
          price_gte: minPrice,
          price_lte: maxPrice
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
   * Bulk update availability
   */
  async bulkUpdateAvailability(productIds, available) {
    try {
      const updated = [];

      for (const id of productIds) {
        const product = db.update('products', id, {
          available,
          updatedAt: new Date().toISOString()
        });
        if (product) {
          updated.push(product);
        }
      }

      return {
        success: true,
        message: `${updated.length} products updated`,
        data: updated
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductService();