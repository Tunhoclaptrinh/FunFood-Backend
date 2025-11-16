/**
 * Restaurant Schema for Import/Export
 */

module.exports = {
  name: {
    type: 'string',
    required: true,
    unique: true,
    minLength: 2,
    maxLength: 100
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 1000
  },
  categoryId: {
    type: 'number',
    required: true,
    foreignKey: 'categories'
  },
  address: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 200
  },
  latitude: {
    type: 'number',
    required: false,
    min: -90,
    max: 90
  },
  longitude: {
    type: 'number',
    required: false,
    min: -180,
    max: 180
  },
  phone: {
    type: 'string',
    required: false,
    minLength: 10,
    maxLength: 15
  },
  image: {
    type: 'string',
    required: false,
    default: ''
  },
  deliveryFee: {
    type: 'number',
    required: false,
    min: 0,
    default: 15000
  },
  deliveryTime: {
    type: 'string',
    required: false,
    default: '20-30 phút'
  },
  openTime: {
    type: 'string',
    required: false,
    default: '08:00'
  },
  closeTime: {
    type: 'string',
    required: false,
    default: '22:00'
  },
  isOpen: {
    type: 'boolean',
    required: false,
    default: true
  },
  managerId: {
    type: 'number',
    required: false,
    foreignKey: 'users'
  }
};