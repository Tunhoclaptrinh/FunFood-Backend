module.exports = {
  type: {
    type: 'enum',
    enum: ['restaurant', 'product'],
    required: true,
    description: 'Favorite type'
  },
  referenceId: {
    type: 'number',
    required: true,
    description: 'Restaurant or Product ID'
  }
};