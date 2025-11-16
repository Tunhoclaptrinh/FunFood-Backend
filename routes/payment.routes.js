const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');

router.post('/:orderId/create',
  protect,
  validateFields('order', ['paymentMethod']),
  paymentController.createPayment
);

router.get('/:orderId/status', protect, paymentController.checkPaymentStatus);
router.post('/:orderId/refund', protect, authorize('admin'), paymentController.refundPayment);
router.get('/', protect, authorize('admin'), paymentController.getAllPayments);

// Callbacks (public)
router.post('/momo/callback', paymentController.momoCallback);
router.post('/zalopay/callback', paymentController.zaloPayCallback);

module.exports = router;