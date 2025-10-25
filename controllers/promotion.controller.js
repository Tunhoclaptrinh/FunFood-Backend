const db = require('../config/database');

exports.getPromotions = async (req, res, next) => {
  try {
    const promotions = db.findAll('promotions');

    res.json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (error) {
    next(error);
  }
};

exports.getActivePromotions = async (req, res, next) => {
  try {
    const now = new Date();
    const promotions = db.findAll('promotions').filter(p =>
      p.isActive &&
      new Date(p.validFrom) <= now &&
      new Date(p.validTo) >= now
    );

    res.json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (error) {
    next(error);
  }
};

exports.validatePromotion = async (req, res, next) => {
  try {
    const { code, orderValue } = req.body;

    if (!code || !orderValue) {
      return res.status(400).json({
        success: false,
        message: 'Code and order value are required'
      });
    }

    const promotion = db.findOne('promotions', { code, isActive: true });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promotion code'
      });
    }

    const now = new Date();
    if (new Date(promotion.validFrom) > now || new Date(promotion.validTo) < now) {
      return res.status(400).json({
        success: false,
        message: 'Promotion code has expired'
      });
    }

    if (orderValue < promotion.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is ${promotion.minOrderValue}`
      });
    }

    let discount = 0;
    if (promotion.discountType === 'percentage') {
      discount = Math.min((orderValue * promotion.discountValue / 100), promotion.maxDiscount);
    } else if (promotion.discountType === 'fixed') {
      discount = promotion.discountValue;
    }

    res.json({
      success: true,
      message: 'Promotion code is valid',
      data: {
        promotion,
        discount,
        finalAmount: orderValue - discount
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createPromotion = async (req, res, next) => {
  try {
    const promotion = db.create('promotions', {
      ...req.body,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: promotion
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePromotion = async (req, res, next) => {
  try {
    const promotion = db.update('promotions', req.params.id, req.body);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      message: 'Promotion updated successfully',
      data: promotion
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePromotion = async (req, res, next) => {
  try {
    const result = db.delete('promotions', req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
