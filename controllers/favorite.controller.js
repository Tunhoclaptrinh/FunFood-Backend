// controllers/favorite.controller.js - UPDATED: Support both types
const BaseController = require('../utils/BaseController');
const favoriteService = require('../services/favorite.service');

class FavoriteController extends BaseController {
  constructor() {
    super(favoriteService);
  }

  /**
   * GET /api/favorites
   * Get all favorites (restaurants + products)
   */
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

  /**
   * GET /api/favorites/:type
   * Get favorites by type (restaurants or products)
   */
  getFavoritesByType = async (req, res, next) => {
    try {
      const { type } = req.params;

      const result = await this.service.getFavoritesByType(
        req.user.id,
        type,
        req.parsedQuery
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        count: result.data.length,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/favorites/:type/ids
   * Get favorite IDs only (lightweight)
   */
  getFavoriteIds = async (req, res, next) => {
    try {
      const { type } = req.params;

      const result = await this.service.getFavoriteIds(req.user.id, type);

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        count: result.data.length,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/favorites/:type/:id
   * Add to favorites
   */
  addFavorite = async (req, res, next) => {
    try {
      const { type, id } = req.params;

      const result = await this.service.addFavorite(
        req.user.id,
        type,
        id
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

  /**
   * DELETE /api/favorites/:type/:id
   * Remove from favorites
   */
  removeFavorite = async (req, res, next) => {
    try {
      const { type, id } = req.params;

      const result = await this.service.removeFavorite(
        req.user.id,
        type,
        id
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

  /**
   * POST /api/favorites/:type/:id/toggle
   * Toggle favorite
   */
  toggleFavorite = async (req, res, next) => {
    try {
      const { type, id } = req.params;

      const result = await this.service.toggleFavorite(
        req.user.id,
        type,
        id
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

  /**
   * GET /api/favorites/:type/:id/check
   * Check if item is favorited
   */
  checkFavorite = async (req, res, next) => {
    try {
      const { type, id } = req.params;

      const result = await this.service.checkFavorite(
        req.user.id,
        type,
        id
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/favorites/trending/:type
   * Get trending favorites
   */
  getTrendingFavorites = async (req, res, next) => {
    try {
      const { type } = req.params;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.service.getTrendingFavorites(type, limit);

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        count: result.data.length,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/favorites/stats
   * Get favorite statistics
   */
  getFavoriteStats = async (req, res, next) => {
    try {
      const result = await this.service.getFavoriteStats(req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/favorites
   * Clear all favorites
   */
  clearAll = async (req, res, next) => {
    try {
      const result = await this.service.clearAll(req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/favorites/:type
   * Clear favorites by type
   */
  clearByType = async (req, res, next) => {
    try {
      const { type } = req.params;

      const result = await this.service.clearByType(req.user.id, type);

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
}

module.exports = new FavoriteController();