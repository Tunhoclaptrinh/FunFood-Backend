const { validationResult } = require('express-validator');
const db = require('../config/database');

exports.getCart = async (req, res, next) => {
  try {
    const cartItems = db.findMany('cart', { userId: req.user.id });

    // Enrich with product details
    const enrichedCart = cartItems.map(item => {
      const product = db.findById('products', item.productId);
      return {
        ...item,
        product: product || null
      };
    });

    // Calculate total
    const total = enrichedCart.reduce((sum, item) => {
      if (item.product) {
        const price = item.product.price * (1 - item.product.discount / 100);
        return sum + (price * item.quantity);
      }
      return sum;
    }, 0);

    res.json({
      success: true,
      count: enrichedCart.length,
      total,
      data: enrichedCart
    });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { productId, quantity } = req.body;

    // Check if product exists
    const product = db.findById('products', productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.available) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check if item already in cart
    const existingItem = db.findOne('cart', { userId: req.user.id, productId });

    if (existingItem) {
      // Update quantity
      const updated = db.update('cart', existingItem.id, {
        quantity: existingItem.quantity + quantity
      });

      return res.json({
        success: true,
        message: 'Cart updated successfully',
        data: updated
      });
    }

    // Add new item
    const cartItem = db.create('cart', {
      userId: req.user.id,
      productId,
      quantity
    });

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: cartItem
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cartItem = db.findById('cart', req.params.id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Check authorization
    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updated = db.update('cart', req.params.id, { quantity });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cartItem = db.findById('cart', req.params.id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Check authorization
    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    db.delete('cart', req.params.id);

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cartItems = db.findMany('cart', { userId: req.user.id });

    cartItems.forEach(item => {
      db.delete('cart', item.id);
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
