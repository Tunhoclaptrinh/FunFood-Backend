const favoriteService = require('../services/favorite.service');
const BaseController = require('../utils/BaseController');

class FavoriteController extends BaseController {
  constructor() {
    super(favoriteService);
  }

  getFavorites = async (req, res, next) => {
    try {
      const result = await this.service.getFavorites(req.user.id, req.parsedQuery);

      res.json({
        success: true,
        count: result.data.length,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  getFavoriteRestaurantIds = async (req, res, next) => {
    try {
      const result = await this.service.getFavoriteRestaurantIds(req.user.id);

      res.json({
        success: true,
        count: result.data.length,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  addFavorite = async (req, res, next) => {
    try {
      const result = await this.service.addFavorite(
        req.user.id,
        req.params.restaurantId
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  removeFavorite = async (req, res, next) => {
    try {
      const result = await this.service.removeFavorite(
        req.user.id,
        req.params.restaurantId
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleFavorite = async (req, res, next) => {
    try {
      const result = await this.service.toggleFavorite(
        req.user.id,
        req.params.restaurantId
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  checkFavorite = async (req, res, next) => {
    try {
      const result = await this.service.checkFavorite(
        req.user.id,
        req.params.restaurantId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  clearAll = async (req, res, next) => {
    try {
      const result = await this.service.clearAll(req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new FavoriteController();