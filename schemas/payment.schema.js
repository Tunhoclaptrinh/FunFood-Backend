module.exports = {
  orderId: {
    type: 'number',
    required: true,
    foreignKey: 'orders',
    description: 'Order ID'
  },
  method: {
    type: 'enum',
    enum: ['cash', 'card', 'momo', 'zalopay'],
    required: true,
    description: 'Payment method'
  },
  amount: {
    type: 'number',
    required: true,
    min: 0,
    description: 'Payment amount'
  },
  status: {
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refunded'],
    required: false,
    default: 'pending',
    description: 'Payment status'
  },
  transactionId: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'External transaction ID'
  },
  refundReason: {
    type: 'string',
    required: false,
    maxLength: 500,
    description: 'Reason for refund'
  }
};