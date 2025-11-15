const express = require('express');
const router = express.Router();
const managerController = require('../controllers/manager.controller');
const { protect, authorize, checkOwnership } = require('../middleware/auth.middleware');

// Tất cả routes đều require manager role
router.use(protect, authorize('manager'));

// Xem thông tin restaurant của mình
router.get('/restaurant', managerController.getMyRestaurant);

// Quản lý menu
router.get('/products', managerController.getProducts);
router.post('/products', managerController.createProduct);
router.put('/products/:id', managerController.updateProduct);
router.patch('/products/:id/availability', managerController.toggleProductAvailability);

// Quản lý đơn hàng
router.get('/orders', managerController.getOrders);
router.get('/orders/:id', checkOwnership('order'), managerController.getOrderDetail);
router.patch('/orders/:id/status', checkOwnership('order'), managerController.updateOrderStatus);

// Thống kê
router.get('/stats', managerController.getStats);

module.exports = router;