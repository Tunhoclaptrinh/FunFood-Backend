const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// ==================== PROTECTED ROUTES ====================

// Create payment
router.post('/:orderId/create', protect, paymentController.createPayment);

// Check payment status
router.get('/:orderId/status', protect, paymentController.checkPaymentStatus);

// ==================== ADMIN ROUTES ====================

// Process refund
router.post('/:orderId/refund', protect, authorize('admin'), paymentController.refundPayment);

// Get all payments
router.get('/', protect, authorize('admin'), paymentController.getAllPayments);

// ==================== PAYMENT CALLBACKS ====================

// MoMo callback (webhook)
router.post('/momo/callback', paymentController.momoCallback);

// ZaloPay callback (webhook)
router.post('/zalopay/callback', paymentController.zaloPayCallback);

module.exports = router;