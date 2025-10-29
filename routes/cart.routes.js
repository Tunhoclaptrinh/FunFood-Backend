const express = require('express');
const router = express.Router();
const validation = require('../middleware/validation.middleware');
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, cartController.getCart);
router.post('/', protect, validation.cart.add, cartController.addToCart);
router.post('/sync', protect, validation.cart.sync, cartController.syncCart);
router.put('/:id', protect, validation.cart.update, cartController.updateCartItem);
router.delete('/:id', protect, cartController.removeFromCart);
router.delete('/restaurant/:restaurantId', protect, cartController.clearRestaurantCart);
router.delete('/', protect, cartController.clearCart);

module.exports = router;