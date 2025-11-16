module.exports = {
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100,
    description: 'Product name'
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 1000,
    description: 'Product description'
  },
  restaurantId: {
    type: 'number',
    required: true,
    foreignKey: 'restaurants',
    description: 'Restaurant ID'
  },
  categoryId: {
    type: 'number',
    required: false,
    foreignKey: 'categories',
    description: 'Category ID'
  },
  price: {
    type: 'number',
    required: true,
    min: 0,
    description: 'Product price (VND)'
  },
  image: {
    type: 'string',
    required: false,
    default: '',
    description: 'Product image URL'
  },
  available: {
    type: 'boolean',
    required: false,
    default: true,
    description: 'Product availability'
  },
  discount: {
    type: 'number',
    required: false,
    min: 0,
    max: 100,
    default: 0,
    description: 'Discount percentage'
  }
};
