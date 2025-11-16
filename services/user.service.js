const BaseService = require('../utils/BaseService');
const db = require('../config/database');
const { sanitizeUser, hashPassword } = require('../utils/helpers');
const userSchema = require('../schemas/user.schema');

class UserService extends BaseService {
  constructor() {
    super('users');
  }

  /**
   * Get schema for import/export
   */
  getSchema() {
    return userSchema;
  }

  /**
   * Transform import data - hash password
   */
  async transformImportData(data) {
    const transformed = await super.transformImportData(data);

    // Hash password if provided
    if (transformed.password) {
      transformed.password = await hashPassword(transformed.password);
    }

    // Generate avatar if not provided
    if (!transformed.avatar && transformed.name) {
      transformed.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(transformed.name)}&background=random`;
    }

    return transformed;
  }

  async beforeCreate(data) {
    return {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async beforeUpdate(id, data) {
    if (data.newPassword) {
      data.password = await hashPassword(data.newPassword);
      delete data.newPassword;
    }

    // Don't allow updating password directly
    delete data.password;

    return {
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  async getUserStats() {
    const users = db.findAll('users');
    const orders = db.findAll('orders');
    const reviews = db.findAll('reviews');

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const stats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      byRole: {
        customer: users.filter(u => u.role === 'customer').length,
        admin: users.filter(u => u.role === 'admin').length
      },
      withOrders: new Set(orders.map(o => o.userId)).size,
      withReviews: new Set(reviews.map(r => r.userId)).size,
      recentSignups: users.filter(u => {
        const createdAt = new Date(u.createdAt);
        return createdAt >= weekAgo;
      }).length
    };

    return {
      success: true,
      data: stats
    };
  }

  async getUserActivity(userId) {
    const user = db.findById('users', userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404
      };
    }

    const orders = db.findMany('orders', { userId });
    const reviews = db.findMany('reviews', { userId });
    const favorites = db.findMany('favorites', { userId });

    const totalSpent = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);

    const completedOrders = orders.filter(o => o.status === 'delivered');
    const avgOrderValue = completedOrders.length > 0
      ? totalSpent / completedOrders.length
      : 0;

    const activity = {
      user: sanitizeUser(user),
      stats: {
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        totalSpent: Math.round(totalSpent),
        avgOrderValue: Math.round(avgOrderValue),
        totalReviews: reviews.length,
        avgRating: reviews.length > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
          : 0,
        totalFavorites: favorites.length
      },
      recentOrders: orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order.id,
          restaurantId: order.restaurantId,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt
        })),
      recentReviews: reviews
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };

    return {
      success: true,
      data: activity
    };
  }

  async toggleUserStatus(userId) {
    const user = db.findById('users', userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404
      };
    }

    const updated = db.update('users', userId, {
      isActive: !user.isActive,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: sanitizeUser(updated)
    };
  }

  async permanentDeleteUser(userId) {
    const user = db.findById('users', userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404
      };
    }

    const deleted = {
      user: 1,
      orders: 0,
      cart: 0,
      favorites: 0,
      reviews: 0,
      addresses: 0,
      notifications: 0
    };

    // Delete all related data
    const orders = db.findMany('orders', { userId });
    orders.forEach(order => {
      db.delete('orders', order.id);
      deleted.orders++;
    });

    const cartItems = db.findMany('cart', { userId });
    cartItems.forEach(item => {
      db.delete('cart', item.id);
      deleted.cart++;
    });

    const favorites = db.findMany('favorites', { userId });
    favorites.forEach(fav => {
      db.delete('favorites', fav.id);
      deleted.favorites++;
    });

    const reviews = db.findMany('reviews', { userId });
    reviews.forEach(review => {
      const restaurantId = review.restaurantId;
      db.delete('reviews', review.id);
      deleted.reviews++;
      // Update restaurant rating
      this.updateRestaurantRating(restaurantId);
    });

    const addresses = db.findMany('addresses', { userId });
    addresses.forEach(addr => {
      db.delete('addresses', addr.id);
      deleted.addresses++;
    });

    const notifications = db.findMany('notifications', { userId });
    notifications.forEach(notif => {
      db.delete('notifications', notif.id);
      deleted.notifications++;
    });

    // Finally delete user
    db.delete('users', userId);

    return {
      success: true,
      message: 'User and all related data permanently deleted',
      deleted
    };
  }

  updateRestaurantRating(restaurantId) {
    const allReviews = db.findMany('reviews', { restaurantId: parseInt(restaurantId) });

    if (allReviews.length === 0) {
      db.update('restaurants', restaurantId, {
        rating: 0,
        totalReviews: 0
      });
      return;
    }

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    db.update('restaurants', restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });
  }
}

module.exports = new UserService();