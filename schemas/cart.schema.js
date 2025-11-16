module.exports = {
  productId: {
    type: 'number',
    required: true,
    foreignKey: 'products',
    description: 'Product ID'
  },
  quantity: {
    type: 'number',
    required: true,
    min: 1,
    description: 'Quantity'
  }
};