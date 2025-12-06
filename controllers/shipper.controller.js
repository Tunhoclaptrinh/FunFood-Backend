const db = require('../config/database');

class ShipperController {
  /**
   * GET /api/shipper/orders/available
   * Xem các đơn đang chờ shipper (status = preparing)
   */
  getAvailableOrders = async (req, res, next) => {
    try {
      const result = await db.findAllAdvanced('orders', {
        ...req.parsedQuery,
        filter: {
          ...req.parsedQuery.filter,
          status: 'preparing',
          shipperId: null  // Chưa có shipper
        },
        sort: req.parsedQuery.sort || 'createdAt',
        order: req.parsedQuery.order || 'desc'
      });

      // Enrich với restaurant & customer info
      const enrichedOrders = await Promise.all(result.data.map(async (order) => {
        const [restaurant, customer] = await Promise.all([
          db.findById('restaurants', order.restaurantId),
          db.findById('users', order.userId)
        ]);

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
      }));

      res.json({
        success: true,
        count: enrichedOrders.length,
        data: enrichedOrders,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/shipper/orders/:id/accept
   * Nhận đơn hàng
   */
  acceptOrder = async (req, res, next) => {
    try {
      const order = await db.findById('orders', req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Kiểm tra status
      if (order.status !== 'preparing') {
        return res.status(400).json({
          success: false,
          message: 'Order is not ready for pickup',
          currentStatus: order.status
        });
      }

      // Kiểm tra đã có shipper chưa
      if (order.shipperId) {
        return res.status(400).json({
          success: false,
          message: 'Order already assigned to another shipper'
        });
      }

      // Assign shipper & update status
      const updated = await db.update('orders', req.params.id, {
        shipperId: req.user.id,
        assignedAt: new Date().toISOString(),
        status: 'delivering',
        deliveringAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Create notification cho customer
      await db.create('notifications', {
        userId: order.userId,
        title: 'Order Picked Up',
        message: `Your order #${order.id} is on the way!`,
        type: 'order',
        refId: order.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Order accepted successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/shipper/orders/my-deliveries
   * Xem đơn đang giao của mình
   */
  getMyDeliveries = async (req, res, next) => {
    try {
      const result = await db.findAllAdvanced('orders', {
        ...req.parsedQuery,
        filter: {
          ...req.parsedQuery.filter,
          shipperId: req.user.id,
          status_in: 'delivering,delivered'
        },
        sort: req.parsedQuery.sort || 'createdAt',
        order: req.parsedQuery.order || 'desc'
      });

      // Enrich with customer & restaurant info
      const enriched = await Promise.all(result.data.map(async (order) => {
        const [customer, restaurant] = await Promise.all([
          db.findById('users', order.userId),
          db.findById('restaurants', order.restaurantId)
        ]);

        return {
          ...order,
          customer: customer ? {
            name: customer.name,
            phone: customer.phone,
            address: order.deliveryAddress
          } : null,
          restaurant: restaurant ? {
            name: restaurant.name,
            address: restaurant.address,
            phone: restaurant.phone
          } : null
        };
      }));

      res.json({
        success: true,
        count: enriched.length,
        data: enriched,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/shipper/orders/:id/status
   * Cập nhật trạng thái đơn (delivering, delivered)
   */
  updateOrderStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
      const order = await db.findById('orders', req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Kiểm tra ownership
      if (order.shipperId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'This order is not assigned to you'
        });
      }

      // Validate status
      if (!['delivering', 'delivered'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Shipper can only update to: delivering, delivered'
        });
      }

      // Kiểm tra flow hợp lệ
      const validTransitions = {
        'preparing': 'delivering',
        'delivering': 'delivered'
      };

      if (validTransitions[order.status] !== status) {
        return res.status(400).json({
          success: false,
          message: `Cannot transition from ${order.status} to ${status}`,
          currentStatus: order.status,
          allowedStatus: validTransitions[order.status]
        });
      }

      // Update data
      const updateData = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (status === 'delivered') {
        updateData.deliveredAt = new Date().toISOString();
        updateData.paymentStatus = 'completed';
      }

      const updated = await db.update('orders', req.params.id, updateData);

      // Create notification
      const statusMessages = {
        'delivering': 'Your order is on the way',
        'delivered': 'Your order has been delivered. Enjoy your meal!'
      };

      await db.create('notifications', {
        userId: order.userId,
        title: 'Order Status Updated',
        message: statusMessages[status],
        type: 'order',
        refId: order.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/shipper/orders/history
   * Xem lịch sử giao hàng
   */
  getDeliveryHistory = async (req, res, next) => {
    try {
      const result = await db.findAllAdvanced('orders', {
        ...req.parsedQuery,
        filter: {
          ...req.parsedQuery.filter,
          shipperId: req.user.id,
          status: 'delivered'
        },
        sort: req.parsedQuery.sort || 'deliveredAt',
        order: req.parsedQuery.order || 'desc'
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
   * GET /api/shipper/stats
   * Thống kê shipper
   */
  getStats = async (req, res, next) => {
    try {
      const allOrders = await db.findMany('orders', { shipperId: req.user.id });

      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);

      const stats = {
        total: allOrders.length,
        byStatus: {
          delivering: allOrders.filter(o => o.status === 'delivering').length,
          delivered: allOrders.filter(o => o.status === 'delivered').length
        },
        today: {
          total: allOrders.filter(o => o.assignedAt?.startsWith(today)).length,
          delivered: allOrders.filter(o =>
            o.status === 'delivered' && o.deliveredAt?.startsWith(today)
          ).length
        },
        thisMonth: {
          total: allOrders.filter(o => o.assignedAt?.startsWith(thisMonth)).length,
          delivered: allOrders.filter(o =>
            o.status === 'delivered' && o.deliveredAt?.startsWith(thisMonth)
          ).length
        },
        earnings: {
          total: this.calculateEarnings(allOrders),
          today: this.calculateEarnings(
            allOrders.filter(o => o.deliveredAt?.startsWith(today))
          ),
          thisMonth: this.calculateEarnings(
            allOrders.filter(o => o.deliveredAt?.startsWith(thisMonth))
          )
        },
        avgDeliveryTime: this.calculateAvgDeliveryTime(allOrders)
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  // ============= HELPER METHODS =============

  /**
   * Calculate earnings (80% của delivery fee)
   */
  calculateEarnings(orders) {
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalDeliveryFees = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    return Math.round(totalDeliveryFees * 0.8); // Shipper nhận 80%
  }

  /**
   * Calculate average delivery time
   */
  calculateAvgDeliveryTime(orders) {
    const delivered = orders.filter(o =>
      o.status === 'delivered' && o.assignedAt && o.deliveredAt
    );

    if (delivered.length === 0) return 0;

    const totalTime = delivered.reduce((sum, o) => {
      const assignedTime = new Date(o.assignedAt);
      const deliveredTime = new Date(o.deliveredAt);
      return sum + (deliveredTime - assignedTime);
    }, 0);

    return Math.round(totalTime / delivered.length / 60000); // minutes
  }
}

module.exports = new ShipperController();