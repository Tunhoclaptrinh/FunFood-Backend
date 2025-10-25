const db = require('../config/database');

exports.getRestaurants = async (req, res, next) => {
  try {
    const { categoryId, isOpen, minRating } = req.query;
    let restaurants = db.findAll('restaurants');

    // Filter by category
    if (categoryId) {
      restaurants = restaurants.filter(r => r.categoryId === parseInt(categoryId));
    }

    // Filter by open status
    if (isOpen !== undefined) {
      restaurants = restaurants.filter(r => r.isOpen === (isOpen === 'true'));
    }

    // Filter by rating
    if (minRating) {
      restaurants = restaurants.filter(r => r.rating >= parseFloat(minRating));
    }

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

exports.searchRestaurants = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const restaurants = db.findAll('restaurants').filter(r =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.description.toLowerCase().includes(q.toLowerCase())
    );

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = db.findById('restaurants', req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantProducts = async (req, res, next) => {
  try {
    const restaurant = db.findById('restaurants', req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const products = db.findMany('products', { restaurantId: parseInt(req.params.id) });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

exports.createRestaurant = async (req, res, next) => {
  try {
    const restaurant = db.create('restaurants', {
      ...req.body,
      rating: 0,
      totalReviews: 0,
      isOpen: true
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = db.update('restaurants', req.params.id, req.body);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const result = db.delete('restaurants', req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};