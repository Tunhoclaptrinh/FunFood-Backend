const BaseService = require('../utils/BaseService');
const db = require('../config/database');
const { calculateDistance, calculateDeliveryFee } = require('../utils/helpers');

class OrderService extends BaseService {
  constructor() {
    super('orders');
  }

  async validateCreate(data) {
    if (!data.items || data.items.length === 0) {
      return {
        success: false,
        message: 'Order must have at least one item',
        statusCode: 400
      };
    }

    const restaurant = db.findById('restaurants', data.restaurantId);
    if (!restaurant) {
      return {
        success: false,
        message: 'Restaurant not found',
        statusCode: 404
      };
    }

    for (const item of data.items) {
      const product = db.findById('products', item.productId);
      if (!product) {
        return {
          success: false,
          message: `Product ${item.productId} not found`,
          statusCode: 404
        };
      }
      if (!product.available) {
        return {
          success: false,
          message: `Product ${product.name} is not available`,
          statusCode: 400
        };
      }
    }

    return { success: true };
  }

  async beforeCreate(data) {
    const { restaurantId, items, deliveryLatitude, deliveryLongitude, promotionCode } = data;

    let subtotal = 0;
    const orderItems = items.map(item => {
      const product = db.findById('products', item.productId);
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

    const restaurant = db.findById('restaurants', restaurantId);
    let deliveryFee = restaurant.deliveryFee || 0;

    if (deliveryLatitude && deliveryLongitude && restaurant.latitude && restaurant.longitude) {
      const distance = calculateDistance(
        restaurant.latitude,
        restaurant.longitude,
        deliveryLatitude,
        deliveryLongitude
      );
      deliveryFee = calculateDeliveryFee(distance);
    }

    let discount = 0;
    if (promotionCode) {
      const promotion = db.findOne('promotions', {
        code: promotionCode.toUpperCase(),
        isActive: true
      });

      if (promotion) {
        const now = new Date();
        const validFrom = new Date(promotion.validFrom);
        const validTo = new Date(promotion.validTo);

        if (validFrom <= now && validTo >= now && subtotal >= promotion.minOrderValue) {
          if (promotion.discountType === 'percentage') {
            discount = Math.min(
              (subtotal * promotion.discountValue / 100),
              promotion.maxDiscount || Infinity
            );
          } else if (promotion.discountType === 'fixed') {
            discount = promotion.discountValue;
          } else if (promotion.discountType === 'delivery') {
            discount = deliveryFee;
          }
        }
      }
    }

    return {
      userId: data.userId,
      restaurantId: parseInt(restaurantId),
      items: orderItems,
      subtotal: Math.round(subtotal),
      deliveryFee,
      discount: Math.round(discount),
      total: Math.round(subtotal + deliveryFee - discount),
      status: 'pending',
      deliveryAddress: data.deliveryAddress,
      deliveryLatitude: deliveryLatitude || null,
      deliveryLongitude: deliveryLongitude || null,
      paymentMethod: data.paymentMethod,
      note: data.note || '',
      promotionCode: promotionCode ? promotionCode.toUpperCase() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async afterCreate(order) {
    // Clear cart items from this restaurant
    const cartItems = db.findMany('cart', { userId: order.userId });
    cartItems.forEach(item => {
      const product = db.findById('products', item.productId);
      if (product && product.restaurantId === order.restaurantId) {
        db.delete('cart', item.id);
      }
    });

    // Create notification
    db.create('notifications', {
      userId: order.userId,
      title: 'Order Created',
      message: `Order #${order.id} has been created successfully`,
      type: 'order',
      refId: order.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  async updateStatus(orderId, status, userId, userRole) {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        statusCode: 400
      };
    }

    const order = db.findById('orders', orderId);
    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404
      };
    }

    // Authorization check
    if (userRole !== 'admin') {
      if (order.userId !== userId) {
        return {
          success: false,
          message: 'Not authorized to update this order',
          statusCode: 403
        };
      }
      if (status !== 'cancelled') {
        return {
          success: false,
          message: 'Customers can only cancel orders',
          statusCode: 403
        };
      }
    }

    const updated = db.update('orders', orderId, {
      status,
      updatedAt: new Date().toISOString()
    });

    // Create notification
    db.create('notifications', {
      userId: order.userId,
      title: 'Order Status Updated',
      message: `Order #${orderId} is now ${status}`,
      type: 'order',
      refId: orderId,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Order status updated successfully',
      data: updated
    };
  }

  async cancelOrder(orderId, userId, userRole) {
    const order = db.findById('orders', orderId);
    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404
      };
    }

    if (order.userId !== userId && userRole !== 'admin') {
      return {
        success: false,
        message: 'Not authorized to cancel this order',
        statusCode: 403
      };
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return {
        success: false,
        message: 'Cannot cancel order in current status',
        statusCode: 400,
        currentStatus: order.status
      };
    }

    const updated = db.update('orders', orderId, {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Order cancelled successfully',
      data: updated
    };
  }

  async getMyOrders(userId, options = {}) {
    const result = db.findAllAdvanced('orders', {
      ...options,
      filter: {
        ...options.filter,
        userId: userId
      }
    });

    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }
}

module.exports = new OrderService();