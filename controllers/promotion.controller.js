const promotionService = require('../services/promotion.service');
const BaseController = require('../utils/BaseController');

class PromotionController extends BaseController {
  constructor() {
    super(promotionService);
  }

  getActivePromotions = async (req, res, next) => {
    try {
      const result = await this.service.getActivePromotions(req.parsedQuery);

      res.json({
        success: true,
        count: result.data.length,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  getByCode = async (req, res, next) => {
    try {
      const result = await this.service.getByCode(req.params.code);

      if (!result.success) {
        return res.status(result.statusCode || 404).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  validatePromotion = async (req, res, next) => {
    try {
      const { code, orderValue, deliveryFee } = req.body;

      if (!code || !orderValue) {
        return res.status(400).json({
          success: false,
          message: 'Code and order value are required'
        });
      }

      const result = await this.service.validatePromotion(
        code,
        orderValue,
        deliveryFee || 0
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

  toggleActive = async (req, res, next) => {
    try {
      const result = await this.service.toggleActive(req.params.id);

      if (!result.success) {
        return res.status(result.statusCode || 404).json({
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

module.exports = new PromotionController();