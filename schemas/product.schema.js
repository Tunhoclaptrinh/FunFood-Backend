/**
 * Product Schema for Import/Export
 */

module.exports = {
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 1000
  },
  restaurantId: {
    type: 'number',
    required: true,
    foreignKey: 'restaurants'
  },
  categoryId: {
    type: 'number',
    required: false,
    foreignKey: 'categories'
  },
  price: {
    type: 'number',
    required: true,
    min: 0
  },
  image: {
    type: 'string',
    required: false,
    default: ''
  },
  available: {
    type: 'boolean',
    required: false,
    default: true
  },
  discount: {
    type: 'number',
    required: false,
    min: 0,
    max: 100,
    default: 0
  }
};