const db = require('../config/database');

/**
 * GET /api/categories
 * Query examples:
 * - ?_page=1&_limit=10
 * - ?_sort=name&_order=asc
 * - ?name_like=Pizza
 */
exports.getCategories = async (req, res, next) => {
  try {
    const result = db.findAllAdvanced('categories', req.parsedQuery);

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
 * GET /api/categories/:id
 */
exports.getCategory = async (req, res, next) => {
  try {
    const category = db.findById('categories', req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/categories (Admin only)
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = db.create('categories', {
      name,
      icon: icon || '🍽️',
      image: image || ''
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/categories/:id (Admin only)
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const category = db.findById('categories', req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updated = db.update('categories', req.params.id, req.body);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/categories/:id (Admin only)
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = db.findById('categories', req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if any restaurants/products use this category
    const restaurants = db.findMany('restaurants', { categoryId: parseInt(req.params.id) });
    const products = db.findMany('products', { categoryId: parseInt(req.params.id) });

    if (restaurants.length > 0 || products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that is in use',
        details: {
          restaurants: restaurants.length,
          products: products.length
        }
      });
    }

    db.delete('categories', req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};