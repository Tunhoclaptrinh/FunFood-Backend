const BaseService = require('../utils/BaseService');
const db = require('../config/database');
const { calculateDistance, calculateDeliveryFee } = require('../utils/helpers');

class OrderService extends BaseService {
  constructor() {
    super('orders');
  }

  /**
   * Validate trước khi tạo order
   */
  async validateCreate(data) {
    // 1. Validate items
    if (!data.items || data.items.length === 0) {
      return {
        success: false,
        message: 'Order must have at least one item',
        statusCode: 400
      };
    }

    // 2. Validate restaurant
    const restaurant = await db.findById('restaurants', data.restaurantId);
    if (!restaurant) {
      return {
        success: false,
        message: 'Restaurant not found',
        statusCode: 404
      };
    }

    // 3. Check restaurant is open
    if (!restaurant.isOpen) {
      return {
        success: false,
        message: 'Restaurant is currently closed',
        statusCode: 400,
        data: {
          openTime: restaurant.openTime,
          closeTime: restaurant.closeTime
        }
      };
    }

    // 4. Validate products
    const productErrors = [];
    for (const item of data.items) {
      const product = await db.findById('products', item.productId);

      if (!product) {
        productErrors.push({
          productId: item.productId,
          error: 'Product not found'
        });
        continue;
      }

      if (!product.available) {
        productErrors.push({
          productId: item.productId,
          productName: product.name,
          error: 'Product is not available'
        });
        continue;
      }

      if (product.restaurantId !== data.restaurantId) {
        productErrors.push({
          productId: item.productId,
          productName: product.name,
          error: 'Product does not belong to this restaurant'
        });
      }

      if (item.quantity <= 0) {
        productErrors.push({
          productId: item.productId,
          error: 'Quantity must be greater than 0'
        });
      }
    }

    if (productErrors.length > 0) {
      return {
        success: false,
        message: 'Invalid products in order',
        statusCode: 400,
        errors: productErrors
      };
    }

    // 5. Validate delivery address
    if (!data.deliveryAddress) {
      return {
        success: false,
        message: 'Delivery address is required',
        statusCode: 400
      };
    }

    // 6. Check user has no pending payment orders
    const existingOrders = await db.findMany('orders', {
      userId: data.userId,
      paymentStatus: 'pending'
    });

    const unpaidCount = existingOrders.filter(o =>
      ['pending', 'confirmed', 'preparing'].includes(o.status)
    ).length;

    if (unpaidCount >= 3) {
      return {
        success: false,
        message: 'You have too many unpaid orders. Please complete or cancel existing orders first.',
        statusCode: 400,
        unpaidOrders: unpaidCount
      };
    }

    return { success: true };
  }

  /**
   * Transform data trước khi create
   */
  async beforeCreate(data) {
    const { restaurantId, items, deliveryLatitude, deliveryLongitude, promotionCode } = data;

    // 1. Calculate subtotal
    let subtotal = 0;

    const orderItems = await Promise.all(items.map(async (item) => {
      const product = await db.findById('products', item.productId);
      const itemPrice = product.price * (1 - product.discount / 100);
      subtotal += itemPrice * item.quantity;

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
        finalPrice: Math.round(itemPrice),
        itemTotal: Math.round(itemPrice * item.quantity)
      };
    }));

    // 2. Calculate delivery fee
    const restaurant = await db.findById('restaurants', restaurantId);
    let deliveryFee = restaurant.deliveryFee || 15000;
    let estimatedDistance = 0;

    if (deliveryLatitude && deliveryLongitude && restaurant.latitude && restaurant.longitude) {
      estimatedDistance = calculateDistance(
        restaurant.latitude,
        restaurant.longitude,
        deliveryLatitude,
        deliveryLongitude
      );
      deliveryFee = calculateDeliveryFee(estimatedDistance);
    }

    // 3. Apply promotion if valid
    let discount = 0;
    let appliedPromotion = null;

    if (promotionCode) {
      const promotionResult = await this.validateAndApplyPromotion(
        promotionCode,
        subtotal,
        deliveryFee,
        data.userId
      );

      if (promotionResult.success) {
        discount = promotionResult.discount;
        appliedPromotion = promotionResult.promotion;
      }
    }

    // 4. Calculate total
    const total = Math.round(subtotal + deliveryFee - discount);

    // 5. Estimate delivery time
    const estimatedDeliveryTime = this.calculateEstimatedTime(estimatedDistance);

