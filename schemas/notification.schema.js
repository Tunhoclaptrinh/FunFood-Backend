module.exports = {
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    description: 'Notification title'
  },
  message: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 500,
    description: 'Notification message'
  },
  type: {
    type: 'enum',
    enum: ['order', 'promotion', 'favorite', 'payment', 'review'],
    required: true,
    description: 'Notification type'
  },
  refId: {
    type: 'number',
    required: true,
    description: 'Reference ID (order, promotion, etc.)'
  },
  isRead: {
    type: 'boolean',
    required: false,
    default: false,
    description: 'Read status'
  }
};