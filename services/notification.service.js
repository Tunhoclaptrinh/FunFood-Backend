const BaseService = require('../utils/BaseService');
const db = require('../config/database');

class NotificationService extends BaseService {
  constructor() {
    super('notifications');
  }

  async getNotifications(userId, options = {}) {
    const result = db.findAllAdvanced('notifications', {
      ...options,
      filter: {
        ...options.filter,
        userId: userId
      },
      sort: 'createdAt',
      order: 'desc'
    });

    const unreadCount = result.data.filter(n => !n.isRead).length;

    return {
      success: true,
      data: result.data,
      unreadCount,
      pagination: result.pagination
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = db.findById('notifications', notificationId);

    if (!notification) {
      return {
        success: false,
        message: 'Notification not found',
        statusCode: 404
      };
    }

    if (notification.userId !== userId) {
      return {
        success: false,
        message: 'Not authorized',
        statusCode: 403
      };
    }

    const updated = db.update('notifications', notificationId, {
      isRead: true
    });

    return {
      success: true,
      data: updated
    };
  }

  async markAllAsRead(userId) {
    const notifications = db.findMany('notifications', {
      userId,
      isRead: false
    });

    notifications.forEach(notification => {
      db.update('notifications', notification.id, { isRead: true });
    });

    return {
      success: true,
      message: 'All notifications marked as read',
      count: notifications.length
    };
  }

  async deleteNotification(notificationId, userId) {
    const notification = db.findById('notifications', notificationId);

    if (!notification) {
      return {
        success: false,
        message: 'Notification not found',
        statusCode: 404
      };
    }

    if (notification.userId !== userId) {
      return {
        success: false,
        message: 'Not authorized',
        statusCode: 403
      };
    }

    db.delete('notifications', notificationId);

    return {
      success: true,
      message: 'Notification deleted'
    };
  }

  async clearAll(userId) {
    const notifications = db.findMany('notifications', { userId });

    if (notifications.length === 0) {
      return {
        success: true,
        message: 'No notifications to clear'
      };
    }

    notifications.forEach(notification => {
      db.delete('notifications', notification.id);
    });

    return {
      success: true,
      message: 'All notifications cleared',
      count: notifications.length
    };
  }
}

module.exports = new NotificationService();