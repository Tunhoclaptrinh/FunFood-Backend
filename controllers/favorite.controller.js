const db = require('../config/database');

exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = db.findMany('favorites', { userId: req.user.id });

    // Enrich with restaurant details
    const enrichedFavorites = favorites.map(fav => {
      const restaurant = db.findById('restaurants', fav.restaurantId);
      return {
        ...fav,
        restaurant: restaurant || null
      };
    });

    res.json({
      success: true,
      count: enrichedFavorites.length,
      data: enrichedFavorites
    });
  } catch (error) {
    next(error);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    // Check if restaurant exists
    const restaurant = db.findById('restaurants', restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if already favorited
    const existing = db.findOne('favorites', {
      userId: req.user.id,
      restaurantId: parseInt(restaurantId)
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant already in favorites'
      });
    }

    const favorite = db.create('favorites', {
      userId: req.user.id,
      restaurantId: parseInt(restaurantId)
    });

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: favorite
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const favorite = db.findOne('favorites', {
      userId: req.user.id,
      restaurantId: parseInt(restaurantId)
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    db.delete('favorites', favorite.id);

    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};

exports.checkFavorite = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const favorite = db.findOne('favorites', {
      userId: req.user.id,
      restaurantId: parseInt(restaurantId)
    });

    res.json({
      success: true,
      isFavorite: !!favorite
    });
  } catch (error) {
    next(error);
  }
};