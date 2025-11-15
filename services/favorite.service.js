// services/favorite.service.js - UPDATED: Support both Restaurant & Product
const BaseService = require('../utils/BaseService');
const db = require('../config/database');

class FavoriteService extends BaseService {
  constructor() {
    super('favorites');
  }

  /**
   * Get all favorites (both restaurants and products)
   */
  async getFavorites(userId, options = {}) {
    const favorites = db.findMany('favorites', { userId });

    const enriched = favorites.map(fav => {
      if (fav.type === 'restaurant') {
        const restaurant = db.findById('restaurants', fav.referenceId);
        return {
          ...fav,
          restaurant: restaurant || null,
          product: null
        };
      } else if (fav.type === 'product') {
        const product = db.findById('products', fav.referenceId);
        const restaurant = product ? db.findById('restaurants', product.restaurantId) : null;

        return {
          ...fav,
          restaurant: null,
          product: product ? {
            ...product,
            restaurant: restaurant ? {
              id: restaurant.id,
              name: restaurant.name,
              rating: restaurant.rating
            } : null
          } : null
        };
      }
      return fav;
    }).filter(item => item.restaurant !== null || item.product !== null);

    return {
      success: true,
      data: enriched
    };
  }

  /**
   * Get favorites by type
   */
  async getFavoritesByType(userId, type, options = {}) {
    if (!['restaurant', 'product'].includes(type)) {
      return {
        success: false,
        message: 'Invalid type. Must be "restaurant" or "product"',
        statusCode: 400
      };
    }

    const favorites = db.findMany('favorites', {
      userId,
      type
    });

    const enriched = favorites.map(fav => {
      if (type === 'restaurant') {
        const restaurant = db.findById('restaurants', fav.referenceId);
        return {
          ...fav,
          item: restaurant
        };
      } else {
        const product = db.findById('products', fav.referenceId);
        const restaurant = product ? db.findById('restaurants', product.restaurantId) : null;

        return {
          ...fav,
          item: product ? {
            ...product,
            restaurant: restaurant ? {
              id: restaurant.id,
              name: restaurant.name
            } : null
          } : null
        };
      }
    }).filter(item => item.item !== null);

    return {
      success: true,
      data: enriched
    };
  }

  /**
   * Get favorite IDs by type (lightweight)
   */
  async getFavoriteIds(userId, type) {
    if (!['restaurant', 'product'].includes(type)) {
      return {
        success: false,
        message: 'Invalid type',
        statusCode: 400
      };
    }

    const favorites = db.findMany('favorites', {
      userId,
      type
    });

    const ids = favorites.map(f => f.referenceId);

    return {
      success: true,
      data: ids
    };
  }

