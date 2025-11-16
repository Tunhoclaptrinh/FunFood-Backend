module.exports = {
  label: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
    description: 'Address label (Home, Office, etc.)'
  },
  address: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 200,
    description: 'Full address'
  },
  recipientName: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100,
    description: 'Recipient name'
  },
  recipientPhone: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 11,
    description: 'Recipient phone'
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
  note: {
    type: 'string',
    required: false,
    maxLength: 500,
    default: '',
    description: 'Delivery notes'
  },
  isDefault: {
    type: 'boolean',
    required: false,
    default: false,
    description: 'Default address flag'
  }
};