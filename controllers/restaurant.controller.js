const db = require('../config/database');

/**
 * GET /api/restaurants
 * Supports:
 * - ?_page=1&_limit=10 - Pagination
 * - ?_sort=rating&_order=desc - Sorting
 * - ?q=pizza - Full-text search
 * - ?categoryId=1 - Filter by category
 * - ?isOpen=true - Filter by status
 * - ?rating_gte=4.5 - Filter by minimum rating
 * - ?deliveryFee_lte=20000 - Filter by max delivery fee
 * - ?_embed=products - Include products
 * - ?_expand=category - Populate category
 */
exports.getRestaurants = async (req, res, next) => {
  try {
    const result = db.findAllAdvanced('restaurants', req.parsedQuery);

    res.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/restaurants/search?q=...
 * Search restaurants by name or description
 */
exports.searchRestaurants = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = db.findAllAdvanced('restaurants', {
      q,
      page: req.parsedQuery.page,
      limit: req.parsedQuery.limit,
      sort: req.parsedQuery.sort,
      order: req.parsedQuery.order
    });

    res.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/restaurants/:id
 * Supports ?_embed=products,reviews
 */
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = db.findById('restaurants', req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Apply relations if requested
    let enriched = restaurant;
    if (req.parsedQuery.embed) {
      const result = db.applyRelations([restaurant], 'restaurants', req.parsedQuery);
      enriched = result[0];
    }

    res.json({
      success: true,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/restaurants/:id/products
 * Get all products for a restaurant with pagination
 */
exports.getRestaurantProducts = async (req, res, next) => {
  try {
    const restaurant = db.findById('restaurants', req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const result = db.findAllAdvanced('products', {
      ...req.parsedQuery,
      filter: {
        ...req.parsedQuery.filter,
        restaurantId: parseInt(req.params.id)
      }
    });

    res.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/restaurants (Admin only)
 * Create new restaurant
 */
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

/**
 * PUT /api/restaurants/:id (Admin only)
 * Update restaurant
 */
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

/**
 * DELETE /api/restaurants/:id (Admin only)
 * Delete restaurant
 */
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