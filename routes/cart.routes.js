const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');
router.get('/', protect, cartController.getCart);
const { validateSchema, validateFields } = require('../middleware/validation.middleware');

router.post('/',
  protect,
  validateSchema('cart'),
  cartController.addToCart
);

router.post('/sync',
  protect,
  cartController.syncCart
);

router.put('/:id',
  protect,
  validateFields('cart', ['quantity']),
  cartController.updateCartItem
);

router.delete('/:id', protect, cartController.removeFromCart);
router.delete('/restaurant/:restaurantId', protect, cartController.clearRestaurantCart);
router.delete('/', protect, cartController.clearCart);

module.exports = router;
