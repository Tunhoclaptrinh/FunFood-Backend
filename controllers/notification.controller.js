const db = require('../config/database');

/**
 * GET /api/notifications
 * Get user's notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const result = db.findAllAdvanced('notifications', {
      ...req.parsedQuery,
      filter: {
        ...req.parsedQuery.filter,
        userId: req.user.id
      },
      sort: 'createdAt',
      order: 'desc'
    });

    // Count unread
    const unreadCount = result.data.filter(n => !n.isRead).length;

    res.json({
      success: true,
      count: result.data.length,
      unreadCount,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = db.findById('notifications', req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updated = db.update('notifications', req.params.id, {
      isRead: true
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all as read
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const notifications = db.findMany('notifications', {
      userId: req.user.id,
      isRead: false
    });

    notifications.forEach(notification => {
      db.update('notifications', notification.id, { isRead: true });
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      count: notifications.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = db.findById('notifications', req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    db.delete('notifications', req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications
 * Clear all notifications
 */
exports.clearAll = async (req, res, next) => {
  try {
    const notifications = db.findMany('notifications', { userId: req.user.id });

    notifications.forEach(notification => {
      db.delete('notifications', notification.id);
    });

    res.json({
      success: true,
      message: 'All notifications cleared',
      count: notifications.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;