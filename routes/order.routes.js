const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkPermission, checkOwnership, validateOrderStatusTransition, roleBasedRateLimit } = require('../middleware/rbac.middleware');
const validation = require('../middleware/validation.middleware');

// ==================== CUSTOMER ROUTES ====================

// Create order (với rate limiting)
router.post('/',
  protect,
  roleBasedRateLimit({ customer: 50, admin: 1000 }),
  checkPermission('orders', 'create'),
  validation.order.create,
  orderController.create
);

// Get my orders
router.get('/',
  protect,
  checkPermission('orders', 'list'),
  orderController.getMyOrders
);

// Get order detail
router.get('/:id',
  protect,
  checkPermission('orders', 'read'),
  checkOwnership('order'),
  orderController.getById
);

// Cancel order (customer only)
router.delete('/:id',
  protect,
  checkPermission('orders', 'cancel'),
  checkOwnership('order'),
  orderController.cancelOrder
);

// Get my order statistics
router.get('/stats/summary',
  protect,
  orderController.getMyStats
);

// ==================== ADMIN ROUTES ====================

// Get all orders (admin only)
router.get('/admin/all',
  protect,
  checkPermission('orders', 'list'),
  orderController.getAll
);

// Get order statistics (admin)
router.get('/admin/stats',
  protect,
  checkPermission('orders', 'list'),
  orderController.getAdminStats
);

// Force update any order (admin only)
router.patch('/admin/:id/status',
  protect,
  checkPermission('orders', 'updateStatus'),
  validation.order.updateStatus,
  orderController.adminUpdateStatus
);

// Delete order permanently (admin only)
router.delete('/admin/:id/permanent',
  protect,
  checkPermission('orders', 'delete'),
  orderController.permanentDelete
);

// ==================== MANAGER ROUTES ====================

// Get restaurant orders (manager)
router.get('/manager/restaurant',
  protect,
  checkPermission('orders', 'list'),
  orderController.getRestaurantOrders
);

// Confirm/Prepare order (manager)
router.patch('/manager/:id/status',
  protect,
  checkPermission('orders', 'updateStatus'),
  checkOwnership('order'),
  validateOrderStatusTransition,
  validation.order.updateStatus,
  orderController.updateStatus
);

// Get restaurant stats (manager)
router.get('/manager/stats',
  protect,
  checkPermission('orders', 'list'),
  orderController.getManagerStats
);

// ==================== SHIPPER ROUTES ====================

// Get available orders (shipper)
router.get('/shipper/available',
  protect,
  checkPermission('orders', 'list'),
  orderController.getAvailableOrders
);

// Accept order (shipper)
router.post('/shipper/:id/accept',
  protect,
  checkPermission('orders', 'accept'),
  orderController.acceptOrder
);

// Get my deliveries (shipper)
router.get('/shipper/deliveries',
  protect,
  checkPermission('orders', 'list'),
  orderController.getMyDeliveries
);

// Update delivery status (shipper)
router.patch('/shipper/:id/status',
  protect,
  checkPermission('orders', 'updateStatus'),
  checkOwnership('order'),
  validateOrderStatusTransition,
  validation.order.updateStatus,
  orderController.updateStatus
);

// Get shipper stats
router.get('/shipper/stats',
  protect,
  checkPermission('orders', 'list'),
  orderController.getShipperStats
);

// ==================== SHARED ROUTES ====================

// Update order status (tất cả roles, có validation)
router.patch('/:id/status',
  protect,
  checkOwnership('order'),
  validateOrderStatusTransition,
  validation.order.updateStatus,
  orderController.updateStatus
);

// Reorder (copy order to create new one)
router.post('/:id/reorder',
  protect,
  checkPermission('orders', 'create'),
  checkOwnership('order'),
  orderController.reorder
);

// Rate order (after delivered)
router.post('/:id/rate',
  protect,
  checkOwnership('order'),
  orderController.rateOrder
);

module.exports = router;