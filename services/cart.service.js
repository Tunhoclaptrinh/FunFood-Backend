const BaseService = require('../utils/BaseService');
const db = require('../config/database');

class CartService extends BaseService {
  constructor() {
    super('cart');
  }

  async getCart(userId) {
    const cartItems = db.findMany('cart', { userId });

    const enrichedCart = cartItems.map(item => {
      const product = db.findById('products', item.productId);
      if (!product) return null;

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
    }).filter(item => item !== null);

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

    const subtotal = enrichedCart.reduce((sum, item) => sum + item.itemTotal, 0);
    const totalItems = enrichedCart.reduce((sum, item) => sum + item.quantity, 0);
    const deliveryFee = Object.values(groupedByRestaurant).reduce(
      (sum, group) => sum + (group.restaurant?.deliveryFee || 0),
      0
    );

    return {
      success: true,
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
    };
  }

  async addToCart(userId, productId, quantity) {
    const product = db.findById('products', productId);
    if (!product) {
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404
      };
    }

    if (!product.available) {
      return {
        success: false,
        message: 'Product is not available',
        statusCode: 400
      };
    }

    const existingItem = db.findOne('cart', {
      userId,
      productId: parseInt(productId)
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity <= 0) {
        db.delete('cart', existingItem.id);
        return {
          success: true,
          message: 'Item removed from cart'
        };
      }

      const updated = db.update('cart', existingItem.id, {
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Cart updated successfully',
        data: updated
      };
    }

    const cartItem = db.create('cart', {
      userId,
      productId: parseInt(productId),
      quantity,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Item added to cart',
      data: cartItem
    };
  }

  async updateCartItem(userId, cartItemId, quantity) {
    const cartItem = db.findById('cart', cartItemId);
    if (!cartItem) {
      return {
        success: false,
        message: 'Cart item not found',
        statusCode: 404
      };
    }

    if (cartItem.userId !== userId) {
      return {
        success: false,
        message: 'Not authorized',
        statusCode: 403
      };
    }

    if (quantity === 0) {
      db.delete('cart', cartItemId);
      return {
        success: true,
        message: 'Item removed from cart'
      };
    }

    const updated = db.update('cart', cartItemId, {
      quantity,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Cart item updated successfully',
      data: updated
    };
  }

  async removeFromCart(userId, cartItemId) {
    const cartItem = db.findById('cart', cartItemId);
    if (!cartItem) {
      return {
        success: false,
        message: 'Cart item not found',
        statusCode: 404
      };
    }

    if (cartItem.userId !== userId) {
      return {
        success: false,
        message: 'Not authorized',
        statusCode: 403
      };
    }

    db.delete('cart', cartItemId);

    return {
      success: true,
      message: 'Item removed from cart'
    };
  }

  async clearCart(userId) {
    const cartItems = db.findMany('cart', { userId });

    if (cartItems.length === 0) {
      return {
        success: true,
        message: 'Cart is already empty'
      };
    }

    cartItems.forEach(item => db.delete('cart', item.id));

    return {
      success: true,
      message: 'Cart cleared successfully',
      cleared: cartItems.length
    };
  }

  async clearRestaurantCart(userId, restaurantId) {
    const cartItems = db.findMany('cart', { userId });

    const itemsToDelete = cartItems.filter(item => {
      const product = db.findById('products', item.productId);
      return product && product.restaurantId === parseInt(restaurantId);
    });

    if (itemsToDelete.length === 0) {
      return {
        success: true,
        message: 'No items from this restaurant in cart'
      };
    }

    itemsToDelete.forEach(item => db.delete('cart', item.id));

    return {
      success: true,
      message: 'Restaurant items removed from cart',
      cleared: itemsToDelete.length
    };
  }

  async syncCart(userId, items) {
    const syncedItems = [];
    const errors = [];

    for (const item of items) {
      try {
        const { productId, quantity } = item;

        const product = db.findById('products', productId);
        if (!product || !product.available) {
          errors.push({ productId, error: 'Product not available' });
          continue;
        }

        const existing = db.findOne('cart', {
          userId,
          productId: parseInt(productId)
        });

        if (existing) {
          const updated = db.update('cart', existing.id, {
            quantity: Math.max(existing.quantity, quantity),
            updatedAt: new Date().toISOString()
          });
          syncedItems.push(updated);
        } else {
          const created = db.create('cart', {
            userId,
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

    return {
      success: true,
      message: 'Cart synced successfully',
      data: {
        synced: syncedItems.length,
        errors: errors.length,
        details: errors.length > 0 ? errors : undefined
      }
    };
  }
}

module.exports = new CartService();