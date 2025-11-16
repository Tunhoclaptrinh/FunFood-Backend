const express = require('express');
const router = express.Router();
const managerController = require('../controllers/manager.controller');
const { protect, authorize, checkOwnership } = require('../middleware/auth.middleware');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');

router.use(protect, authorize('manager')); // All routes need manager role

router.get('/restaurant', managerController.getMyRestaurant);
router.get('/products', managerController.getProducts);

router.post('/products',
  validateSchema('product'),
  managerController.createProduct
);

router.put('/products/:id',
  validateSchema('product'),
  managerController.updateProduct
);

router.patch('/products/:id/availability',
  validateFields('product', ['available']),
  managerController.toggleProductAvailability
);

router.get('/orders', managerController.getOrders);
router.get('/orders/:id', checkOwnership('order'), managerController.getOrderDetail);
router.patch('/orders/:id/status',
  checkOwnership('order'),
  validateFields('order', ['status']),
  managerController.updateOrderStatus
);

router.get('/stats', managerController.getStats);

module.exports = router;
