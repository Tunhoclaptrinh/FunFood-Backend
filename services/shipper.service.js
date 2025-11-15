const db = require('../config/database');

class ShipperService {
  /**
   * Lấy danh sách đơn có thể nhận (status = preparing)
   */
  async getAvailableOrders(shipperId, options = {}) {
    const result = db.findAllAdvanced('orders', {
      ...options,
      filter: {
        ...options.filter,
        status: 'preparing',
        shipperId: null  // Chưa có shipper
      }
    });

    // Enrich với restaurant & customer info
    const enrichedOrders = result.data.map(order => {
      const restaurant = db.findById('restaurants', order.restaurantId);
      const customer = db.findById('users', order.userId);

      return {
        ...order,
        restaurant: restaurant ? {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          phone: restaurant.phone
        } : null,
        customer: customer ? {
          name: customer.name,
          phone: customer.phone
        } : null
      };
    });

    return {
      success: true,
      data: enrichedOrders,
      pagination: result.pagination
    };
  }

  /**
   * Nhận đơn hàng
   */
  async acceptOrder(orderId, shipperId) {
    const order = db.findById('orders', orderId);

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404
      };
    }

    // Kiểm tra status
    if (order.status !== 'preparing') {
      return {
        success: false,
        message: 'Order is not ready for pickup',
        statusCode: 400
      };
    }

    // Kiểm tra đã có shipper chưa
    if (order.shipperId) {
      return {
        success: false,
        message: 'Order already assigned to another shipper',
        statusCode: 400
      };
    }

    // Assign shipper
    const updated = db.update('orders', orderId, {
      shipperId: shipperId,
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Update shipper status
    const shipper = db.findById('users', shipperId);
    const currentOrders = shipper.currentOrders || [];
    db.update('users', shipperId, {
      currentOrders: [...currentOrders, orderId],
      isAvailable: false  // Đang bận
    });

    // Create notification cho customer
    db.create('notifications', {
      userId: order.userId,
      title: 'Shipper Assigned',
      message: `Your order #${orderId} has been picked up by shipper`,
      type: 'order',
      refId: orderId,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Order accepted successfully',
      data: updated
    };
  }

  /**
   * Xem đơn đang giao của mình
   */
  async getMyDeliveries(shipperId, options = {}) {
    const result = db.findAllAdvanced('orders', {
      ...options,
      filter: {
        ...options.filter,
        shipperId: shipperId,
        status_in: ['delivering', 'preparing']
      }
    });

    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  /**
   * Cập nhật trạng thái đơn
   */
  async updateOrderStatus(orderId, shipperId, status) {
    const order = db.findById('orders', orderId);

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404
      };
    }

    // Kiểm tra ownership
    if (order.shipperId !== shipperId) {
      return {
        success: false,
        message: 'This order is not assigned to you',
        statusCode: 403
      };
    }

    // Kiểm tra flow hợp lệ
    const validTransitions = {
      'preparing': 'delivering',
      'delivering': 'delivered'
    };

    if (validTransitions[order.status] !== status) {
      return {
        success: false,
        message: `Cannot transition from ${order.status} to ${status}`,
        statusCode: 400
      };
    }

    // Update data
    const updateData = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (status === 'delivering') {
      updateData.pickedUpAt = new Date().toISOString();
    }

    if (status === 'delivered') {
      updateData.deliveredAt = new Date().toISOString();

      // Update shipper status
      const shipper = db.findById('users', shipperId);
      const currentOrders = (shipper.currentOrders || []).filter(id => id !== parseInt(orderId));
      db.update('users', shipperId, {
        currentOrders,
        isAvailable: currentOrders.length === 0  // Rảnh nếu không còn đơn nào
      });
    }

    const updated = db.update('orders', orderId, updateData);

    // Create notification
    const statusMessages = {
      'delivering': 'Your order is on the way',
      'delivered': 'Your order has been delivered'
    };

    db.create('notifications', {
      userId: order.userId,
      title: 'Order Status Updated',
      message: statusMessages[status],
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

  /**
   * Thống kê shipper
   */
  async getStats(shipperId) {
    const allOrders = db.findMany('orders', { shipperId });

    const stats = {
      total: allOrders.length,
      delivering: allOrders.filter(o => o.status === 'delivering').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      totalEarnings: allOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.deliveryFee * 0.8), 0), // 80% cho shipper
      avgDeliveryTime: this.calculateAvgDeliveryTime(allOrders),
      todayDeliveries: allOrders.filter(o => {
        const today = new Date().toISOString().split('T')[0];
        return o.deliveredAt?.startsWith(today);
      }).length
    };

    return {
      success: true,
      data: stats
    };
  }

  calculateAvgDeliveryTime(orders) {
    const delivered = orders.filter(o => o.pickedUpAt && o.deliveredAt);

    if (delivered.length === 0) return 0;

    const totalTime = delivered.reduce((sum, o) => {
      const pickupTime = new Date(o.pickedUpAt);
      const deliveredTime = new Date(o.deliveredAt);
      return sum + (deliveredTime - pickupTime);
    }, 0);

    return Math.round(totalTime / delivered.length / 60000); // minutes
  }
}

module.exports = new ShipperService();