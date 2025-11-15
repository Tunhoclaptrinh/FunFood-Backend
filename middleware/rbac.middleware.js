/**
 * RBAC Middleware - Role-Based Access Control
 * Quản lý phân quyền chi tiết cho từng resource và action
 */

const db = require('../config/database');

// Định nghĩa permissions cho mỗi role
const PERMISSIONS = {
  admin: {
    users: ['create', 'read', 'update', 'delete', 'list', 'export', 'import'],
    restaurants: ['create', 'read', 'update', 'delete', 'list', 'export', 'import'],
    products: ['create', 'read', 'update', 'delete', 'list', 'export', 'import'],
    categories: ['create', 'read', 'update', 'delete', 'list', 'export', 'import'],
    orders: ['create', 'read', 'update', 'delete', 'list', 'cancel', 'updateStatus'],
    promotions: ['create', 'read', 'update', 'delete', 'list', 'toggle'],
    reviews: ['read', 'delete', 'list'],
    payments: ['read', 'refund', 'list'],
    reports: ['view', 'export']
  },

  manager: {
    restaurants: ['read', 'update'], // Chỉ restaurant của mình
    products: ['create', 'read', 'update', 'delete', 'list'], // Products thuộc restaurant
    orders: ['read', 'list', 'updateStatus'], // Orders của restaurant
    reviews: ['read', 'list'], // Reviews của restaurant
    payments: ['read'], // Payment info của orders
    reports: ['view'] // Reports của restaurant
  },

  shipper: {
    orders: ['read', 'list', 'accept', 'updateStatus'], // Chỉ đơn được assign
    profile: ['read', 'update'],
    payments: ['read'] // Xem thông tin COD
  },

  customer: {
    products: ['read', 'list'],
    restaurants: ['read', 'list'],
    categories: ['read', 'list'],
    orders: ['create', 'read', 'list', 'cancel'], // Chỉ đơn của mình
    cart: ['create', 'read', 'update', 'delete', 'clear'],
    favorites: ['create', 'read', 'delete', 'list'],
    reviews: ['create', 'read', 'update', 'delete', 'list'], // Chỉ review của mình
    addresses: ['create', 'read', 'update', 'delete', 'list'],
    notifications: ['read', 'update', 'delete'],
    payments: ['create', 'read'], // Tạo & xem payment của mình
    profile: ['read', 'update']
  }
};

/**
 * Check if user has permission for action on resource
 */
