const BaseController = require('../utils/BaseController');
const orderService = require('../services/order.service');

class OrderController extends BaseController {
  constructor() {
    super(orderService);
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

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  getMyOrders = async (req, res, next) => {
    try {
      const result = await this.service.getMyOrders(req.user.id, req.parsedQuery);

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

  updateStatus = async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const result = await this.service.updateStatus(
        req.params.id,
        status,
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

  cancelOrder = async (req, res, next) => {
    try {
      const result = await this.service.cancelOrder(
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

module.exports = new OrderController();