  /**
   * Add to favorites (unified for both types)
   */
  async addFavorite(userId, type, referenceId) {
    // Validate type
    if (!['restaurant', 'product'].includes(type)) {
      return {
        success: false,
        message: 'Invalid type. Must be "restaurant" or "product"',
        statusCode: 400
      };
    }

    // Check if item exists
    const item = db.findById(
      type === 'restaurant' ? 'restaurants' : 'products',
      referenceId
    );

    if (!item) {
      return {
        success: false,
        message: `${type} not found`,
        statusCode: 404
      };
    }

    // Check duplicate
    const existing = db.findOne('favorites', {
      userId,
      type,
      referenceId: parseInt(referenceId)
    });

    if (existing) {
      return {
        success: false,
        message: `${type} already in favorites`,
        statusCode: 400
      };
    }

    const favorite = db.create('favorites', {
      userId,
      type,
      referenceId: parseInt(referenceId),
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `${type} added to favorites`,
      data: favorite
    };
  }

  /**
   * Remove from favorites (unified)
   */
  async removeFavorite(userId, type, referenceId) {
    const favorite = db.findOne('favorites', {
      userId,
      type,
      referenceId: parseInt(referenceId)
    });

    if (!favorite) {
      return {
        success: false,
        message: 'Favorite not found',
        statusCode: 404
      };
    }

    db.delete('favorites', favorite.id);

    return {
      success: true,
      message: `${type} removed from favorites`
    };
  }

  /**
   * Toggle favorite (unified)
   */
  async toggleFavorite(userId, type, referenceId) {
    // Validate type
    if (!['restaurant', 'product'].includes(type)) {
      return {
        success: false,
        message: 'Invalid type',
        statusCode: 400
      };
    }

    const favorite = db.findOne('favorites', {
      userId,
      type,
      referenceId: parseInt(referenceId)
    });

    if (favorite) {
      // Remove
      db.delete('favorites', favorite.id);
      return {
        success: true,
        message: `${type} removed from favorites`,
        isFavorite: false
      };
    } else {
      // Add
      const item = db.findById(
        type === 'restaurant' ? 'restaurants' : 'products',
        referenceId
      );

      if (!item) {
        return {
          success: false,
          message: `${type} not found`,
          statusCode: 404
        };
      }

      const newFavorite = db.create('favorites', {
        userId,
        type,
        referenceId: parseInt(referenceId),
        createdAt: new Date().toISOString()
      });

      return {
        success: true,
        message: `${type} added to favorites`,
        isFavorite: true,
        data: newFavorite
      };
    }
  }

  /**
   * Check if item is favorited
   */
  async checkFavorite(userId, type, referenceId) {
    const favorite = db.findOne('favorites', {
      userId,
      type,
      referenceId: parseInt(referenceId)
    });

    return {
      success: true,
      isFavorite: !!favorite,
      data: favorite
    };
  }

  /**
   * Get trending favorites by type
   */
  async getTrendingFavorites(type, limit = 10) {
    if (!['restaurant', 'product'].includes(type)) {
      return {
        success: false,
        message: 'Invalid type',
        statusCode: 400
      };
    }

    const allFavorites = db.findAll('favorites');
    const typedFavorites = allFavorites.filter(f => f.type === type);

    // Count by referenceId
    const counts = {};
    typedFavorites.forEach(fav => {
      counts[fav.referenceId] = (counts[fav.referenceId] || 0) + 1;
    });

    // Sort and get top items
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const trending = sorted.map(([refId, count]) => {
      const item = db.findById(
        type === 'restaurant' ? 'restaurants' : 'products',
        parseInt(refId)
      );

      if (!item) return null;

      if (type === 'product') {
        const restaurant = db.findById('restaurants', item.restaurantId);
        return {
          item: {
            ...item,
            restaurant: restaurant ? {
              id: restaurant.id,
              name: restaurant.name
            } : null
          },
          favoriteCount: count,
          type: 'product'
        };
      }

      return {
        item,
        favoriteCount: count,
        type: 'restaurant'
      };
    }).filter(item => item !== null);

    return {
      success: true,
      data: trending
    };
  }

  /**
   * Get favorite statistics
   */
  async getFavoriteStats(userId) {
    const favorites = db.findMany('favorites', { userId });

    const stats = {
      total: favorites.length,
      byType: {
        restaurant: favorites.filter(f => f.type === 'restaurant').length,
        product: favorites.filter(f => f.type === 'product').length
      }
    };

    return {
      success: true,
      data: stats
    };
  }

  /**
   * Clear all favorites
   */
  async clearAll(userId) {
    const favorites = db.findMany('favorites', { userId });

    if (favorites.length === 0) {
      return {
        success: true,
        message: 'No favorites to clear'
      };
    }

    favorites.forEach(fav => db.delete('favorites', fav.id));

    return {
      success: true,
      message: 'All favorites cleared',
      cleared: favorites.length
    };
  }

  /**
   * Clear favorites by type
   */
  async clearByType(userId, type) {
    if (!['restaurant', 'product'].includes(type)) {
      return {
        success: false,
        message: 'Invalid type',
        statusCode: 400
      };
    }

    const favorites = db.findMany('favorites', { userId, type });

    if (favorites.length === 0) {
      return {
        success: true,
        message: `No ${type} favorites to clear`
      };
    }

    favorites.forEach(fav => db.delete('favorites', fav.id));

    return {
      success: true,
      message: `${type} favorites cleared`,
      cleared: favorites.length
    };
  }

  // ==================== LEGACY METHODS (Backward Compatibility) ====================

  /**
   * @deprecated Use getFavoritesByType(userId, 'restaurant') instead
   */
  async getFavoriteRestaurantIds(userId) {
    return this.getFavoriteIds(userId, 'restaurant');
  }

  /**
   * @deprecated Use addFavorite(userId, 'restaurant', restaurantId) instead
   */
  async addFavoriteRestaurant(userId, restaurantId) {
    return this.addFavorite(userId, 'restaurant', restaurantId);
  }

  /**
   * @deprecated Use removeFavorite(userId, 'restaurant', restaurantId) instead
   */
  async removeFavoriteRestaurant(userId, restaurantId) {
    return this.removeFavorite(userId, 'restaurant', restaurantId);
  }

  /**
   * @deprecated Use toggleFavorite(userId, 'restaurant', restaurantId) instead
   */
  async toggleFavoriteRestaurant(userId, restaurantId) {
    return this.toggleFavorite(userId, 'restaurant', restaurantId);
  }

  /**
   * @deprecated Use checkFavorite(userId, 'restaurant', restaurantId) instead
   */
  async checkFavoriteRestaurant(userId, restaurantId) {
    return this.checkFavorite(userId, 'restaurant', restaurantId);
  }
}

module.exports = new FavoriteService();