const reviewService = require('../services/review.service');
const BaseController = require('../utils/BaseController');

class ReviewController extends BaseController {
  constructor() {
    super(reviewService);
  }

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
}

module.exports = new ReviewController();
