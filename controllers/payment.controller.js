const paymentService = require('../services/payment.service');
const db = require('../config/database');

class PaymentController {
  /**
   * POST /api/payment/:orderId/create
   * Create payment for order
   */
  createPayment = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { paymentMethod } = req.body;

      // Validate order exists and belongs to user
      const order = db.findById('orders', orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this order'
        });
      }

      // Process payment
      const result = await paymentService.processPayment(
        orderId,
        paymentMethod,
        req.body
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/payment/:orderId/status
   * Check payment status
   */
  checkPaymentStatus = async (req, res, next) => {
    try {
      const { orderId } = req.params;

      const result = await paymentService.checkPaymentStatus(orderId);

      if (!result.success) {
        return res.status(result.statusCode || 404).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/payment/:orderId/refund
   * Refund payment (Admin only)
   */
  refundPayment = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      const result = await paymentService.refundPayment(orderId, reason);

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/payment
   * Get all payments (Admin only)
   */
  getAllPayments = async (req, res, next) => {
    try {
      const orders = db.findAll('orders');

      // Filter orders with payment info
      const paymentsData = orders
        .filter(o => o.paymentData)
        .map(o => ({
          orderId: o.id,
          userId: o.userId,
          amount: o.total,
          method: o.paymentMethod,
          status: o.paymentStatus,
          createdAt: o.createdAt,
          paymentData: o.paymentData
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({
        success: true,
        count: paymentsData.length,
        data: paymentsData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/payment/momo/callback
   * MoMo webhook callback
   */
  momoCallback = async (req, res, next) => {
    try {
      const result = await paymentService.verifyPaymentCallback('momo', req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: 'Callback processed'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/payment/zalopay/callback
   * ZaloPay webhook callback
   */
  zaloPayCallback = async (req, res, next) => {
    try {
      const result = await paymentService.verifyPaymentCallback('zalopay', req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: 'Callback processed'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new PaymentController();