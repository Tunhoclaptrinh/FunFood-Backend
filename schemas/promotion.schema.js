/**
 * Promotion Schema for Import/Export
 */

module.exports = {
  code: {
    type: 'string',
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 20
  },
  description: {
    type: 'string',
    required: true,
    maxLength: 500
  },
  discountType: {
    type: 'enum',
    required: true,
    values: ['percentage', 'fixed', 'delivery']
  },
  discountValue: {
    type: 'number',
    required: true,
    min: 0
  },
  minOrderValue: {
    type: 'number',
    required: false,
    min: 0,
    default: 0
  },
  maxDiscount: {
    type: 'number',
    required: false,
    min: 0
  },
  validFrom: {
    type: 'date',
    required: true
  },
  validTo: {
    type: 'date',
    required: true
  },
  usageLimit: {
    type: 'number',
    required: false,
    min: 0
  },
  perUserLimit: {
    type: 'number',
    required: false,
    min: 0
  },
  isActive: {
    type: 'boolean',
    required: false,
    default: true
  }
};