/**
 * FunFood API Endpoints - Auto Generated from API Reference
 * Base URL: http://localhost:3000/api
 */

const BASE_URL = 'http://localhost:3000/api';

const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
    changePassword: '/auth/change-password',
  },

  users: {
    getAll: '/users',
    getById: (id) => `/users/${id}`,
    getActivity: (id) => `/users/${id}/activity`,
    getStatsSummary: '/users/stats/summary',
    updateProfile: '/users/profile',
    updateByAdmin: (id) => `/users/${id}`,
    toggleStatus: (id) => `/users/${id}/status`,
    delete: (id) => `/users/${id}`,
    deletePermanent: (id) => `/users/${id}/permanent`,
  },

  categories: {
    getAll: '/categories',
    getById: (id) => `/categories/${id}`,
    create: '/categories',
    update: (id) => `/categories/${id}`,
    delete: (id) => `/categories/${id}`,
  },

  restaurants: {
    getAll: '/restaurants',
    search: '/restaurants/search',
    getById: (id) => `/restaurants/${id}`,
    getMenu: (id) => `/restaurants/${id}/products`,
    create: '/restaurants',
    update: (id) => `/restaurants/${id}`,
    delete: (id) => `/restaurants/${id}`,
  },

  products: {
    getAll: '/products',
    search: '/products/search',
    getById: (id) => `/products/${id}`,
    create: '/products',
    update: (id) => `/products/${id}`,
    delete: (id) => `/products/${id}`,
  },

  cart: {
    get: '/cart',
    add: '/cart',
    sync: '/cart/sync',
    updateItem: (id) => `/cart/${id}`,
    deleteItem: (id) => `/cart/${id}`,
    deleteByRestaurant: (restaurantId) => `/cart/restaurant/${restaurantId}`,
    clear: '/cart',
  },

  orders: {
    getAll: '/orders',
    getById: (id) => `/orders/${id}`,
    create: '/orders',
    updateStatus: (id) => `/orders/${id}/status`,
    delete: (id) => `/orders/${id}`,
    getAllAdmin: '/orders/all',
  },

  favorites: {
    getAll: '/favorites',
    getRestaurants: '/favorites/restaurants',
    check: (restaurantId) => `/favorites/check/${restaurantId}`,
    add: (restaurantId) => `/favorites/${restaurantId}`,
    toggle: (restaurantId) => `/favorites/toggle/${restaurantId}`,
    delete: (restaurantId) => `/favorites/${restaurantId}`,
    clear: '/favorites',
  },

  reviews: {
    getByRestaurant: (restaurantId) => `/reviews/restaurant/${restaurantId}`,
    getMine: '/reviews/user/me',
    getAllAdmin: '/reviews',
    create: '/reviews',
    update: (id) => `/reviews/${id}`,
    delete: (id) => `/reviews/${id}`,
  },

  promotions: {
    getAll: '/promotions',
    getActive: '/promotions/active',
    getByCode: (code) => `/promotions/code/${code}`,
    validate: '/promotions/validate',
    create: '/promotions',
    update: (id) => `/promotions/${id}`,
    toggle: (id) => `/promotions/${id}/toggle`,
    delete: (id) => `/promotions/${id}`,
  },

  addresses: {
    getAll: '/addresses',
    getDefault: '/addresses/default',
    getById: (id) => `/addresses/${id}`,
    create: '/addresses',
    update: (id) => `/addresses/${id}`,
    setDefault: (id) => `/addresses/${id}/default`,
    delete: (id) => `/addresses/${id}`,
    clear: '/addresses',
  },
};

module.exports = { BASE_URL, endpoints };
