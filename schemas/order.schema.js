module.exports = {
  restaurantId: {
    type: 'number',
    required: true,
    foreignKey: 'restaurants',
    description: 'Restaurant ID'
  },
  subtotal: {
    type: 'number',
    required: true,
    min: 0,
    description: 'Subtotal amount'
  },
  deliveryFee: {
    type: 'number',
    required: true,
    min: 0,
    description: 'Delivery fee'
  },
  discount: {
    type: 'number',
    required: false,
    min: 0,
    default: 0,
    description: 'Discount amount'
  },
  total: {
    type: 'number',
    required: true,
    min: 0,
    description: 'Total amount',
    custom: (value, data) => {
      // Check if total matches calculated subtotal + fees
      const calculated = (data.subtotal || 0) + (data.deliveryFee || 0) - (data.discount || 0);
      if (Math.abs(value - calculated) > 1) {  // Allow 1đ rounding error
        return `Total mismatch. Expected ${calculated}, got ${value}`;
      }
      return null;
    }
  },
  status: {
    type: 'enum',
    enum: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'],
    required: false,
    default: 'pending',
    description: 'Order status'
  },
  deliveryAddress: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 200,
    description: 'Delivery address'
  },
  deliveryLatitude: {
    type: 'number',
    required: false,
    min: -90,
    max: 90,
    description: 'Delivery GPS latitude'
  },
  deliveryLongitude: {
    type: 'number',
    required: false,
    min: -180,
    max: 180,
    description: 'Delivery GPS longitude'
  },
  paymentMethod: {
    type: 'enum',
    enum: ['cash', 'card', 'momo', 'zalopay'],
    required: true,
    description: 'Payment method'
  },
  note: {
    type: 'string',
    required: false,
    maxLength: 500,
    default: '',
    description: 'Special notes'
  },
  promotionCode: {
    type: 'string',
    required: false,
    maxLength: 20,
    description: 'Promotion code used'
  },
  items: {
    type: 'array',
    required: true,
    description: 'Order items',
    custom: (value) => {
      if (!Array.isArray(value) || value.length === 0) {
        return 'Items must be a non-empty array';
      }
      for (const item of value) {
        if (!item.productId || !item.quantity) {
          return 'Each item must have productId and quantity';
        }
      }
      return null;
    }
  }
};
