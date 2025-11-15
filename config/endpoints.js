/**
 * FunFood API Endpoints Configuration
 * Auto-generated reference for all API endpoints
 * Base URL: http://localhost:3000/api
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

/**
 * Authentication Endpoints
 */
const auth = {
  register: '/auth/register',
  login: '/auth/login',
  logout: '/auth/logout',
  getMe: '/auth/me',
  changePassword: '/auth/change-password'
};

/**
 * User Management Endpoints
 */
const users = {
  list: '/users',
  getById: (id) => `/users/${id}`,
  getActivity: (id) => `/users/${id}/activity`,
  getStats: '/users/stats/summary',
  updateProfile: '/users/profile',
  update: (id) => `/users/${id}`,
  toggleStatus: (id) => `/users/${id}/status`,
  delete: (id) => `/users/${id}`,
  deletePermanent: (id) => `/users/${id}/permanent`,

  // Import/Export
  importUsers: '/users/import',
  exportUsers: '/users/export',
  getTemplate: '/users/template',
  getSchema: '/users/schema'
};

/**
 * Category Endpoints
 */
const categories = {
  list: '/categories',
  search: '/categories/search',
  getById: (id) => `/categories/${id}`,
  create: '/categories',
  update: (id) => `/categories/${id}`,
  delete: (id) => `/categories/${id}`,

  // Import/Export
  importCategories: '/categories/import',
  exportCategories: '/categories/export',
  getTemplate: '/categories/template',
  getSchema: '/categories/schema'
};

/**
 * Restaurant Endpoints
 */
const restaurants = {
  list: '/restaurants',
  search: '/restaurants/search',
  nearby: '/restaurants/nearby',
  getById: (id) => `/restaurants/${id}`,
  getMenu: (id) => `/restaurants/${id}/products`,
  create: '/restaurants',
  update: (id) => `/restaurants/${id}`,
  delete: (id) => `/restaurants/${id}`,

  // Import/Export
  importRestaurants: '/restaurants/import',
  exportRestaurants: '/restaurants/export',
  getTemplate: '/restaurants/template',
  getSchema: '/restaurants/schema'
};

/**
 * Product Endpoints
 */
const products = {
  list: '/products',
  search: '/products/search',
  discounted: '/products/discounted',
  getById: (id) => `/products/${id}`,
  create: '/products',
  update: (id) => `/products/${id}`,
  bulkUpdateAvailability: '/products/bulk/availability',
  delete: (id) => `/products/${id}`,

  // Import/Export
  importProducts: '/products/import',
  exportProducts: '/products/export',
  getTemplate: '/products/template',
  getSchema: '/products/schema'
};

/**
 * Cart Endpoints
 */
const cart = {
  get: '/cart',
  add: '/cart',
  sync: '/cart/sync',
  update: (id) => `/cart/${id}`,
  remove: (id) => `/cart/${id}`,
  clearByRestaurant: (restaurantId) => `/cart/restaurant/${restaurantId}`,
  clear: '/cart'
};

/**
 * Order Endpoints
 */
const orders = {
  // Customer
  list: '/orders',
  getById: (id) => `/orders/${id}`,
  create: '/orders',
  cancel: (id) => `/orders/${id}`,
  reorder: (id) => `/orders/${id}/reorder`,
  rate: (id) => `/orders/${id}/rate`,
  getStats: '/orders/stats/summary',

  // Admin
  listAll: '/orders/all',
  adminStats: '/orders/admin/stats',
  adminUpdateStatus: (id) => `/orders/admin/${id}/status`,
  adminDelete: (id) => `/orders/admin/${id}/permanent`,

  // Manager
  restaurantOrders: '/orders/manager/restaurant',
  managerUpdateStatus: (id) => `/orders/manager/${id}/status`,
  managerStats: '/orders/manager/stats',

  // Shipper
  availableOrders: '/orders/shipper/available',
  acceptOrder: (id) => `/orders/shipper/${id}/accept`,
  myDeliveries: '/orders/shipper/deliveries',
  updateDeliveryStatus: (id) => `/orders/shipper/${id}/status`,
  shipperStats: '/orders/shipper/stats',

  // Shared
  updateStatus: (id) => `/orders/${id}/status`
};

/**
 * Favorite Endpoints
 */
const favorites = {
  list: '/favorites',
  getByType: (type) => `/favorites/${type}`,
  getIds: (type) => `/favorites/${type}/ids`,
  getTrending: (type) => `/favorites/trending/${type}`,
  getStats: '/favorites/stats',
  check: (type, id) => `/favorites/${type}/${id}/check`,
  add: (type, id) => `/favorites/${type}/${id}`,
  toggle: (type, id) => `/favorites/${type}/${id}/toggle`,
  remove: (type, id) => `/favorites/${type}/${id}`,
  clearByType: (type) => `/favorites/${type}`,
  clearAll: '/favorites'
};

/**
 * Review Endpoints
 */
const reviews = {
  // Public
  getRestaurantReviews: (restaurantId) => `/reviews/restaurant/${restaurantId}`,
  getProductReviews: (productId) => `/reviews/product/${productId}`,
  getByType: (type) => `/reviews/type/${type}`,

  // Protected
  create: '/reviews',
  getMyReviews: '/reviews/user/me',
  getStats: '/reviews/user/stats',
  check: (type, targetId) => `/reviews/check/${type}/${targetId}`,
  update: (id) => `/reviews/${id}`,
  delete: (id) => `/reviews/${id}`,

  // Admin
  listAll: '/reviews'
};

/**
 * Promotion Endpoints
 */
