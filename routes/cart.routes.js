const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, cartController.getCart);
router.post('/', protect, [
  body('productId').notEmpty().withMessage('Product is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], cartController.addToCart);
router.put('/:id', protect, cartController.updateCartItem);
router.delete('/:id', protect, cartController.removeFromCart);
router.delete('/', protect, cartController.clearCart);

module.exports = router;