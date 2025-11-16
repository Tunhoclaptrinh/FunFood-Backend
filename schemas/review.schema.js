module.exports = {
  type: {
    type: 'enum',
    enum: ['restaurant', 'product'],
    required: true,
    description: 'Review type'
  },
  restaurantId: {
    type: 'number',
    required: true,
    foreignKey: 'restaurants',
    description: 'Restaurant ID'
  },
  productId: {
    type: 'number',
    required: false,
    foreignKey: 'products',
    description: 'Product ID (for product reviews)'
  },
  rating: {
    type: 'number',
    required: true,
    min: 1,
    max: 5,
    description: 'Rating (1-5 stars)'
  },
  comment: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 500,
    description: 'Review comment'
  },
  orderId: {
    type: 'number',
    required: false,
    foreignKey: 'orders',
    description: 'Order ID'
  }
};