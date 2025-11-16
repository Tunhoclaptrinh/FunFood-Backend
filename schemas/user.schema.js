module.exports = {
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100,
    description: 'Full name of user'
  },
  email: {
    type: 'email',
    required: true,
    unique: true,
    description: 'Email address (must be unique)'
  },
  password: {
    type: 'string',
    required: true,
    minLength: 6,
    description: 'Will be hashed automatically'
  },
  phone: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 11,
    description: 'Phone number'
  },
  address: {
    type: 'string',
    required: false,
    maxLength: 200,
    default: '',
    description: 'User address'
  },
  avatar: {
    type: 'string',
    required: false,
    default: '',
    description: 'Avatar image URL'
  },
  role: {
    type: 'enum',
    enum: ['customer', 'admin', 'manager', 'shipper'],
    required: false,
    default: 'customer',
    description: 'User role'
  },
  isActive: {
    type: 'boolean',
    required: false,
    default: true,
    description: 'Account status'
  }
};