    return {
      userId: data.userId,
      restaurantId: parseInt(restaurantId),
      items: orderItems,
      subtotal: Math.round(subtotal),
      deliveryFee,
      discount: Math.round(discount),
      total,

      // Status & Payment
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: data.paymentMethod,

      // Delivery info
      deliveryAddress: data.deliveryAddress,
      deliveryLatitude: deliveryLatitude || null,
      deliveryLongitude: deliveryLongitude || null,
      estimatedDistance: Math.round(estimatedDistance * 10) / 10,
      estimatedDeliveryTime,

      // Additional info
      note: data.note || '',
      promotionCode: promotionCode ? promotionCode.toUpperCase() : null,
      promotionId: appliedPromotion?.id || null,

      // Shipper info (will be assigned later)
      shipperId: null,
      assignedAt: null,
      pickedUpAt: null,
      deliveredAt: null,

      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Hook sau khi tạo order
   */
  async afterCreate(order) {
    // 1. Clear cart items
    const cartItems = await db.findMany('cart', { userId: order.userId });

    // Dùng Promise.all để xóa song song
    await Promise.all(cartItems.map(async (item) => {
      const product = await db.findById('products', item.productId);
      if (product && product.restaurantId === order.restaurantId) {
        await db.delete('cart', item.id);
      }
    }));

    // 2. Update promotion usage
    if (order.promotionId) {
      const promotion = await db.findById('promotions', order.promotionId);
      if (promotion) {
        await db.update('promotions', promotion.id, {
          usageCount: (promotion.usageCount || 0) + 1
        });
      }
    }

    // 3. Create notification for customer
    await db.create('notifications', {
      userId: order.userId,
      title: 'Order Created',
      message: `Order #${order.id} has been placed successfully. Total: ${order.total.toLocaleString()}đ`,
      type: 'order',
      refId: order.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    // 4. Notify restaurant manager (if exists)
    const restaurant = await db.findById('restaurants', order.restaurantId);
    if (restaurant.managerId) {
      await db.create('notifications', {
        userId: restaurant.managerId,
        title: 'New Order Received',
        message: `New order #${order.id} from customer. Please confirm.`,
        type: 'order',
        refId: order.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    // 5. Log order event
    this.logOrderEvent(order.id, 'created', order.userId, {
      total: order.total,
      items: order.items.length
    });
  }

  /**
   * Update order status với workflow validation
   */
  async updateStatus(orderId, newStatus, userId, userRole) {
    const order = await db.findById('orders', orderId);

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404
      };
    }

    // Validate status transition (đã check ở middleware)
    // Ở đây chỉ cần update

    const updateData = {
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    // Set timestamps cho từng status
    switch (newStatus) {
      case 'confirmed':
        updateData.confirmedAt = new Date().toISOString();
        break;
      case 'preparing':
        updateData.preparingAt = new Date().toISOString();
        break;
      case 'delivering':
        updateData.deliveringAt = new Date().toISOString();
        // Auto-assign shipper nếu chưa có
        if (!order.shipperId && userRole === 'shipper') {
          updateData.shipperId = userId;
          updateData.assignedAt = new Date().toISOString();
        }
        break;
      case 'delivered':
        updateData.deliveredAt = new Date().toISOString();
        updateData.paymentStatus = 'completed';
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date().toISOString();
        updateData.cancelledBy = userId;
        updateData.paymentStatus = 'cancelled';
        break;
    }

    const updated = await db.update('orders', orderId, updateData);

    // Create notifications
    await this.notifyOrderStatusChange(updated, userRole);

    // Log event
    this.logOrderEvent(orderId, `status_${newStatus}`, userId);

    return {
      success: true,
      message: `Order status updated to ${newStatus}`,
      data: updated
    };
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, userId, userRole, reason = '') {
    const order = await db.findById('orders', orderId);

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404
      };
    }

    // Validate can cancel
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return {
        success: false,
        message: `Cannot cancel order in status: ${order.status}`,
        statusCode: 400,
        currentStatus: order.status
      };
    }

    const updated = await db.update('orders', orderId, {
      status: 'cancelled',
      paymentStatus: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: userId,
      cancelReason: reason,
      updatedAt: new Date().toISOString()
    });

    // Refund promotion usage
    if (order.promotionId) {
      const promotion = await db.findById('promotions', order.promotionId);
      if (promotion && promotion.usageCount > 0) {
        await db.update('promotions', promotion.id, {
          usageCount: promotion.usageCount - 1
        });
      }
    }

    // Notify
    await this.notifyOrderStatusChange(updated, userRole);

    // Log
    this.logOrderEvent(orderId, 'cancelled', userId, { reason });

    return {
      success: true,
      message: 'Order cancelled successfully',
      data: updated
    };
  }

  /**
   * Validate and apply promotion
   */
  async validateAndApplyPromotion(code, orderValue, deliveryFee, userId) {
    const promotion = await db.findOne('promotions', {
      code: code.toUpperCase(),
      isActive: true
    });

    if (!promotion) {
      return { success: false, discount: 0 };
    }

    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validTo = new Date(promotion.validTo);

    // Check date validity
    if (validFrom > now || validTo < now) {
      return { success: false, discount: 0 };
    }

    // Check min order value
    if (orderValue < promotion.minOrderValue) {
      return { success: false, discount: 0 };
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return { success: false, discount: 0 };
    }

    // Check per user limit
    if (promotion.perUserLimit) {
      const userOrders = await db.findMany('orders', {
        userId,
        promotionId: promotion.id
      });
      if (userOrders.length >= promotion.perUserLimit) {
        return { success: false, discount: 0 };
      }
    }

    // Calculate discount
    let discount = 0;

    if (promotion.discountType === 'percentage') {
      discount = Math.min(
        (orderValue * promotion.discountValue / 100),
        promotion.maxDiscount || Infinity
      );
    } else if (promotion.discountType === 'fixed') {
      discount = promotion.discountValue;
    } else if (promotion.discountType === 'delivery') {
      discount = deliveryFee;
    }

    return {
      success: true,
      discount: Math.round(discount),
      promotion
    };
  }

  /**
   * Calculate estimated delivery time
   */
  calculateEstimatedTime(distance) {
    // Base time: 15 minutes
    // + 3 minutes per km
    const baseTime = 15;
    const timePerKm = 3;
    const totalMinutes = Math.ceil(baseTime + (distance * timePerKm));

    return `${totalMinutes}-${totalMinutes + 10} phút`;
  }

  /**
   * Notify order status change
   */
  async notifyOrderStatusChange(order, changedByRole) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed by restaurant',
      preparing: 'Your order is being prepared',
      delivering: 'Your order is on the way!',
      delivered: 'Your order has been delivered. Enjoy your meal!',
      cancelled: 'Your order has been cancelled'
    };

    // Notify customer
    if (statusMessages[order.status]) {
      await db.create('notifications', {
        userId: order.userId,
        title: 'Order Status Update',
        message: statusMessages[order.status],
        type: 'order',
        refId: order.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    // Notify shipper when order ready for pickup
    if (order.status === 'preparing' && !order.shipperId) {
      // Broadcast to all available shippers
      const shippers = db.findMany('users', {
        role: 'shipper',
        isActive: true
      });

      // Gửi noti cho tất cả shipper song song
      await Promise.all(shippers.map(shipper => {
        if (shipper.isAvailable !== false) {
          return db.create('notifications', {
            userId: shipper.id,
            title: 'New Order Available',
            message: `Order #${order.id} is ready for pickup`,
            type: 'order',
            refId: order.id,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }));
    }
  }

  /**
   * Log order events for tracking
   */
  logOrderEvent(orderId, event, userId, metadata = {}) {
    // In production, save to separate events table
    console.log(`[ORDER EVENT] ${orderId} - ${event} by ${userId}`, metadata);
  }

  /**
   * Get orders with advanced filtering
   */
  async getMyOrders(userId, options = {}) {
    const result = await db.findAllAdvanced('orders', {
      ...options,
      filter: {
        ...options.filter,
        userId: userId
      },
      sort: options.sort || 'createdAt',
      order: options.order || 'desc'
    });

    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  /**
   * Get order statistics
   */
  async getOrderStats(userId, userRole) {
    let orders;

    if (userRole === 'admin') {
      orders = await db.findAll('orders');
    } else if (userRole === 'manager') {
      const restaurant = await db.findOne('restaurants', { managerId: userId });
      orders = restaurant ? await db.findMany('orders', { restaurantId: restaurant.id }) : [];
    } else if (userRole === 'shipper') {
      orders = await db.findMany('orders', { shipperId: userId });
    } else {
      orders = await db.findMany('orders', { userId });
    }

    const stats = {
      total: orders.length,
      byStatus: {},
      totalRevenue: 0,
      averageOrderValue: 0
    };

    // Count by status
    ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'].forEach(status => {
      stats.byStatus[status] = orders.filter(o => o.status === status).length;
    });

    // Calculate revenue
    const completedOrders = orders.filter(o => o.status === 'delivered');
    stats.totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    stats.averageOrderValue = completedOrders.length > 0
      ? Math.round(stats.totalRevenue / completedOrders.length)
      : 0;

    return {
      success: true,
      data: stats
    };
  }
}

module.exports = new OrderService();