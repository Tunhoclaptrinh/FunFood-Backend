const { validationResult } = require('express-validator');
const db = require('../config/database');

/**
 * GET /api/orders
 * Query examples:
 * - ?status=delivered
 * - ?_page=1&_limit=10
 * - ?_sort=createdAt&_order=desc
 * - ?total_gte=100000
 * - ?createdAt_gte=2024-10-01
 * - ?_expand=restaurant
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const result = db.findAllAdvanced('orders', {
      ...req.parsedQuery,
      filter: {
        ...req.parsedQuery.filter,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/all (Admin only)
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const result = db.findAllAdvanced('orders', req.parsedQuery);

    res.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = db.findById('orders', req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { restaurantId, items, deliveryAddress, paymentMethod, note, promotionCode } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map(item => {
      const product = db.findById('products', item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const itemPrice = product.price * (1 - product.discount / 100);
      subtotal += itemPrice * item.quantity;

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount
      };
    });

    // Get delivery fee
    const restaurant = db.findById('restaurants', restaurantId);
    const deliveryFee = restaurant?.deliveryFee || 0;

    // Apply promotion
    let discount = 0;
    if (promotionCode) {
      const promotion = db.findOne('promotions', { code: promotionCode, isActive: true });
      if (promotion && subtotal >= promotion.minOrderValue) {
        if (promotion.discountType === 'percentage') {
          discount = Math.min((subtotal * promotion.discountValue / 100), promotion.maxDiscount);
        } else if (promotion.discountType === 'fixed') {
          discount = promotion.discountValue;
        } else if (promotion.discountType === 'delivery') {
          discount = deliveryFee;
        }
      }
    }

    const total = subtotal + deliveryFee - discount;

    const order = db.create('orders', {
      userId: req.user.id,
      restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      total,
      status: 'pending',
      deliveryAddress,
      paymentMethod,
      note: note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Clear cart after order
    const cartItems = db.findMany('cart', { userId: req.user.id });
    cartItems.forEach(item => db.delete('cart', item.id));

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = db.findById('orders', req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    const updatedOrder = db.update('orders', req.params.id, {
      status,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = db.findById('orders', req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }

    const updatedOrder = db.update('orders', req.params.id, {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};
