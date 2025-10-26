const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, orderController.getMyOrders);
router.get('/all', protect, authorize('admin'), orderController.getAllOrders);
router.get('/:id', protect, orderController.getOrder);
router.post('/', protect, [
  body('restaurantId').notEmpty().withMessage('Restaurant is required'),
  body('items').isArray({ min: 1 }).withMessage('Order must have at least 1 item'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  body('deliveryLatitude').optional().isFloat().withMessage('Invalid latitude'),
  body('deliveryLongitude').optional().isFloat().withMessage('Invalid longitude'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
], orderController.createOrder);
router.patch('/:id/status', protect, orderController.updateOrderStatus);
router.delete('/:id', protect, orderController.cancelOrder);

module.exports = router;