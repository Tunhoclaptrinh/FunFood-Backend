const { validationResult } = require('express-validator');
const db = require('../config/database');

/**
 * GET /api/cart
 * Get user's cart with product details
 * Query: ?_expand=product,restaurant
 */
exports.getCart = async (req, res, next) => {
  try {
    const cartItems = db.findMany('cart', { userId: req.user.id });

    // Enrich with product and restaurant details
    const enrichedCart = cartItems.map(item => {
      const product = db.findById('products', item.productId);

      if (!product) {
        return null; // Product might be deleted
      }

      const restaurant = db.findById('restaurants', product.restaurantId);
      const finalPrice = product.price * (1 - product.discount / 100);
      const itemTotal = finalPrice * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          discount: product.discount,
          finalPrice: Math.round(finalPrice),
          image: product.image,
          available: product.available
        },
        restaurant: restaurant ? {
          id: restaurant.id,
          name: restaurant.name,
          deliveryFee: restaurant.deliveryFee
        } : null,
        itemTotal: Math.round(itemTotal)
      };
    }).filter(item => item !== null); // Remove items with deleted products

    // Group by restaurant
    const groupedByRestaurant = enrichedCart.reduce((acc, item) => {
      const restaurantId = item.restaurant?.id || 0;
      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurant: item.restaurant,
          items: [],
          subtotal: 0
        };
      }
      acc[restaurantId].items.push(item);
      acc[restaurantId].subtotal += item.itemTotal;
      return acc;
    }, {});

    // Calculate totals
    const subtotal = enrichedCart.reduce((sum, item) => sum + item.itemTotal, 0);
    const totalItems = enrichedCart.reduce((sum, item) => sum + item.quantity, 0);

    // Get delivery fees (sum of all restaurants)
    const deliveryFee = Object.values(groupedByRestaurant).reduce(
      (sum, group) => sum + (group.restaurant?.deliveryFee || 0),
      0
    );

    res.json({
      success: true,
      count: enrichedCart.length,
      data: {
        items: enrichedCart,
        groupedByRestaurant: Object.values(groupedByRestaurant),
        summary: {
          totalItems,
          subtotal: Math.round(subtotal),
          deliveryFee,
          total: Math.round(subtotal + deliveryFee)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart
 * Add item to cart or update quantity if exists
 */
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
    const existingItem = db.findOne('cart', {
      userId: req.user.id,
      productId: parseInt(productId)
    });

    let cartItem;

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity <= 0) {
        db.delete('cart', existingItem.id);
        return res.json({
          success: true,
          message: 'Item removed from cart'
        });
      }

      cartItem = db.update('cart', existingItem.id, {
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        message: 'Cart updated successfully',
        data: cartItem
      });
    }

    // Add new item
    cartItem = db.create('cart', {
      userId: req.user.id,
      productId: parseInt(productId),
      quantity,
      createdAt: new Date().toISOString()
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

/**
 * PUT /api/cart/:id
 * Update cart item quantity
 */
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity'
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

    // If quantity is 0, delete item
    if (quantity === 0) {
      db.delete('cart', req.params.id);
      return res.json({
        success: true,
        message: 'Item removed from cart'
      });
    }

    const updated = db.update('cart', req.params.id, {
      quantity,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/:id
 * Remove item from cart
 */
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

/**
 * DELETE /api/cart
 * Clear entire cart
 */
exports.clearCart = async (req, res, next) => {
  try {
    const cartItems = db.findMany('cart', { userId: req.user.id });

    if (cartItems.length === 0) {
      return res.json({
        success: true,
        message: 'Cart is already empty'
      });
    }

    cartItems.forEach(item => {
      db.delete('cart', item.id);
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cleared: cartItems.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/restaurant/:restaurantId
 * Clear cart items from specific restaurant
 */
exports.clearRestaurantCart = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const cartItems = db.findMany('cart', { userId: req.user.id });

    // Filter items from this restaurant
    const itemsToDelete = cartItems.filter(item => {
      const product = db.findById('products', item.productId);
      return product && product.restaurantId === parseInt(restaurantId);
    });

    if (itemsToDelete.length === 0) {
      return res.json({
        success: true,
        message: 'No items from this restaurant in cart'
      });
    }

    itemsToDelete.forEach(item => {
      db.delete('cart', item.id);
    });

    res.json({
      success: true,
      message: 'Restaurant items removed from cart',
      cleared: itemsToDelete.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart/sync
 * Sync cart from client (merge with server cart)
 */
exports.syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }

    const syncedItems = [];
    const errors = [];

    for (const item of items) {
      try {
        const { productId, quantity } = item;

        // Validate product
        const product = db.findById('products', productId);
        if (!product || !product.available) {
          errors.push({ productId, error: 'Product not available' });
          continue;
        }

        // Check existing cart item
        const existing = db.findOne('cart', {
          userId: req.user.id,
          productId: parseInt(productId)
        });

        if (existing) {
          // Update with max quantity
          const updated = db.update('cart', existing.id, {
            quantity: Math.max(existing.quantity, quantity),
            updatedAt: new Date().toISOString()
          });
          syncedItems.push(updated);
        } else {
          // Create new
          const created = db.create('cart', {
            userId: req.user.id,
            productId: parseInt(productId),
            quantity,
            createdAt: new Date().toISOString()
          });
          syncedItems.push(created);
        }
      } catch (err) {
        errors.push({ productId: item.productId, error: err.message });
      }
    }

    res.json({
      success: true,
      message: 'Cart synced successfully',
      data: {
        synced: syncedItems.length,
        errors: errors.length,
        details: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};