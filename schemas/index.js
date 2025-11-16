/**
 * Schemas Index
 * Central export for all schemas
 */

module.exports = {
  user: require('./user.schema'),
  category: require('./category.schema'),
  restaurant: require('./restaurant.schema'),
  product: require('./product.schema'),
  promotion: require('./promotion.schema'),
  address: require('./address.schema'),
  order: require('./order.schema'),
  cart: require('./cart.schema'),
  favorite: require('./favorite.schema'),
  review: require('./review.schema'),
  notification: require('./notification.schema'),
  payment: require('./payment.schema')
};