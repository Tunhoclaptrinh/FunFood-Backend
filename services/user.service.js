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
    const users = await db.findAll('users');
    const orders = await db.findAll('orders');
    const reviews = await db.findAll('reviews');

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
    const uid = parseInt(userId);
    const user = await db.findById('users', uid);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404
      };
    }

    const orders = await db.findMany('orders', { userId: uid });
    const reviews = await db.findMany('reviews', { userId: uid });
    const favorites = await db.findMany('favorites', { userId: uid });

    const completedOrders = orders.filter(o => o.status === 'delivered');
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);

    const avgOrderValue = completedOrders.length > 0
      ? totalSpent / completedOrders.length
      : 0;

    const stats = {
      totalOrders: orders.length,
      // Đếm số lượng theo từng trạng thái cụ thể
      pendingOrders: orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length,
      shippingOrders: orders.filter(o => ['delivering', 'on_the_way'].includes(o.status)).length,
      completedOrders: completedOrders.length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,

      totalSpent: Math.round(totalSpent),
      avgOrderValue: Math.round(avgOrderValue),
      totalReviews: reviews.length,
      avgRating: reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0,
      totalFavorites: favorites.length
    };

    const activity = {
      user: sanitizeUser(user),
      stats: stats,
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
    const user = await db.findById('users', userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404
      };
    }

    const updated = await db.update('users', userId, {
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
    const user = await db.findById('users', userId);

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
    const orders = await db.findMany('orders', { userId });
    await Promise.all(
      orders.map(async (order) => {
        await db.delete('orders', order.id);
        deleted.orders++;
      })
    );

    const cartItems = await db.findMany('cart', { userId });
    await Promise.all(
      cartItems.map(async (item) => {
        await db.delete('cart', item.id);
        deleted.cart++;
      })
    );

    const favorites = await db.findMany('favorites', { userId });
    await Promise.all(
      favorites.map(async (fav) => {
        await db.delete('favorites', fav.id);
        deleted.favorites++;
      })
    );

    const reviews = await db.findMany('reviews', { userId });
    await Promise.all(
      reviews.map(async (review) => {
        const restaurantId = review.restaurantId;
        await db.delete('reviews', review.id);
        deleted.reviews++;
        // Update restaurant rating
        await this.updateRestaurantRating(restaurantId);
      })
    );

    const addresses = await db.findMany('addresses', { userId });
    await Promise.all(
      addresses.map(async (addr) => {
        await db.delete('addresses', addr.id);
        deleted.addresses++;
      })
    );

    const notifications = await db.findMany('notifications', { userId });
    await Promise.all(
      notifications.map(async (notif) => {
        await db.delete('notifications', notif.id);
        deleted.notifications++;
      })
    );

    // Finally delete user
    await db.delete('users', userId);

    return {
      success: true,
      message: 'User and all related data permanently deleted',
      deleted
    };
  }

  async updateRestaurantRating(restaurantId) {
    const allReviews = await db.findMany('reviews', {
      restaurantId: parseInt(restaurantId)
    });

    if (allReviews.length === 0) {
      await db.update('restaurants', restaurantId, {
        rating: 0,
        totalReviews: 0
      });
      return;
    }

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.update('restaurants', restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });
  }
}

module.exports = new UserService();