const BaseService = require('../utils/BaseService');
const db = require('../config/database');
const promotionSchema = require('../schemas/promotion.schema');

class PromotionService extends BaseService {
  constructor() {
    super('promotions');
  }

  /**
     * Get schema for import/export
     */
  getSchema() {
    return promotionSchema;
  }

  async validateCreate(data) {
    const existingCode = db.findOne('promotions', { code: data.code.toUpperCase() });
    if (existingCode) {
      return {
        success: false,
        message: 'Promotion code already exists',
        statusCode: 400
      };
    }

    const validFrom = new Date(data.validFrom);
    const validTo = new Date(data.validTo);

    if (validFrom >= validTo) {
      return {
        success: false,
        message: 'Valid from date must be before valid to date',
        statusCode: 400
      };
    }

    return { success: true };
  }

  async beforeCreate(data) {
    return {
      ...data,
      code: data.code.toUpperCase(),
      isActive: data.isActive !== undefined ? data.isActive : true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async beforeUpdate(id, data) {
    if (data.code) {
      data.code = data.code.toUpperCase();
    }
    return {
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  async getActivePromotions(options = {}) {
    const now = new Date();
    const allPromotions = db.findAll('promotions');

    const activePromotions = allPromotions.filter(p =>
      p.isActive &&
      new Date(p.validFrom) <= now &&
      new Date(p.validTo) >= now
    );

    return {
      success: true,
      data: activePromotions
    };
  }

  async getByCode(code) {
    const promotion = db.findOne('promotions', {
      code: code.toUpperCase(),
      isActive: true
    });

    if (!promotion) {
      return {
        success: false,
        message: 'Promotion not found',
        statusCode: 404
      };
    }

    return {
      success: true,
      data: promotion
    };
  }

  async validatePromotion(code, orderValue, deliveryFee) {
    const promotion = db.findOne('promotions', {
      code: code.toUpperCase(),
      isActive: true
    });

    if (!promotion) {
      return {
        success: false,
        message: 'Invalid promotion code',
        statusCode: 404
      };
    }

    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validTo = new Date(promotion.validTo);

    if (validFrom > now || validTo < now) {
      return {
        success: false,
        message: 'Promotion code has expired',
        statusCode: 400
      };
    }

    if (orderValue < promotion.minOrderValue) {
      return {
        success: false,
        message: `Minimum order value is ${promotion.minOrderValue}`,
        statusCode: 400
      };
    }

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
      message: 'Promotion code is valid',
      data: {
        promotion,
        calculation: {
          orderValue,
          discount: Math.round(discount),
          finalAmount: Math.round(orderValue - discount),
          savings: Math.round(discount)
        }
      }
    };
  }

  async toggleActive(promotionId) {
    const promotion = db.findById('promotions', promotionId);

    if (!promotion) {
      return {
        success: false,
        message: 'Promotion not found',
        statusCode: 404
      };
    }

    const updated = db.update('promotions', promotionId, {
      isActive: !promotion.isActive,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `Promotion ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated
    };
  }
}

module.exports = new PromotionService();