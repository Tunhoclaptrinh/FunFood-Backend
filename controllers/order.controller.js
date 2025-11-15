const BaseController = require('../utils/BaseController');
const orderService = require('../services/order.service');
const db = require('../config/database');

class OrderController extends BaseController {
  constructor() {
    super(orderService);
  }

  // ==================== CUSTOMER ACTIONS ====================

  /**
   * Create new order
   */
  create = async (req, res, next) => {
    try {
      const errors = this.validateRequest(req);
      if (errors) {
        return res.status(400).json({
          success: false,
          errors
        });
      }

      const result = await this.service.create({
        ...req.body,
        userId: req.user.id
      });

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message,
          errors: result.errors
        });
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get my orders
   */
  getMyOrders = async (req, res, next) => {
    try {
      const result = await this.service.getMyOrders(req.user.id, req.parsedQuery);

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
   * Cancel order
   */
  cancelOrder = async (req, res, next) => {
    try {
      const { reason } = req.body;

      const result = await this.service.cancelOrder(
        req.params.id,
        req.user.id,
        req.user.role,
        reason
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get my order statistics
   */
  getMyStats = async (req, res, next) => {
    try {
      const result = await this.service.getOrderStats(req.user.id, req.user.role);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reorder (copy existing order)
   */
  reorder = async (req, res, next) => {
    try {
      const originalOrder = db.findById('orders', req.params.id);

      if (!originalOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Create new order with same items
      const newOrderData = {
        restaurantId: originalOrder.restaurantId,
        items: originalOrder.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        deliveryAddress: originalOrder.deliveryAddress,
        deliveryLatitude: originalOrder.deliveryLatitude,
        deliveryLongitude: originalOrder.deliveryLongitude,
        paymentMethod: originalOrder.paymentMethod,
        note: req.body.note || originalOrder.note,
        userId: req.user.id
      };

      const result = await this.service.create(newOrderData);

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Order created from previous order',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Rate order (create review)
   */
  rateOrder = async (req, res, next) => {
    try {
      const order = db.findById('orders', req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Can only rate delivered orders'
        });
      }

      const { rating, comment } = req.body;

      // Create review
      const review = db.create('reviews', {
        userId: req.user.id,
        restaurantId: order.restaurantId,
        orderId: order.id,
        rating,
        comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update restaurant rating
      const reviews = db.findMany('reviews', { restaurantId: order.restaurantId });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      db.update('restaurants', order.restaurantId, {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for your rating!',
        data: review
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== ADMIN ACTIONS ====================

  /**
   * Get all orders (admin)
   */
  getAll = async (req, res, next) => {
    try {
      const result = await this.service.findAll(req.parsedQuery);

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
   * Admin update status (bypass validation)
   */
  adminUpdateStatus = async (req, res, next) => {
    try {
      const { status, note } = req.body;

      const order = db.findById('orders', req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const updated = db.update('orders', req.params.id, {
        status,
        [`${status}At`]: new Date().toISOString(),
        adminNote: note,
        updatedAt: new Date().toISOString()
      });

      // Notify customer
      db.create('notifications', {
        userId: order.userId,
        title: 'Order Status Updated',
        message: `Order #${order.id} status changed to ${status}`,
        type: 'order',
        refId: order.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Order status updated by admin',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get admin statistics
   */
  getAdminStats = async (req, res, next) => {
    try {
      const orders = db.findAll('orders');

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(o => o.createdAt.startsWith(today));

      const stats = {
        total: orders.length,
        today: todayOrders.length,
        byStatus: {},
        revenue: {
          total: 0,
          today: 0,
          thisMonth: 0
        },
        avgOrderValue: 0,
        topRestaurants: []
      };

      // Count by status
      ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'].forEach(status => {
        stats.byStatus[status] = orders.filter(o => o.status === status).length;
      });

      // Calculate revenue
      const completedOrders = orders.filter(o => o.status === 'delivered');
      stats.revenue.total = completedOrders.reduce((sum, o) => sum + o.total, 0);
      stats.revenue.today = todayOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0);

      const thisMonth = new Date().toISOString().slice(0, 7);
      stats.revenue.thisMonth = completedOrders
        .filter(o => o.createdAt.startsWith(thisMonth))
        .reduce((sum, o) => sum + o.total, 0);

      stats.avgOrderValue = completedOrders.length > 0
        ? Math.round(stats.revenue.total / completedOrders.length)
        : 0;

      // Top restaurants
      const restaurantOrders = {};
      completedOrders.forEach(order => {
        if (!restaurantOrders[order.restaurantId]) {
          restaurantOrders[order.restaurantId] = {
            count: 0,
            revenue: 0
          };
        }
        restaurantOrders[order.restaurantId].count++;
        restaurantOrders[order.restaurantId].revenue += order.total;
      });

      stats.topRestaurants = Object.entries(restaurantOrders)
        .map(([id, data]) => {
          const restaurant = db.findById('restaurants', parseInt(id));
          return {
            id: parseInt(id),
            name: restaurant?.name,
            orders: data.count,
            revenue: data.revenue
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Permanent delete order
   */
  permanentDelete = async (req, res, next) => {
    try {
      const order = db.findById('orders', req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Delete related data
      const notifications = db.findMany('notifications', { refId: order.id, type: 'order' });
      notifications.forEach(n => db.delete('notifications', n.id));

      const reviews = db.findMany('reviews', { orderId: order.id });
      reviews.forEach(r => db.delete('reviews', r.id));

      // Delete order
      db.delete('orders', req.params.id);

      res.json({
        success: true,
        message: 'Order permanently deleted',
        deleted: {
          order: 1,
          notifications: notifications.length,
          reviews: reviews.length
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== MANAGER ACTIONS ====================

  /**
   * Get restaurant orders (manager)
   */
  getRestaurantOrders = async (req, res, next) => {
    try {
      const restaurant = db.findOne('restaurants', { managerId: req.user.id });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found for this manager'
        });
      }

      const result = db.findAllAdvanced('orders', {
        ...req.parsedQuery,
        filter: {
          ...req.parsedQuery.filter,
          restaurantId: restaurant.id
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
   * Get manager statistics
   */
  getManagerStats = async (req, res, next) => {
    try {
      const restaurant = db.findOne('restaurants', { managerId: req.user.id });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const result = await this.service.getOrderStats(req.user.id, 'manager');

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // ==================== SHIPPER ACTIONS ====================

  /**
   * Get available orders (ready for pickup)
   */
  getAvailableOrders = async (req, res, next) => {
    try {
      const result = db.findAllAdvanced('orders', {
        ...req.parsedQuery,
        filter: {
          status: 'preparing',
          shipperId: null
        }
      });

      // Enrich with restaurant & distance info
      const enriched = result.data.map(order => {
        const restaurant = db.findById('restaurants', order.restaurantId);
        return {
          ...order,
          restaurant: restaurant ? {
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude
          } : null
        };
      });

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
   * Accept order (assign to shipper)
   */
  acceptOrder = async (req, res, next) => {
    try {
      const order = db.findById('orders', req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.status !== 'preparing') {
        return res.status(400).json({
          success: false,
          message: 'Order is not ready for pickup',
          currentStatus: order.status
        });
      }

      if (order.shipperId) {
        return res.status(400).json({
          success: false,
          message: 'Order already assigned to another shipper'
        });
      }

      // Assign to shipper
      const updated = db.update('orders', req.params.id, {
        shipperId: req.user.id,
        assignedAt: new Date().toISOString(),
        status: 'delivering',
        deliveringAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Notify customer
      db.create('notifications', {
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
   * Get my deliveries (shipper)
   */
  getMyDeliveries = async (req, res, next) => {
    try {
      const result = db.findAllAdvanced('orders', {
        ...req.parsedQuery,
        filter: {
          ...req.parsedQuery.filter,
          shipperId: req.user.id,
          status_in: ['delivering', 'delivered']
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
   * Get shipper statistics
   */
  getShipperStats = async (req, res, next) => {
    try {
      const result = await this.service.getOrderStats(req.user.id, 'shipper');

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // ==================== SHARED ACTIONS ====================

  /**
   * Update order status (với validation)
   */
  updateStatus = async (req, res, next) => {
    try {
      const { status } = req.body;

      const result = await this.service.updateStatus(
        req.params.id,
        status,
        req.user.id,
        req.user.role
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new OrderController();