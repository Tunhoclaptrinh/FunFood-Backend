const db = require('../config/database');

/**
 * GET /api/products
 * Query examples:
 * - ?_page=1&_limit=20
 * - ?_sort=price&_order=asc
 * - ?restaurantId=1
 * - ?categoryId=2
 * - ?available=true
 * - ?price_gte=50000&price_lte=100000
 * - ?discount_ne=0 (products with discount)
 * - ?name_like=pizza
 * - ?_expand=restaurant,category
 */
exports.getProducts = async (req, res, next) => {
  try {
    const result = db.findAllAdvanced('products', req.parsedQuery);

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
 * GET /api/products/search?q=...
 * Search products by name or description
 */
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = db.findAllAdvanced('products', {
      q,
      page: req.parsedQuery.page,
      limit: req.parsedQuery.limit,
      sort: req.parsedQuery.sort,
      order: req.parsedQuery.order,
      expand: req.parsedQuery.expand
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
 * GET /api/products/:id
 * Get product details
 * Supports ?_expand=restaurant,category
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = db.findById('products', req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Expand relations if requested
    let enriched = product;
    if (req.parsedQuery.expand) {
      const result = db.applyRelations([product], 'products', req.parsedQuery);
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
 * POST /api/products (Admin only)
 * Create new product
 */
exports.createProduct = async (req, res, next) => {
  try {
    const product = db.create('products', {
      ...req.body,
      available: req.body.available !== undefined ? req.body.available : true,
      discount: req.body.discount || 0
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id (Admin only)
 * Update product
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = db.update('products', req.params.id, req.body);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id (Admin only)
 * Delete product
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const result = db.delete('products', req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};