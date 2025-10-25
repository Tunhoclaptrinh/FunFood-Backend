const db = require('../config/database');
const { sanitizeUser, hashPassword } = require('../utils/helpers');

/**
 * GET /api/users (Admin only)
 * Query examples:
 * - ?_page=1&_limit=20
 * - ?_sort=createdAt&_order=desc
 * - ?role=customer
 * - ?isActive=true
 * - ?q=email@example.com
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const result = db.findAllAdvanced('users', req.parsedQuery);

    // Sanitize all users (remove passwords)
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

/**
 * GET /api/users/:id
 * Get user by ID
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = db.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only allow users to view their own profile or admin
    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }

    res.json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/stats/summary (Admin only)
 * Get user statistics
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const users = db.findAll('users');
    const orders = db.findAll('orders');
    const reviews = db.findAll('reviews');

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
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt >= weekAgo;
      }).length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 * Update own profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, avatar } = req.body;

    // Don't allow changing sensitive fields
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

    updateData.updatedAt = new Date().toISOString();

    const updatedUser = db.update('users', req.user.id, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id (Admin only)
 * Update any user
 */
exports.updateUser = async (req, res, next) => {
  try {
    const user = db.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = { ...req.body };

    // Don't allow updating password through this endpoint
    delete updateData.password;

    // Hash new password if provided
    if (req.body.newPassword) {
      updateData.password = await hashPassword(req.body.newPassword);
    }

    updateData.updatedAt = new Date().toISOString();

    const updated = db.update('users', req.params.id, updateData);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: sanitizeUser(updated)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/status (Admin only)
 * Toggle user active status
 */
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = db.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const updated = db.update('users', req.params.id, {
      isActive: !user.isActive,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: sanitizeUser(updated)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id (Admin only)
 * Delete user (soft delete - deactivate)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = db.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete - just deactivate
    const updated = db.update('users', req.params.id, {
      isActive: false,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'User account deactivated successfully',
      data: sanitizeUser(updated)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id/permanent (Admin only)
 * Permanently delete user and all related data
 */
exports.permanentDeleteUser = async (req, res, next) => {
  try {
    const user = db.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const userId = parseInt(req.params.id);

    // Delete all related data
    const deleted = {
      user: 1,
      orders: 0,
      cart: 0,
      favorites: 0,
      reviews: 0,
      addresses: 0
    };

    // Delete orders
    const orders = db.findMany('orders', { userId });
    orders.forEach(order => {
      db.delete('orders', order.id);
      deleted.orders++;
    });

    // Delete cart items
    const cartItems = db.findMany('cart', { userId });
    cartItems.forEach(item => {
      db.delete('cart', item.id);
      deleted.cart++;
    });

    // Delete favorites
    const favorites = db.findMany('favorites', { userId });
    favorites.forEach(fav => {
      db.delete('favorites', fav.id);
      deleted.favorites++;
    });

    // Delete reviews
    const reviews = db.findMany('reviews', { userId });
    reviews.forEach(review => {
      db.delete('reviews', review.id);
      deleted.reviews++;
      // Update restaurant rating after deleting review
      updateRestaurantRating(review.restaurantId);
    });

    // Delete addresses
    const addresses = db.findMany('addresses', { userId });
    addresses.forEach(addr => {
      db.delete('addresses', addr.id);
      deleted.addresses++;
    });

    // Finally delete user
    db.delete('users', req.params.id);

    res.json({
      success: true,
      message: 'User and all related data permanently deleted',
      deleted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/activity
 * Get user activity summary
 */
exports.getUserActivity = async (req, res, next) => {
  try {
    const user = db.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check authorization
    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const userId = parseInt(req.params.id);

    // Get activity data
    const orders = db.findMany('orders', { userId });
    const reviews = db.findMany('reviews', { userId });
    const favorites = db.findMany('favorites', { userId });

    // Calculate statistics
    const totalSpent = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);

    const avgOrderValue = orders.length > 0
      ? totalSpent / orders.filter(o => o.status === 'delivered').length
      : 0;

    const activity = {
      user: sanitizeUser(user),
      stats: {
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
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

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// Helper function
function updateRestaurantRating(restaurantId) {
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