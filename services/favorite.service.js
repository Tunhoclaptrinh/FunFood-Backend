const BaseService = require('../utils/BaseService');
const db = require('../config/database');

class FavoriteService extends BaseService {
  constructor() {
    super('favorites');
  }

  async getFavorites(userId, options = {}) {
    const favorites = db.findMany('favorites', { userId });

    const enrichedFavorites = favorites.map(fav => {
      const restaurant = db.findById('restaurants', fav.restaurantId);
      return {
        ...fav,
        restaurant: restaurant || null
      };
    });

    return {
      success: true,
      data: enrichedFavorites
    };
  }

  async getFavoriteRestaurantIds(userId) {
    const favorites = db.findMany('favorites', { userId });
    const restaurantIds = favorites.map(f => f.restaurantId);

    return {
      success: true,
      data: restaurantIds
    };
  }

  async addFavorite(userId, restaurantId) {
    const restaurant = db.findById('restaurants', restaurantId);
    if (!restaurant) {
      return {
        success: false,
        message: 'Restaurant not found',
        statusCode: 404
      };
    }

    const existing = db.findOne('favorites', {
      userId,
      restaurantId: parseInt(restaurantId)
    });

    if (existing) {
      return {
        success: false,
        message: 'Restaurant already in favorites',
        statusCode: 400
      };
    }

    const favorite = db.create('favorites', {
      userId,
      restaurantId: parseInt(restaurantId),
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Added to favorites',
      data: favorite
    };
  }

  async removeFavorite(userId, restaurantId) {
    const favorite = db.findOne('favorites', {
      userId,
      restaurantId: parseInt(restaurantId)
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
      message: 'Removed from favorites'
    };
  }

  async toggleFavorite(userId, restaurantId) {
    const favorite = db.findOne('favorites', {
      userId,
      restaurantId: parseInt(restaurantId)
    });

    if (favorite) {
      db.delete('favorites', favorite.id);
      return {
        success: true,
        message: 'Removed from favorites',
        isFavorite: false
      };
    } else {
      const restaurant = db.findById('restaurants', restaurantId);
      if (!restaurant) {
        return {
          success: false,
          message: 'Restaurant not found',
          statusCode: 404
        };
      }

      const newFavorite = db.create('favorites', {
        userId,
        restaurantId: parseInt(restaurantId),
        createdAt: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Added to favorites',
        isFavorite: true,
        data: newFavorite
      };
    }
  }

  async checkFavorite(userId, restaurantId) {
    const favorite = db.findOne('favorites', {
      userId,
      restaurantId: parseInt(restaurantId)
    });

    return {
      success: true,
      isFavorite: !!favorite,
      data: favorite
    };
  }

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
}

module.exports = new FavoriteService();