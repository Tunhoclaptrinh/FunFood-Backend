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
    description: 'Email address (must be unique)',
    // ✅ NEW: Custom validation function
    custom: (value, allData) => {
      // Example 1: Check domain
      if (value.endsWith('@competitor.com')) {
        return 'Cannot use competitor email';
      }

      // Example 2: Cross-field validation
      if (allData.role === 'admin' && !value.endsWith('@funfood.com')) {
        return 'Admin must use company email';
      }

      return null; // Valid
    }
  },
  password: {
    type: 'string',
    required: true,
    minLength: 6,
    description: 'Will be hashed automatically',
    custom: (value) => {
      // Password strength check
      if (!/[A-Z]/.test(value) && !/[0-9]/.test(value)) {
        return 'Password must contain uppercase or number';
      }
      return null;
    }
  },
  phone: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 11,
    description: 'Phone number',
    custom: (value) => {
      // Vietnam phone format
      const vnPhoneRegex = /^(0|\+84)[0-9]{9}$/;
      if (!vnPhoneRegex.test(value)) {
        return 'Invalid Vietnam phone number format';
      }
      return null;
    }
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
