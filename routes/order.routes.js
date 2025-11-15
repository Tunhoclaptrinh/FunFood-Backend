const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize, checkOwnership, canUpdateOrderStatus } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');

// Customer routes
router.get('/', protect, orderController.getMyOrders);
router.get('/:id', protect, checkOwnership('order'), orderController.getById);
router.post('/', protect, validation.order.create, orderController.create);
router.delete('/:id', protect, checkOwnership('order'), orderController.cancelOrder);

// Update status (tất cả roles)
router.patch('/:id/status',
  protect,
  checkOwnership('order'),        // ✅ Kiểm tra ownership trước
  canUpdateOrderStatus,            // ✅ Kiểm tra quyền update status
  validation.order.updateStatus,
  orderController.updateStatus
);

// Admin routes
router.get('/all', protect, authorize('admin'), orderController.getAll);

module.exports = router;