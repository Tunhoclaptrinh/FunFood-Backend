/**
 * User Schema for Import/Export
 */

module.exports = {
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  email: {
    type: 'email',
    required: true,
    unique: true
  },
  password: {
    type: 'string',
    required: true,
    minLength: 6,
    note: 'Will be hashed automatically'
  },
  phone: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 11
  },
  address: {
    type: 'string',
    required: false,
    default: ''
  },
  avatar: {
    type: 'string',
    required: false,
    default: ''
  },
  role: {
    type: 'enum',
    required: false,
    values: ['customer', 'admin', 'manager', 'shipper'],
    default: 'customer'
  },
  isActive: {
    type: 'boolean',
    required: false,
    default: true
  }
};