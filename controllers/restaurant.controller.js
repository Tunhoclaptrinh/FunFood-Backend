const restaurantService = require('../services/restaurant.service');
const BaseController = require('../utils/BaseController');

class RestaurantController extends BaseController {
  constructor() {
    super(restaurantService);
  }

  getNearby = async (req, res, next) => {
    try {
      const { latitude, longitude, radius = 5 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const result = await this.service.getNearby(
        latitude,
        longitude,
        radius,
        req.parsedQuery
      );

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

  getMenu = async (req, res, next) => {
    try {
      const result = await this.service.getMenu(
        req.params.id,
        req.parsedQuery
      );

      if (!result.success) {
        return res.status(result.statusCode || 404).json({
          success: false,
          message: result.message
        });
      }

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
      if (req.parsedQuery.embed) {
        const db = require('../config/database');
        const items = db.applyRelations([result.data], 'restaurants', req.parsedQuery);
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
}

module.exports = new RestaurantController();