// services/favorite.service.js
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
    const favorites = await db.findMany('favorites', { userId });

    const enriched = await Promise.all(favorites.map(async fav => {
      if (fav.type === 'restaurant') {
        const restaurant = await db.findById('restaurants', fav.referenceId);
        return {
          ...fav,
          restaurant: restaurant || null,
          product: null
        };
      } else if (fav.type === 'product') {
        const product = await db.findById('products', fav.referenceId);
        const restaurant = product ? await db.findById('restaurants', product.restaurantId) : null;

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
    }));

    return {
      success: true,
      data: enriched.filter(item => item.restaurant !== null || item.product !== null)
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

    const favorites = await db.findMany('favorites', { userId, type });

    const enriched = await Promise.all(favorites.map(async fav => {
      if (type === 'restaurant') {
        const restaurant = await db.findById('restaurants', fav.referenceId);
        return {
          ...fav,
          item: restaurant
        };
      } else {
        const product = await db.findById('products', fav.referenceId);
        const restaurant = product ? await db.findById('restaurants', product.restaurantId) : null;

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
    }));

    return {
      success: true,
      data: enriched.filter(item => item.item !== null)
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

    const favorites = await db.findMany('favorites', { userId, type });
    const ids = favorites.map(f => f.referenceId);

    return {
      success: true,
      data: ids
    };
  }

  /**
   * Add to favorites
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
    const item = await db.findById(
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
    const existing = await db.findOne('favorites', {
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

    const favorite = await db.create('favorites', {
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
   * Remove from favorites
   */
  async removeFavorite(userId, type, referenceId) {
    const favorite = await db.findOne('favorites', {
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

    await db.delete('favorites', favorite.id);

    return {
      success: true,
      message: `${type} removed from favorites`
    };
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite(userId, type, referenceId) {
    if (!['restaurant', 'product'].includes(type)) {
      return {
        success: false,
        message: 'Invalid type',
        statusCode: 400
      };
    }

    const favorite = await db.findOne('favorites', {
      userId,
      type,
      referenceId: parseInt(referenceId)
    });

    if (favorite) {
      // Remove
      await db.delete('favorites', favorite.id);
      return {
        success: true,
        message: `${type} removed from favorites`,
        isFavorite: false
      };
    } else {
      // Add
      const item = await db.findById(
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

      const newFavorite = await db.create('favorites', {
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
    const favorite = await db.findOne('favorites', {
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
    const validTypes = {
      restaurant: 'restaurants',
      product: 'products'
    };

    if (!validTypes[type]) {
      return {
        success: false,
        message: 'Invalid type',
        statusCode: 400
      };
    }

    // Lấy tất cả favorites
    const allFavorites = await db.findAll('favorites');
    const typedFavorites = allFavorites.filter(f => f.type === type);

    // Đếm lượt yêu thích theo referenceId
    const counts = new Map();
    for (const fav of typedFavorites) {
      counts.set(fav.referenceId, (counts.get(fav.referenceId) || 0) + 1);
    }

    // Lấy top referenceId theo số lượt yêu thích
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const trending = await Promise.all(
      sorted.map(async ([refId, count]) => {
        const item = await db.findById(validTypes[type], refId);

        if (!item) return null;

        // Trường hợp product cần thêm thông tin restaurant
        if (type === 'product') {
          const restaurant = await db.findById('restaurants', item.restaurantId);
          return {
            item: {
              ...item,
              restaurant: restaurant
                ? { id: restaurant.id, name: restaurant.name }
                : null
            },
            favoriteCount: count,
            type
          };
        }

        // Trường hợp restaurant
        return {
          item,
          favoriteCount: count,
          type
        };
      })
    );

    return {
      success: true,
      data: trending.filter(x => x !== null)
    };
  }


  /**
   * Get favorite statistics
   */
  async getFavoriteStats(userId) {
    const favorites = await db.findMany('favorites', { userId });

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
    const favorites = await db.findMany('favorites', { userId });

    if (favorites.length === 0) {
      return {
        success: true,
        message: 'No favorites to clear'
      };
    }

    await Promise.all(
      favorites.map(fav => db.delete('favorites', fav.id))
    );

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

    const favorites = await db.findMany('favorites', { userId, type });

    if (favorites.length === 0) {
      return {
        success: true,
        message: `No ${type} favorites to clear`
      };
    }

    await Promise.all(
      favorites.map(fav => db.delete('favorites', fav.id))
    );

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