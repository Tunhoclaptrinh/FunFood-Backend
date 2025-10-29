const BaseController = require('../utils/BaseController');
const cartService = require('../services/cart.service');

class CartController extends BaseController {
  constructor() {
    super(cartService);
  }

  getCart = async (req, res, next) => {
    try {
      const result = await this.service.getCart(req.user.id);

      res.json({
        success: true,
        count: result.data.items.length,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  addToCart = async (req, res, next) => {
    try {
      const errors = this.validateRequest(req);
      if (errors) {
        return res.status(400).json({
          success: false,
          errors
        });
      }

      const { productId, quantity } = req.body;

      const result = await this.service.addToCart(
        req.user.id,
        productId,
        quantity
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

  updateCartItem = async (req, res, next) => {
    try {
      const { quantity } = req.body;

      if (quantity === undefined || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity'
        });
      }

      const result = await this.service.updateCartItem(
        req.user.id,
        req.params.id,
        quantity
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

  removeFromCart = async (req, res, next) => {
    try {
      const result = await this.service.removeFromCart(
        req.user.id,
        req.params.id
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

  clearCart = async (req, res, next) => {
    try {
      const result = await this.service.clearCart(req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  clearRestaurantCart = async (req, res, next) => {
    try {
      const result = await this.service.clearRestaurantCart(
        req.user.id,
        req.params.restaurantId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  syncCart = async (req, res, next) => {
    try {
      const { items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Items must be an array'
        });
      }

      const result = await this.service.syncCart(req.user.id, items);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CartController();
