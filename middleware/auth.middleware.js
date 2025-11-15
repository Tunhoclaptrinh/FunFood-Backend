const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = db.findById('users', decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive'
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    next(error);
  }
};


/**
 * Kiểm tra user có phải owner của resource không
 */
exports.checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    const resourceId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admin có full quyền
    if (userRole === 'admin') {
      return next();
    }

    try {
      switch (resourceType) {
        case 'order':
          const order = db.findById('orders', resourceId);
          if (!order) {
            return res.status(404).json({
              success: false,
              message: 'Order not found'
            });
          }

          // Customer chỉ xem order của mình
          if (userRole === 'customer' && order.userId !== userId) {
            return res.status(403).json({
              success: false,
              message: 'Not authorized to access this order'
            });
          }

          // Manager chỉ xem order của restaurant mình
          if (userRole === 'manager') {
            if (req.user.restaurantId !== order.restaurantId) {
              return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
              });
            }
          }

          // Shipper chỉ xem order được assign cho mình
          if (userRole === 'shipper') {
            if (order.shipperId !== userId) {
              return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
              });
            }
          }

          req.resource = order; // Gắn vào req để dùng trong controller
          return next();

        case 'restaurant':
          const restaurant = db.findById('restaurants', resourceId);
          if (!restaurant) {
            return res.status(404).json({
              success: false,
              message: 'Restaurant not found'
            });
          }

          // Manager chỉ quản lý restaurant của mình
          if (userRole === 'manager') {
            if (req.user.restaurantId !== parseInt(resourceId)) {
              return res.status(403).json({
                success: false,
                message: 'Not authorized to manage this restaurant'
              });
            }
          }

          req.resource = restaurant;
          return next();

        default:
          return next();
      }
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Kiểm tra quyền update order status
 */
exports.canUpdateOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  const order = req.resource; // Đã được gắn bởi checkOwnership
  const userRole = req.user.role;
  const userId = req.user.id;

  // Admin có full quyền
  if (userRole === 'admin') {
    return next();
  }

  // Customer chỉ được cancel
  if (userRole === 'customer') {
    if (status !== 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Customers can only cancel orders'
      });
    }

    // Chỉ cancel được khi pending/confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }

    return next();
  }

  // Manager: confirmed, preparing
  if (userRole === 'manager') {
    const allowedStatuses = ['confirmed', 'preparing'];

    if (!allowedStatuses.includes(status)) {
      return res.status(403).json({
        success: false,
        message: `Manager can only update to: ${allowedStatuses.join(', ')}`
      });
    }

    // Kiểm tra flow hợp lệ
    const validTransitions = {
      'pending': ['confirmed'],
      'confirmed': ['preparing']
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${status}`
      });
    }

    return next();
  }

  // Shipper: delivering, delivered
  if (userRole === 'shipper') {
    const allowedStatuses = ['delivering', 'delivered'];

    if (!allowedStatuses.includes(status)) {
      return res.status(403).json({
        success: false,
        message: `Shipper can only update to: ${allowedStatuses.join(', ')}`
      });
    }

    // Kiểm tra đã được assign chưa
    if (order.shipperId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'This order is not assigned to you'
      });
    }

    // Kiểm tra flow hợp lệ
    const validTransitions = {
      'preparing': ['delivering'],
      'delivering': ['delivered']
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${status}`
      });
    }

    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Not authorized'
  });
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
