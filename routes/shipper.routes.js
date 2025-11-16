// routes/shipper.routes.js - MỚI TẠO

const express = require('express');
const router = express.Router();
const shipperController = require('../controllers/shipper.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');

router.use(protect, authorize('shipper')); // All routes need shipper role

router.get('/orders/available', shipperController.getAvailableOrders);
router.post('/orders/:id/accept', shipperController.acceptOrder);
router.get('/orders/my-deliveries', shipperController.getMyDeliveries);
router.patch('/orders/:id/status',
  validateFields('order', ['status']),
  shipperController.updateOrderStatus
);
router.get('/orders/history', shipperController.getDeliveryHistory);
router.get('/stats', shipperController.getStats);

module.exports = router;