// UPDATED
const reviewService = require('../services/review.service');
const BaseController = require('../utils/BaseController');

class ReviewController extends BaseController {
  constructor() {
    super(reviewService);
  }

  /**
   * POST /api/reviews
   * Create review (restaurant or product)
   */
  create = async (req, res, next) => {
    try {
      const errors = this.validateRequest(req);
      if (errors) {
        return res.status(400).json({
          success: false,
          errors
        });
      }

      const result = await this.service.create({
        ...req.body,
        userId: req.user.id
      });

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
   * GET /api/reviews/type/:type
   * Get all reviews by type (restaurant or product)
   */
  getByType = async (req, res, next) => {
    try {
      const { type } = req.params;

      const result = await this.service.getReviewsByType(type, req.parsedQuery);

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
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

  /**
   * GET /api/reviews/restaurant/:restaurantId
   * Get restaurant reviews
   */
  getRestaurantReviews = async (req, res, next) => {
    try {
      const result = await this.service.getRestaurantReviews(
        req.params.restaurantId,
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

  /**
   * GET /api/reviews/product/:productId
   * Get product reviews
   */
  getProductReviews = async (req, res, next) => {
    try {
      const result = await this.service.getProductReviews(
        req.params.productId,
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

  /**
   * GET /api/reviews/user/me
   * Get my reviews
   */
  getMyReviews = async (req, res, next) => {
    try {
      const result = await this.service.getMyReviews(req.user.id, req.parsedQuery);

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
   * GET /api/reviews/user/stats
   * Get review statistics
   */
  getStats = async (req, res, next) => {
    try {
      const result = await this.service.getReviewStats(req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/reviews/check/:type/:targetId
   * Check if user has reviewed
   */
  checkReview = async (req, res, next) => {
    try {
      const { type, targetId } = req.params;

      const result = await this.service.checkReview(
        req.user.id,
        type,
        targetId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/reviews/:id
   * Update review
   */
  update = async (req, res, next) => {
    try {
      const errors = this.validateRequest(req);
      if (errors) {
        return res.status(400).json({
          success: false,
          errors
        });
      }

      const result = await this.service.update(req.params.id, req.body);

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
   * DELETE /api/reviews/:id
   * Delete review
   */
  delete = async (req, res, next) => {
    try {
      const result = await this.service.deleteReview(
        req.params.id,
        req.user.id,
        req.user.role
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
   * GET /api/reviews (Admin only)
   * Get all reviews
   */
  getAll = async (req, res, next) => {
    try {
      const result = await this.service.findAll(req.parsedQuery);

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
}

module.exports = new ReviewController();