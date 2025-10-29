const { sanitizeUser } = require('../utils/helpers');
const userService = require('../services/user.service');
const BaseController = require('../utils/BaseController');

class UserController extends BaseController {
  constructor() {
    super(userService);
  }

  getAll = async (req, res, next) => {
    try {
      const result = await this.service.findAll(req.parsedQuery);

      const sanitizedData = result.data.map(user => sanitizeUser(user));

      res.json({
        success: true,
        count: sanitizedData.length,
        data: sanitizedData,
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

      // Check authorization
      if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this profile'
        });
      }

      res.json({
        success: true,
        data: sanitizeUser(result.data)
      });
    } catch (error) {
      next(error);
    }
  };

  getUserStats = async (req, res, next) => {
    try {
      const result = await this.service.getUserStats();

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  getUserActivity = async (req, res, next) => {
    try {
      // Check authorization
      if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      const result = await this.service.getUserActivity(req.params.id);

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

  toggleUserStatus = async (req, res, next) => {
    try {
      // Prevent admin from deactivating themselves
      if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
      }

      const result = await this.service.toggleUserStatus(req.params.id);

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

  permanentDeleteUser = async (req, res, next) => {
    try {
      // Prevent admin from deleting themselves
      if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const result = await this.service.permanentDeleteUser(req.params.id);

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

  updateProfile = async (req, res, next) => {
    try {
      const { name, phone, address, avatar } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (address) updateData.address = address;
      if (avatar) updateData.avatar = avatar;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      const result = await this.service.update(req.user.id, updateData);

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: sanitizeUser(result.data)
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();