const BaseController = require('../utils/BaseController');
const productService = require('../services/product.service');

class ProductController extends BaseController {
  constructor() {
    super(productService);
  }

  getDiscounted = async (req, res, next) => {
    try {
      const result = await this.service.getDiscounted(req.parsedQuery);

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

  getById = async (req, res, next) => {
    try {
      const result = await this.service.findById(req.params.id);

      if (!result.success) {
        return res.status(result.statusCode || 404).json({
          success: false,
          message: result.message
        });
      }

      let enriched = result.data;
      if (req.parsedQuery.expand) {
        const db = require('../config/database');
        const items = await db.applyRelations([result.data], 'products', req.parsedQuery);
        enriched = items[0];
      }

      res.json({
        success: true,
        data: enriched
      });
    } catch (error) {
      next(error);
    }
  };

  bulkUpdateAvailability = async (req, res, next) => {
    try {
      const { productIds, available } = req.body;

      if (!Array.isArray(productIds) || typeof available !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request: productIds (array) and available (boolean) required'
        });
      }

      const result = await this.service.bulkUpdateAvailability(productIds, available);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ProductController();
