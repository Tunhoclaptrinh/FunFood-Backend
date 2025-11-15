// routes/shipper.routes.js - MỚI TẠO

const express = require('express');
const router = express.Router();
const shipperController = require('../controllers/shipper.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Tất cả routes đều require shipper role
router.use(protect, authorize('shipper'));

// Xem đơn hàng available (status = preparing)
router.get('/orders/available', shipperController.getAvailableOrders);

// Nhận đơn (assign order cho mình)
router.post('/orders/:id/accept', shipperController.acceptOrder);

// Xem đơn đang giao của mình
router.get('/orders/my-deliveries', shipperController.getMyDeliveries);

// Cập nhật vị trí hiện tại (GPS tracking) => hiện tại chưa có
// router.patch('/location', shipperController.updateLocation);

// Cập nhật trạng thái đơn (delivering, delivered)
router.patch('/orders/:id/status', shipperController.updateOrderStatus);

// Xem lịch sử giao hàng
router.get('/orders/history', shipperController.getDeliveryHistory);

// Xem thống kê
router.get('/stats', shipperController.getStats);

module.exports = router;