/**
 * Schemas Index
 * Central export for all schemas
 */

module.exports = {
  user: require('./user.schema'),
  category: require('./category.schema'),
  restaurant: require('./restaurant.schema'),
  product: require('./product.schema'),
  promotion: require('./promotion.schema')
};