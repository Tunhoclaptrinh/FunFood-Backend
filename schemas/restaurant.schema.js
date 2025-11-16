module.exports = {
  name: {
    type: 'string',
    required: true,
    unique: true,
    minLength: 2,
    maxLength: 100,
    description: 'Restaurant name'
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 1000,
    description: 'Restaurant description'
  },
  categoryId: {
    type: 'number',
    required: true,
    foreignKey: 'categories',
    description: 'Category ID'
  },
  address: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 200,
    description: 'Full address'
  },
  latitude: {
    type: 'number',
    required: false,
    min: -90,
    max: 90,
    description: 'GPS latitude'
  },
  longitude: {
    type: 'number',
    required: false,
    min: -180,
    max: 180,
    description: 'GPS longitude'
  },
  phone: {
    type: 'string',
    required: false,
    minLength: 10,
    maxLength: 15,
    description: 'Contact phone'
  },
  image: {
    type: 'string',
    required: false,
    default: '',
    description: 'Restaurant image URL'
  },
  deliveryFee: {
    type: 'number',
    required: false,
    min: 0,
    default: 15000,
    description: 'Base delivery fee (VND)'
  },
  deliveryTime: {
    type: 'string',
    required: false,
    default: '20-30 phút',
    description: 'Estimated delivery time'
  },
  openTime: {
    type: 'string',
    required: false,
    default: '08:00',
    description: 'Opening time (HH:mm)'
  },
  closeTime: {
    type: 'string',
    required: false,
    default: '22:00',
    description: 'Closing time (HH:mm)'
  },
  isOpen: {
    type: 'boolean',
    required: false,
    default: true,
    description: 'Currently open status'
  },
  managerId: {
    type: 'number',
    required: false,
    foreignKey: 'users',
    description: 'Manager user ID'
  }
};
