const notificationService = require('../services/notification.service');
const BaseController = require('../utils/BaseController');

class NotificationController extends BaseController {
  constructor() {
    super(notificationService);
  }

  getNotifications = async (req, res, next) => {
    try {
      const result = await this.service.getNotifications(req.user.id, req.parsedQuery);

      res.json({
        success: true,
        count: result.data.length,
        unreadCount: result.unreadCount,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req, res, next) => {
    try {
      const result = await this.service.markAsRead(req.params.id, req.user.id);

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

  markAllAsRead = async (req, res, next) => {
    try {
      const result = await this.service.markAllAsRead(req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req, res, next) => {
    try {
      const result = await this.service.deleteNotification(req.params.id, req.user.id);

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

  clearAll = async (req, res, next) => {
    try {
      const result = await this.service.clearAll(req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new NotificationController();