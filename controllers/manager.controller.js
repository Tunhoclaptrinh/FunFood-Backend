const db = require('../config/database');

class ManagerController {
  /**
   * Get restaurant của manager đang quản lý
   */
  getMyRestaurant = async (req, res, next) => {
    try {
      const restaurant = db.findOne('restaurants', { managerId: req.user.id });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found for this manager'
        });
      }

      // Get additional data
      const products = db.findMany('products', { restaurantId: restaurant.id });
      const reviews = db.findMany('reviews', { restaurantId: restaurant.id });
      const orders = db.findMany('orders', { restaurantId: restaurant.id });

      res.json({
        success: true,
        data: {
          ...restaurant,
          stats: {
            totalProducts: products.length,
            availableProducts: products.filter(p => p.available).length,
            totalReviews: reviews.length,
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get products của restaurant
   */
  getProducts = async (req, res, next) => {
    try {
      const restaurant = db.findOne('restaurants', { managerId: req.user.id });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const result = db.findAllAdvanced('products', {
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
   * Create product
   */
  createProduct = async (req, res, next) => {
    try {
      const restaurant = db.findOne('restaurants', { managerId: req.user.id });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const product = db.create('products', {
        ...req.body,
        restaurantId: restaurant.id,
        available: req.body.available !== undefined ? req.body.available : true,
        discount: req.body.discount || 0,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update product
   */
  updateProduct = async (req, res, next) => {
    try {
      const product = db.findById('products', req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check ownership
      const restaurant = db.findOne('restaurants', {
        managerId: req.user.id,
        id: product.restaurantId
      });

      if (!restaurant) {
        return res.status(403).json({
          success: false,
          message: 'You can only update products from your restaurant'
        });
      }

      const updated = db.update('products', req.params.id, {
        ...req.body,
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Toggle product availability
   */
  toggleProductAvailability = async (req, res, next) => {
    try {
      const product = db.findById('products', req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check ownership
      const restaurant = db.findOne('restaurants', {
        managerId: req.user.id,
        id: product.restaurantId
      });

      if (!restaurant) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      const updated = db.update('products', req.params.id, {
        available: !product.available,
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: `Product ${updated.available ? 'enabled' : 'disabled'}`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get orders của restaurant
   */
  getOrders = async (req, res, next) => {
    try {
      const restaurant = db.findOne('restaurants', { managerId: req.user.id });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const result = db.findAllAdvanced('orders', {
        ...req.parsedQuery,
        filter: {
          ...req.parsedQuery.filter,
          restaurantId: restaurant.id
        },
        sort: req.parsedQuery.sort || 'createdAt',
        order: req.parsedQuery.order || 'desc'
      });

      // Enrich với customer info
      const enriched = result.data.map(order => {
        const customer = db.findById('users', order.userId);
        return {
          ...order,
          customer: customer ? {
            id: customer.id,
            name: customer.name,
            phone: customer.phone
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
   * Get order detail
   */
  getOrderDetail = async (req, res, next) => {
    try {
      const order = req.resource; // Set by checkOwnership middleware

      const customer = db.findById('users', order.userId);
      const shipper = order.shipperId ? db.findById('users', order.shipperId) : null;

      res.json({
        success: true,
        data: {
          ...order,
          customer: customer ? {
            id: customer.id,
            name: customer.name,
            phone: customer.phone
          } : null,
          shipper: shipper ? {
            id: shipper.id,
            name: shipper.name,
            phone: shipper.phone
          } : null
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update order status (confirm/prepare)
   */
  updateOrderStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
      const order = req.resource;

      // Manager chỉ được confirm hoặc prepare
      if (!['confirmed', 'preparing'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: 'Manager can only confirm or prepare orders'
        });
      }

      const updateData = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (status === 'confirmed') {
        updateData.confirmedAt = new Date().toISOString();
      } else if (status === 'preparing') {
        updateData.preparingAt = new Date().toISOString();
      }

      const updated = db.update('orders', order.id, updateData);

      // Notify customer
      db.create('notifications', {
        userId: order.userId,
        title: 'Order Status Updated',
        message: `Your order #${order.id} is now ${status}`,
        type: 'order',
        refId: order.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Notify shippers when preparing
      if (status === 'preparing') {
        const shippers = db.findMany('users', { role: 'shipper', isActive: true });
        shippers.forEach(shipper => {
          db.create('notifications', {
            userId: shipper.id,
            title: 'New Order Ready',
            message: `Order #${order.id} is ready for pickup`,
            type: 'order',
            refId: order.id,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        });
      }

      res.json({
        success: true,
        message: 'Order status updated',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get statistics
   */
  getStats = async (req, res, next) => {
    try {
      const restaurant = db.findOne('restaurants', { managerId: req.user.id });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
      }

      const orders = db.findMany('orders', { restaurantId: restaurant.id });
      const products = db.findMany('products', { restaurantId: restaurant.id });
      const reviews = db.findMany('reviews', { restaurantId: restaurant.id });

      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);

      const stats = {
        orders: {
          total: orders.length,
          today: orders.filter(o => o.createdAt.startsWith(today)).length,
          thisMonth: orders.filter(o => o.createdAt.startsWith(thisMonth)).length,
          pending: orders.filter(o => o.status === 'pending').length,
          confirmed: orders.filter(o => o.status === 'confirmed').length,
          preparing: orders.filter(o => o.status === 'preparing').length,
          completed: orders.filter(o => o.status === 'delivered').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length
        },
        revenue: {
          total: orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + o.total, 0),
          today: orders
            .filter(o => o.status === 'delivered' && o.createdAt.startsWith(today))
            .reduce((sum, o) => sum + o.total, 0),
          thisMonth: orders
            .filter(o => o.status === 'delivered' && o.createdAt.startsWith(thisMonth))
            .reduce((sum, o) => sum + o.total, 0)
        },
        products: {
          total: products.length,
          available: products.filter(p => p.available).length,
          outOfStock: products.filter(p => !p.available).length
        },
        reviews: {
          total: reviews.length,
          averageRating: reviews.length > 0
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
            : 0,
          thisMonth: reviews.filter(r => r.createdAt.startsWith(thisMonth)).length
        },
        topProducts: this.getTopProducts(orders, products).slice(0, 5)
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Helper: Get top selling products
   */
  getTopProducts(orders, products) {
    const productSales = {};

    orders
      .filter(o => o.status === 'delivered')
      .forEach(order => {
        order.items.forEach(item => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              productId: item.productId,
              productName: item.productName,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.itemTotal || (item.finalPrice * item.quantity);
        });
      });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity);
  }
}

module.exports = new ManagerController();