const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');

router.get('/', protect, orderController.getMyOrders);
router.get('/all', protect, authorize('admin'), orderController.getAll);
router.get('/:id', protect, orderController.getById);
router.post('/', protect, validation.order.create, orderController.create);
router.patch('/:id/status', protect, validation.order.updateStatus, orderController.updateStatus);
router.delete('/:id', protect, orderController.cancelOrder);

module.exports = router;