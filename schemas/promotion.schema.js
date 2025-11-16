module.exports = {
  code: {
    type: 'string',
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 20,
    description: 'Promotion code'
  },
  description: {
    type: 'string',
    required: true,
    maxLength: 500,
    description: 'Promotion description'
  },
  discountType: {
    type: 'enum',
    enum: ['percentage', 'fixed', 'delivery'],
    required: true,
    description: 'Type of discount'
  },
  discountValue: {
    type: 'number',
    required: true,
    min: 0,
    description: 'Discount value'
  },
  minOrderValue: {
    type: 'number',
    required: false,
    min: 0,
    default: 0,
    description: 'Minimum order value'
  },
  maxDiscount: {
    type: 'number',
    required: false,
    min: 0,
    description: 'Maximum discount amount'
  },
  validFrom: {
    type: 'date',
    required: true,
    description: 'Valid from date'
  },
  validTo: {
    type: 'date',
    required: true,
    description: 'Valid to date'
  },
  usageLimit: {
    type: 'number',
    required: false,
    min: 0,
    description: 'Total usage limit'
  },
  perUserLimit: {
    type: 'number',
    required: false,
    min: 0,
    description: 'Per user usage limit'
  },
  isActive: {
    type: 'boolean',
    required: false,
    default: true,
    description: 'Promotion status'
  }
};
