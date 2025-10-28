/**
 * Validation Middleware - Tập trung validation rules
 * Sử dụng với express-validator
 */
const { body } = require('express-validator');

// ============= RESTAURANT VALIDATIONS =============
const restaurantValidation = {
  create: [
    body('name').notEmpty().withMessage('Name is required'),
    body('categoryId').isInt().withMessage('Category ID must be a number'),
    body('address').notEmpty().withMessage('Address is required'),
    body('deliveryFee').optional().isInt({ min: 0 }).withMessage('Delivery fee must be >= 0'),
    body('latitude').optional().isFloat().withMessage('Invalid latitude'),
    body('longitude').optional().isFloat().withMessage('Invalid longitude')
  ],
  update: [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('categoryId').optional().isInt().withMessage('Category ID must be a number'),
    body('deliveryFee').optional().isInt({ min: 0 }).withMessage('Delivery fee must be >= 0')
  ]
};

// ============= PRODUCT VALIDATIONS =============
const productValidation = {
  create: [
    body('name').notEmpty().withMessage('Name is required'),
    body('restaurantId').isInt().withMessage('Restaurant ID must be a number'),
    body('price').isInt({ min: 0 }).withMessage('Price must be >= 0'),
    body('categoryId').optional().isInt().withMessage('Category ID must be a number'),
    body('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be 0-100'),
    body('available').optional().isBoolean().withMessage('Available must be boolean')
  ],
  update: [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('price').optional().isInt({ min: 0 }).withMessage('Price must be >= 0'),
    body('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be 0-100')
  ]
};

// ============= CATEGORY VALIDATIONS =============
const categoryValidation = {
  create: [
    body('name').notEmpty().withMessage('Name is required'),
    body('icon').optional().notEmpty().withMessage('Icon cannot be empty')
  ],
  update: [
    body('name').optional().notEmpty().withMessage('Name cannot be empty')
  ]
};

// ============= ORDER VALIDATIONS =============
const orderValidation = {
  create: [
    body('restaurantId').isInt().withMessage('Restaurant ID is required'),
    body('items').isArray({ min: 1 }).withMessage('Order must have at least 1 item'),
    body('items.*.productId').isInt().withMessage('Product ID must be a number'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1'),
    body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
    body('deliveryLatitude').optional().isFloat().withMessage('Invalid latitude'),
    body('deliveryLongitude').optional().isFloat().withMessage('Invalid longitude'),
    body('paymentMethod').isIn(['cash', 'card', 'momo', 'zalopay']).withMessage('Invalid payment method')
  ],
  updateStatus: [
    body('status').isIn(['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'])
      .withMessage('Invalid status')
  ]
};

// ============= REVIEW VALIDATIONS =============
const reviewValidation = {
  create: [
    body('restaurantId').isInt().withMessage('Restaurant ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').notEmpty().withMessage('Comment is required'),
    body('orderId').optional().isInt().withMessage('Order ID must be a number')
  ],
  update: [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().notEmpty().withMessage('Comment cannot be empty')
  ]
};

// ============= CART VALIDATIONS =============
const cartValidation = {
  add: [
    body('productId').isInt().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1')
  ],
  update: [
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be >= 0')
  ],
  sync: [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.productId').isInt().withMessage('Product ID must be a number'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1')
  ]
};

// ============= ADDRESS VALIDATIONS =============
const addressValidation = {
  create: [
    body('label').notEmpty().withMessage('Label is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('recipientName').notEmpty().withMessage('Recipient name is required'),
    body('recipientPhone').notEmpty().withMessage('Recipient phone is required'),
    body('latitude').optional().isFloat().withMessage('Invalid latitude'),
    body('longitude').optional().isFloat().withMessage('Invalid longitude'),
    body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean')
  ],
  update: [
    body('label').optional().notEmpty().withMessage('Label cannot be empty'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty')
  ]
};

// ============= PROMOTION VALIDATIONS =============
const promotionValidation = {
  create: [
    body('code').notEmpty().withMessage('Code is required'),
    body('discountType').isIn(['percentage', 'fixed', 'delivery']).withMessage('Invalid discount type'),
    body('discountValue').isInt({ min: 0 }).withMessage('Discount value must be >= 0'),
    body('minOrderValue').optional().isInt({ min: 0 }).withMessage('Min order value must be >= 0'),
    body('maxDiscount').optional().isInt({ min: 0 }).withMessage('Max discount must be >= 0'),
    body('validFrom').isISO8601().withMessage('Invalid validFrom date'),
    body('validTo').isISO8601().withMessage('Invalid validTo date')
  ],
  validate: [
    body('code').notEmpty().withMessage('Code is required'),
    body('orderValue').isInt({ min: 0 }).withMessage('Order value must be >= 0')
  ]
};

// ============= EXPORTS =============
module.exports = {
  restaurant: restaurantValidation,
  product: productValidation,
  category: categoryValidation,
  order: orderValidation,
  review: reviewValidation,
  cart: cartValidation,
  address: addressValidation,
  promotion: promotionValidation
};