const promotions = {
  list: '/promotions',
  active: '/promotions/active',
  getByCode: (code) => `/promotions/code/${code}`,
  validate: '/promotions/validate',
  create: '/promotions',
  update: (id) => `/promotions/${id}`,
  toggle: (id) => `/promotions/${id}/toggle`,
  delete: (id) => `/promotions/${id}`,

  // Import/Export
  importPromotions: '/promotions/import',
  exportPromotions: '/promotions/export',
  getTemplate: '/promotions/template',
  getSchema: '/promotions/schema'
};

/**
 * Address Endpoints
 */
const addresses = {
  list: '/addresses',
  getDefault: '/addresses/default',
  getById: (id) => `/addresses/${id}`,
  create: '/addresses',
  update: (id) => `/addresses/${id}`,
  setDefault: (id) => `/addresses/${id}/default`,
  delete: (id) => `/addresses/${id}`,
  clearNonDefault: '/addresses'
};

/**
 * Notification Endpoints
 */
const notifications = {
  list: '/notifications',
  markAsRead: (id) => `/notifications/${id}/read`,
  markAllAsRead: '/notifications/read-all',
  delete: (id) => `/notifications/${id}`,
  clearAll: '/notifications'
};

/**
 * Payment Endpoints
 */
const payment = {
  create: (orderId) => `/payment/${orderId}/create`,
  getStatus: (orderId) => `/payment/${orderId}/status`,
  refund: (orderId) => `/payment/${orderId}/refund`,
  listAll: '/payment',
  momoCallback: '/payment/momo/callback',
  zaloPayCallback: '/payment/zalopay/callback'
};

/**
 * Manager Endpoints
 */
const manager = {
  getRestaurant: '/manager/restaurant',
  getProducts: '/manager/products',
  createProduct: '/manager/products',
  updateProduct: (id) => `/manager/products/${id}`,
  toggleProductAvailability: (id) => `/manager/products/${id}/availability`,
  getOrders: '/manager/orders',
  getOrderDetail: (id) => `/manager/orders/${id}`,
  updateOrderStatus: (id) => `/manager/orders/${id}/status`,
  getStats: '/manager/stats'
};

/**
 * Shipper Endpoints
 */
const shipper = {
  availableOrders: '/shipper/orders/available',
  acceptOrder: (id) => `/shipper/orders/${id}/accept`,
  myDeliveries: '/shipper/orders/my-deliveries',
  updateOrderStatus: (id) => `/shipper/orders/${id}/status`,
  getHistory: '/shipper/orders/history',
  getStats: '/shipper/stats'
};

/**
 * Health & Status Endpoints
 */
const health = {
  health: '/health',
  apiDocs: '/api'
};

/**
 * Query Parameters Reference
 */
const queryParams = {
  pagination: {
    _page: 'Page number (default: 1)',
    _limit: 'Items per page (default: 10, max: 100)',
    page: 'Alternative to _page',
    limit: 'Alternative to _limit'
  },
  sorting: {
    _sort: 'Field to sort by',
    _order: 'Sort order: asc or desc (default: asc)',
    sort: 'Alternative to _sort',
    order: 'Alternative to _order'
  },
  filtering: {
    q: 'Full-text search',
    field_gte: 'Greater than or equal',
    field_lte: 'Less than or equal',
    field_ne: 'Not equal',
    field_like: 'Contains (case-insensitive)',
    field_in: 'In array of values'
  },
  relationships: {
    _embed: 'Embed related collections (comma-separated)',
    _expand: 'Expand foreign key references (comma-separated)'
  }
};

/**
 * Common Response Formats
 */
const responseFormats = {
  success: {
    simple: {
      success: true,
      message: 'Operation successful',
      data: {}
    },
    paginated: {
      success: true,
      count: 10,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrev: false
      }
    }
  },
  error: {
    notFound: {
      success: false,
      message: 'Resource not found',
      statusCode: 404
    },
    unauthorized: {
      success: false,
      message: 'Not authorized',
      statusCode: 401
    },
    validation: {
      success: false,
      message: 'Validation failed',
      errors: [
        { field: 'email', message: 'Invalid email' }
      ]
    }
  }
};

/**
 * HTTP Methods
 */
const methods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

/**
 * Status Codes
 */
const statusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  SERVER_ERROR: 500
};

/**
 * Authentication Headers
 */
const headers = {
  contentType: { 'Content-Type': 'application/json' },
  authorization: (token) => ({ 'Authorization': `Bearer ${token}` }),
  combined: (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })
};

/**
 * API Collections for Different Roles
 */
const byRole = {
  public: [
    categories.list,
    restaurants.list,
    restaurants.nearby,
    products.list,
    promotions.list,
    reviews.getRestaurantReviews
  ],
  customer: [
    ...Object.values(auth),
    ...Object.values(cart),
    ...Object.values(favorites),
    ...Object.values(reviews),
    ...Object.values(addresses),
    ...Object.values(notifications),
    orders.list,
    orders.create
  ],
  manager: [
    ...Object.values(manager)
  ],
  shipper: [
    ...Object.values(shipper)
  ],
  admin: [
    // All endpoints
  ]
};

/**
 * Common Query Examples
 */
const examples = {
  pagination: '?_page=1&_limit=10',
  sorting: '?_sort=rating&_order=desc',
  filtering: '?categoryId=1&price_gte=50000&price_lte=100000',
  search: '?q=pizza',
  combined: '?q=pizza&price_lte=100000&_page=1&_limit=10',
  relationships: '?_embed=products,reviews&_expand=category'
};

module.exports = {
  BASE_URL,
  auth,
  users,
  categories,
  restaurants,
  products,
  cart,
  orders,
  favorites,
  reviews,
  promotions,
  addresses,
  notifications,
  payment,
  manager,
  shipper,
  health,
  queryParams,
  responseFormats,
  methods,
  statusCodes,
  headers,
  byRole,
  examples
};