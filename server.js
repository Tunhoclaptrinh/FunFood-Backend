const express = require('express');
const cors = require('cors');
const os = require('os');
require('dotenv').config();

const app = express();

// ==================== MIDDLEWARE ====================

// CORS - Allow all origins for local network access
app.use(cors({
  origin: '*',  // Allow all origins in local network
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const apiLogger = require('./middleware/logger.middleware');
app.use(apiLogger);


const { parseQuery, formatResponse, validateQuery, logQuery } = require('./middleware/query.middleware');

// Apply query parsing to all routes
app.use(parseQuery);
app.use(formatResponse);
app.use(validateQuery);
app.use(logQuery);

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
const paymentRoutes = require('./routes/payment.routes');
const uploadRoutes = require('./routes/upload.routes');

// Optional routes
let shipperRoutes, managerRoutes;
try {
  shipperRoutes = require('./routes/shipper.routes');
} catch (err) {
  console.log('⚠️  Shipper routes not found');
}
try {
  managerRoutes = require('./routes/manager.routes');
} catch (err) {
  console.log('⚠️  Manager routes not found');
}

const endpoints = require('./config/endpoints');

// ==================== ROUTES ====================

// API v1
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
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);

if (shipperRoutes) {
  app.use('/api/shipper', shipperRoutes);
}
if (managerRoutes) {
  app.use('/api/manager', managerRoutes);
}

// ==================== UTILITIES ====================

// Permissions endpoint
try {
  const { getUserPermissions } = require('./middleware/rbac.middleware');
  app.get('/api/permissions', require('./middleware/auth.middleware').protect, getUserPermissions);
} catch (err) {
  console.log('⚠️  RBAC permissions endpoint not available');
}

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'FunFood API v2.0 - JSON Server Style',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: [
      'Authentication (JWT)',
      'Role-based Access Control',
      'GPS-based Restaurant Search',
      'Dynamic Delivery Fee Calculation',
      'Advanced Query Filtering (pagination, sorting, search)',
      'Payment Processing (Cash, MoMo, ZaloPay, Card)',
      'Notification System',
      'Import/Export (Excel, CSV)',
      "File Upload (Images with processing)",
      'Data Analytics'
    ],
    documentation: {
      full_docs: '/docs/API_ENDPOINTS.md',
      postman_collection: '/docs/funfood-api.postman_collection.json',
      status_page: '/api/health',
      endpoints: '/api/endpoints',
    }
  });
});

app.get('/api/endpoints', (req, res) => {
  res.json({
    documentation: {
      ...endpoints
    }
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FunFood API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'JSON File (Mock)',
    features: {
      authentication: true,
      rbac: true,
      gps: true,
      payments: true,
      notifications: true
    }
  });
});

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    available_endpoints: '/api'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.status || err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      type: err.name,
      stack: err.stack
    } : undefined
  };

  res.status(statusCode).json(response);
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Get local network IP address
 */
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

/**
 * Display network access information
 */
// --- Measure unicode string width safely (emoji, CJK, etc) ---
function stringWidth(str) {
  // Detect emoji / wide char
  const ansiRegex = /\u001b\[.*?m/g; // strip ANSI color codes
  const cleanStr = str.replace(ansiRegex, '');

  let width = 0;
  for (const char of [...cleanStr]) {
    // Emojis & fullwidth characters
    if (char.match(/[\u{1100}-\u{115F}\u{2329}\u{232A}\u{2E80}-\u{A4CF}\u{AC00}-\u{D7A3}\u{F900}-\u{FAFF}\u{FE10}-\u{FE19}\u{FE30}-\u{FE6F}\u{FF00}-\u{FF60}\u{FFE0}-\u{FFE6}]/u)) {
      width += 2;
    } else if (char.length > 1) {
      // Emoji surrogate pairs
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

// --- Build a line inside the frame ---
function line(text = '') {
  const width = 70;
  if (!text) return `╠${'═'.repeat(width)}╣`;

  const realWidth = stringWidth(text);
  const space = width - realWidth;

  return `║ ${text}${' '.repeat(space - 1)}║`;
}

// --- Centered title ---
function title(text) {
  const width = 70;
  const realWidth = stringWidth(text);
  const left = Math.floor((width - realWidth) / 2);
  const right = Math.ceil((width - realWidth) / 2);
  return `║${' '.repeat(left)}${text}${' '.repeat(right)}║`;
}

function displayNetworkInfo(port) {
  const localIP = getLocalIPAddress();

  console.log('\n╔' + '═'.repeat(70) + '╗');
  console.log(title('🚀  FunFood Server Started!'));
  console.log('╠' + '═'.repeat(70) + '╣');

  console.log(line(`  Environment: ${process.env.NODE_ENV || 'development'}`));
  console.log(line());
  console.log(line('  Local Access URLs:'));
  console.log(line(`• http://localhost:${port}`));
  console.log(line(`• http://127.0.0.1:${port}`));
  console.log(line());

  console.log(line('  Network Access URLs (WiFi):'));
  console.log(line(`• http://${localIP}:${port}`));
  console.log(line());

  console.log(line('  API Documentation:'));
  console.log(line(`• http://localhost:${port}/api`));
  console.log(line(`• http://${localIP}:${port}/api`));
  console.log(line());

  console.log(line('  Health Check: '));
  console.log(line(`• http://localhost:${port}/api/health`));
  console.log(line(`• http://${localIP}:${port}/api/health`));
  console.log(line());

  console.log(line('  Tips:'));
  console.log(line('• Use Network URL for mobile access'));
  console.log(line('• Devices must be on same WiFi'));
  console.log(line('• Check firewall if connection fails'));

  console.log('╚' + '═'.repeat(70) + '╝\n');
}



// ==================== SERVER START ====================

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

const server = app.listen(PORT, HOST, () => {
  displayNetworkInfo(PORT);
});

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;