function hasPermission(userRole, resource, action) {
  const rolePermissions = PERMISSIONS[userRole];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

/**
 * Middleware: Check permission
 * Usage: checkPermission('orders', 'create')
 */
exports.checkPermission = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!hasPermission(userRole, resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Role '${userRole}' cannot '${action}' ${resource}`,
        required: {
          resource,
          action,
          yourRole: userRole
        }
      });
    }

    next();
  };
};

/**
 * Middleware: Check ownership
 * Kiểm tra user có phải owner của resource không
 */
exports.checkOwnership = (resourceType, idParam = 'id') => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const resourceId = req.params[idParam];

    // Admin bypass ownership check
    if (userRole === 'admin') {
      return next();
    }

    try {
      let resource;
      let isOwner = false;

      switch (resourceType) {
        case 'order':
          resource = db.findById('orders', resourceId);
          if (!resource) {
            return res.status(404).json({
              success: false,
              message: 'Order not found'
            });
          }

          // Customer: chỉ order của mình
          if (userRole === 'customer') {
            isOwner = resource.userId === userId;
          }

          // Manager: chỉ order của restaurant mình quản lý
          if (userRole === 'manager') {
            const restaurant = db.findOne('restaurants', { managerId: userId });
            isOwner = restaurant && resource.restaurantId === restaurant.id;
          }

          // Shipper: chỉ order được assign
          if (userRole === 'shipper') {
            isOwner = resource.shipperId === userId;
          }
          break;

        case 'review':
          resource = db.findById('reviews', resourceId);
          if (!resource) {
            return res.status(404).json({
              success: false,
              message: 'Review not found'
            });
          }
          isOwner = resource.userId === userId;
          break;

        case 'address':
          resource = db.findById('addresses', resourceId);
          if (!resource) {
            return res.status(404).json({
              success: false,
              message: 'Address not found'
            });
          }
          isOwner = resource.userId === userId;
          break;

        case 'cart':
          resource = db.findById('cart', resourceId);
          if (!resource) {
            return res.status(404).json({
              success: false,
              message: 'Cart item not found'
            });
          }
          isOwner = resource.userId === userId;
          break;

        case 'restaurant':
          resource = db.findById('restaurants', resourceId);
          if (!resource) {
            return res.status(404).json({
              success: false,
              message: 'Restaurant not found'
            });
          }

          // Manager chỉ quản lý restaurant của mình
          if (userRole === 'manager') {
            isOwner = resource.managerId === userId;
          }
          break;

        case 'product':
          resource = db.findById('products', resourceId);
          if (!resource) {
            return res.status(404).json({
              success: false,
              message: 'Product not found'
            });
          }

          // Manager chỉ quản lý product của restaurant mình
          if (userRole === 'manager') {
            const restaurant = db.findOne('restaurants', {
              managerId: userId,
              id: resource.restaurantId
            });
            isOwner = !!restaurant;
          }
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid resource type'
          });
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }

      // Attach resource to request for use in controller
      req.resource = resource;
      next();

    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware: Validate order status transition
 * Kiểm tra xem user có quyền chuyển đổi status không
 */
exports.validateOrderStatusTransition = async (req, res, next) => {
  const { status } = req.body;
  const order = req.resource; // Đã được set bởi checkOwnership
  const userRole = req.user.role;

  if (!order) {
    return res.status(400).json({
      success: false,
      message: 'Order not found in request'
    });
  }

  // Define valid transitions for each role
  const validTransitions = {
    admin: {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['delivering', 'cancelled'],
      'delivering': ['delivered', 'cancelled'],
      'delivered': [], // Cannot change from delivered
      'cancelled': [] // Cannot change from cancelled
    },
    manager: {
      'pending': ['confirmed'],
      'confirmed': ['preparing'],
      'preparing': [], // Manager không chuyển sang delivering (do shipper)
      'delivering': [],
      'delivered': [],
      'cancelled': []
    },
    shipper: {
      'pending': [],
      'confirmed': [],
      'preparing': ['delivering'], // Accept order
      'delivering': ['delivered'],
      'delivered': [],
      'cancelled': []
    },
    customer: {
      'pending': ['cancelled'],
      'confirmed': ['cancelled'],
      'preparing': [], // Không thể cancel khi đang chuẩn bị
      'delivering': [],
      'delivered': [],
      'cancelled': []
    }
  };

  const allowedTransitions = validTransitions[userRole]?.[order.status] || [];

  if (!allowedTransitions.includes(status)) {
    return res.status(403).json({
      success: false,
      message: `Cannot transition order from '${order.status}' to '${status}' as ${userRole}`,
      currentStatus: order.status,
      requestedStatus: status,
      allowedTransitions: allowedTransitions.length > 0 ? allowedTransitions : 'None'
    });
  }

  next();
};

/**
 * Middleware: Rate limiting per role
 */
const rateLimitStore = {};

exports.roleBasedRateLimit = (limits) => {
  // limits = { customer: 100, manager: 200, admin: 1000 } per hour

  return (req, res, next) => {
    const userRole = req.user?.role || 'guest';
    const userId = req.user?.id || req.ip;
    const key = `${userRole}:${userId}`;
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour

    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    const record = rateLimitStore[key];

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    const limit = limits[userRole] || limits.guest || 50;

    if (record.count >= limit) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        limit,
        resetTime: new Date(record.resetTime).toISOString()
      });
    }

    record.count++;

    // Set headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - record.count);
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    next();
  };
};

/**
 * Middleware: Validate request body with custom rules
 */
exports.validateRequestBody = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: `${field} is required`
        });
        continue;
      }

      // Skip further validation if field is optional and empty
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Type check
      if (rule.type) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push({ field, message: `${field} must be a string` });
            }
            break;
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              errors.push({ field, message: `${field} must be a number` });
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push({ field, message: `${field} must be a boolean` });
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push({ field, message: `${field} must be an array` });
            }
            break;
          case 'object':
            if (typeof value !== 'object' || Array.isArray(value)) {
              errors.push({ field, message: `${field} must be an object` });
            }
            break;
        }
      }

      // Min/Max length for strings
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.minLength} characters`
        });
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          field,
          message: `${field} must be at most ${rule.maxLength} characters`
        });
      }

      // Min/Max value for numbers
      if (rule.min !== undefined && Number(value) < rule.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.min}`
        });
      }
      if (rule.max !== undefined && Number(value) > rule.max) {
        errors.push({
          field,
          message: `${field} must be at most ${rule.max}`
        });
      }

      // Enum check
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${rule.enum.join(', ')}`
        });
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value, req.body);
        if (customError) {
          errors.push({ field, message: customError });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

/**
 * Get user permissions (for frontend)
 */
exports.getUserPermissions = (req, res) => {
  const userRole = req.user?.role;

  if (!userRole) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const permissions = PERMISSIONS[userRole] || {};

  res.json({
    success: true,
    data: {
      role: userRole,
      permissions
    }
  });
};

module.exports = exports;