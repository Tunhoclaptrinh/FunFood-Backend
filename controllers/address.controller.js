const addressService = require('../services/address.service');
const BaseController = require('../utils/BaseController');

class AddressController extends BaseController {
  constructor() {
    super(addressService);
  }

  getAddresses = async (req, res, next) => {
    try {
      const result = await this.service.getAddresses(req.user.id);

      res.json({
        success: true,
        count: result.data.length,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  getDefaultAddress = async (req, res, next) => {
    try {
      const result = await this.service.getDefaultAddress(req.user.id);

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

  setDefaultAddress = async (req, res, next) => {
    try {
      const result = await this.service.setDefaultAddress(
        req.params.id,
        req.user.id
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

  delete = async (req, res, next) => {
    try {
      const result = await this.service.deleteAddress(
        req.params.id,
        req.user.id
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

  clearNonDefault = async (req, res, next) => {
    try {
      const result = await this.service.clearNonDefault(req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AddressController();