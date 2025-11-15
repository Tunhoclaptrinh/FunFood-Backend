const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { parseQuery, formatResponse, validateQuery, logQuery } = require('./middleware/query.middleware');

// Apply query parsing to all routes
app.use(parseQuery);
app.use(formatResponse);
app.use(validateQuery); // Optional
app.use(logQuery);      // Optional for debugging

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const cartRoutes = require('./routes/cart.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const reviewRoutes = require('./routes/review.routes');
const promotionRoutes = require('./routes/promotion.routes');
const addressRoutes = require('./routes/address.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import shipper & manager routes (if they exist)
let shipperRoutes, managerRoutes;
try {
  shipperRoutes = require('./routes/shipper.routes');
} catch (err) {
  console.log('⚠️  Shipper routes not found, skipping...');
}
try {
  managerRoutes = require('./routes/manager.routes');
} catch (err) {
  console.log('⚠️  Manager routes not found, skipping...');
}

// Import endpoints definition
const endpoints = require('./config/endpoints');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);

// Conditional routes
if (shipperRoutes) {
  app.use('/api/shipper', shipperRoutes);
}
if (managerRoutes) {
  app.use('/api/manager', managerRoutes);
}

// Permissions endpoint
const { protect } = require('./middleware/auth.middleware');
try {
  const { getUserPermissions } = require('./middleware/rbac.middleware');
  app.get('/api/permissions', protect, getUserPermissions);
} catch (err) {
  console.log('⚠️  RBAC middleware not found, skipping permissions endpoint...');
}

// API docs endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'FunFood API - JSON Server Style',
    version: '2.0.0',
    features: [
      'Pagination: ?_page=1&_limit=10',
      'Sorting: ?_sort=field&_order=asc|desc',
      'Full-text search: ?q=search_term',
      'Filtering: ?field=value',
      'Operators: ?field_gte=value, ?field_lte=value, ?field_ne=value',
      'Relationships: ?_embed=related or ?_expand=foreign_key'
    ],
    endpoints // Tự động load từ endpoints.js
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FunFood API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      ...err
    } : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║   🚀 FunFood Server Started!                                     ║
╠══════════════════════════════════════════════════════════════════╣
║   📍 URL: http://localhost:${PORT}                                  ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                                    ║
║   📊 API Docs: http://localhost:${PORT}/api                         ║
║   ❤️  Health: http://localhost:${PORT}/api/health                    ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});