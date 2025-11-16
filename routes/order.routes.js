const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { checkPermission, checkOwnership, validateOrderStatusTransition } = require('../middleware/rbac.middleware');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');

// Customer routes
router.post('/',
  protect,
  validateSchema('order'),
  orderController.create
);

router.get('/', protect, checkPermission('orders', 'list'), orderController.getMyOrders);
router.get('/:id', protect, checkPermission('orders', 'read'), checkOwnership('order'), orderController.getById);
router.delete('/:id', protect, checkPermission('orders', 'cancel'), checkOwnership('order'), orderController.cancelOrder);
router.get('/stats/summary', protect, orderController.getMyStats);

// Admin routes
router.get('/admin/all', protect, checkPermission('orders', 'list'), orderController.getAll);
router.get('/admin/stats', protect, checkPermission('orders', 'list'), orderController.getAdminStats);
router.patch('/admin/:id/status', protect, checkPermission('orders', 'updateStatus'), validateFields('order', ['status']), orderController.adminUpdateStatus);
router.delete('/admin/:id/permanent', protect, checkPermission('orders', 'delete'), orderController.permanentDelete);

// Manager routes
router.get('/manager/restaurant', protect, checkPermission('orders', 'list'), orderController.getRestaurantOrders);
router.patch('/manager/:id/status', protect, checkPermission('orders', 'updateStatus'), checkOwnership('order'), validateOrderStatusTransition, validateFields('order', ['status']), orderController.updateStatus);
router.get('/manager/stats', protect, checkPermission('orders', 'list'), orderController.getManagerStats);

// Shipper routes
router.get('/shipper/available', protect, checkPermission('orders', 'list'), orderController.getAvailableOrders);
router.post('/shipper/:id/accept', protect, checkPermission('orders', 'accept'), orderController.acceptOrder);
router.get('/shipper/deliveries', protect, checkPermission('orders', 'list'), orderController.getMyDeliveries);
router.patch('/shipper/:id/status', protect, checkPermission('orders', 'updateStatus'), checkOwnership('order'), validateOrderStatusTransition, validateFields('order', ['status']), orderController.updateStatus);
router.get('/shipper/stats', protect, checkPermission('orders', 'list'), orderController.getShipperStats);

// Shared routes
router.patch('/:id/status', protect, checkOwnership('order'), validateOrderStatusTransition, validateFields('order', ['status']), orderController.updateStatus);
router.post('/:id/reorder', protect, checkPermission('orders', 'create'), checkOwnership('order'), orderController.reorder);
router.post('/:id/rate', protect, checkOwnership('order'), validateFields('review', ['rating', 'comment']), orderController.rateOrder);

module.exports = router;