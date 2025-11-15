const shipperService = require('../services/shipper.service');

class ShipperController {
  /**
   * GET /api/shipper/orders/available
   * Xem các đơn đang chờ shipper (status = preparing)
   */
  getAvailableOrders = async (req, res, next) => {
    try {
      const result = await shipperService.getAvailableOrders(
        req.user.id,
        req.parsedQuery
      );

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
   * POST /api/shipper/orders/:id/accept
   * Nhận đơn hàng
   */
  acceptOrder = async (req, res, next) => {
    try {
      const result = await shipperService.acceptOrder(
        req.params.id,
        req.user.id
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
   * GET /api/shipper/orders/my-deliveries
   * Xem đơn đang giao của mình
   */
  getMyDeliveries = async (req, res, next) => {
    try {
      const result = await shipperService.getMyDeliveries(
        req.user.id,
        req.parsedQuery
      );

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
   * PATCH /api/shipper/orders/:id/status
   * Cập nhật trạng thái đơn (delivering, delivered)
   */
  updateOrderStatus = async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!['delivering', 'delivered'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Shipper can only update to: delivering, delivered'
        });
      }

      const result = await shipperService.updateOrderStatus(
        req.params.id,
        req.user.id,
        status
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
   * GET /api/shipper/stats
   * Thống kê shipper
   */
  getStats = async (req, res, next) => {
    try {
      const result = await shipperService.getStats(req.user.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ShipperController();