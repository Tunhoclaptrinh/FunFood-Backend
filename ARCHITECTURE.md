# 🏗️ FunFood Backend - Architecture Guide

## Mục lục

1. [Project Structure](#project-structure)
2. [Design Patterns](#design-patterns)
3. [Data Flow](#data-flow)
4. [Authentication Flow](#authentication-flow)
5. [Order Workflow](#order-workflow)
6. [Database Schema](#database-schema)
7. [API Layers](#api-layers)
8. [Best Practices](#best-practices)

---

## Project Structure

```
funfood-backend/
│
├── config/
│   ├── database.js              # Database connection & queries
│   └── endpoints.js             # API endpoints reference
│
├── controllers/
│   ├── auth.controller.js       # Authentication logic
│   ├── user.controller.js       # User management
│   ├── restaurant.controller.js # Restaurant operations
│   ├── product.controller.js    # Product operations
│   ├── order.controller.js      # Order management
│   ├── cart.controller.js       # Shopping cart
│   ├── favorite.controller.js   # Favorites system
│   ├── review.controller.js     # Reviews & ratings
│   ├── promotion.controller.js  # Promotions/discounts
│   ├── address.controller.js    # Delivery addresses
│   ├── notification.controller.js # Notifications
│   ├── payment.controller.js    # Payment processing
│   ├── manager.controller.js    # Manager operations
│   ├── shipper.controller.js    # Shipper operations
│   └── importExport.controller.js # Data import/export
│
├── middleware/
│   ├── auth.middleware.js       # JWT authentication
│   ├── query.middleware.js      # Query parsing
│   ├── rbac.middleware.js       # Role-based access
│   └── validation.middleware.js # Input validation
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── restaurant.routes.js
│   ├── product.routes.js
│   ├── order.routes.js
│   ├── cart.routes.js
│   ├── favorite.routes.js
│   ├── review.routes.js
│   ├── promotion.routes.js
│   ├── address.routes.js
│   ├── notification.routes.js
│   ├── payment.routes.js
│   ├── manager.routes.js
│   └── shipper.routes.js
│
├── services/
│   ├── auth.service.js
│   ├── user.service.js
│   ├── restaurant.service.js    # GPS features here
│   ├── product.service.js
│   ├── order.service.js         # Order logic, validation
│   ├── cart.service.js
│   ├── favorite.service.js
│   ├── review.service.js
│   ├── promotion.service.js
│   ├── address.service.js
│   ├── notification.service.js
│   ├── payment.service.js       # Payment gateway integration
│   ├── shipper.service.js
│   └── importExport.service.js
│
├── utils/
│   ├── BaseService.js           # Generic CRUD service
│   ├── BaseController.js        # Generic HTTP controller
│   ├── helpers.js               # JWT, crypto, GPS functions
│   └── seedData.js              # Database seeding script
│
├── database/
│   └── db.json                  # JSON database file
│
├── .env                         # Environment variables
├── .env.develop                 # Development template
├── .gitignore
├── package.json
├── server.js                    # Application entry point
│
└── docs/
    ├── README.md
    ├── API_ENDPOINTS.md
    ├── QUICK_START.md
    ├── DEPLOYMENT.md
    ├── ARCHITECTURE.md          # This file
    └── MISSING_FEATURES.md
```

---

## Design Patterns

### 1. **Service Layer Pattern**

```
Controller → Service → Database
```

**Example: User Registration**

```javascript
// Controller - HTTP handling
exports.register = async (req, res) => {
  const result = await userService.create(req.body);
  res.json(result);
};

// Service - Business logic
async create(data) {
  // Validation
  const validation = await this.validateCreate(data);
  if (!validation.success) return validation;

  // Transform
  const transformed = await this.beforeCreate(data);

  // Database
  const item = db.create('users', transformed);

  // Post-processing
  await this.afterCreate(item);

  return { success: true, data: item };
}

// Database - Query execution
db.create(collection, data) {
  const newItem = { id, ...data };
  this.data[collection].push(newItem);
  this.saveData();
  return newItem;
}
```

### 2. **Base Service Pattern**

Tất cả services extend `BaseService` để có CRUD cơ bản:

```javascript
class UserService extends BaseService {
  constructor() {
    super("users"); // collection name
  }

  // Inherits: findAll, findById, create, update, delete, search
  // Override: validateCreate, validateDelete, beforeCreate, etc.
}
```

### 3. **Middleware Chain Pattern**

```
Request → Auth Middleware → RBAC Middleware → Query Parser → Controller → Response
```

### 4. **Repository Pattern**

Database class acts as repository:

```javascript
db.findAll(collection);
db.findById(collection, id);
db.findMany(collection, query);
db.findOne(collection, query);
db.findAllAdvanced(collection, options); // Pagination, filtering, sorting
```

---

## Data Flow

### Request-Response Cycle

```
1. Client Request
   ↓
2. Express Router (routes/*)
   ↓
3. Middleware Stack
   - Authentication (JWT)
   - Authorization (RBAC)
   - Query Parsing
   - Validation
   ↓
4. Controller (controllers/*)
   - Validate request
   - Call service
   - Format response
   ↓
5. Service (services/*)
   - Business logic
   - Validation
   - Database operations
   ↓
6. Database (config/database.js)
   - Read/Write operations
   - Data transformation
   ↓
7. Response Object
   - JSON formatting
   - Headers
   - Status codes
   ↓
8. Client Response
```

### Example: Create Order

```
POST /api/orders
  ├─ body: { restaurantId, items, deliveryAddress, ... }
  ├─ headers: { Authorization: Bearer TOKEN }
  ↓
orderRoutes.js
  ├─ protect middleware (auth)
  ├─ checkPermission middleware (RBAC)
  ├─ validation middleware (body schema)
  ↓
orderController.create()
  ├─ Validate request
  ├─ Call orderService.create()
  ↓
orderService.create()
  ├─ validateCreate() - check items, restaurant, etc.
  ├─ beforeCreate() - calculate totals, apply promotions
  ├─ db.create() - save to database
  ├─ afterCreate() - clear cart, send notifications
  ↓
Response
  {
    "success": true,
    "message": "Order created successfully",
    "data": { id, total, status, ... }
  }
```

---

## Authentication Flow

### JWT Authentication

```
1. Registration/Login
   POST /api/auth/register
   ├─ Hash password (bcryptjs)
   ├─ Save user
   └─ Generate JWT token

2. Token Generation
   jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE })

3. Token Storage (Client)
   LocalStorage / SessionStorage / HttpOnly Cookie

4. Authenticated Request
   GET /api/auth/me
   Header: Authorization: Bearer eyJhbGci...

5. Token Verification
   auth.middleware.js - protect()
   ├─ Extract token from header
   ├─ Verify signature
   ├─ Check expiration
   └─ Get user from database

6. User Available in Request
   req.user = { id, email, role, ... }
```

### Role-Based Access Control (RBAC)

```
Roles: admin, customer, manager, shipper

Permissions Matrix:
┌────────┬──────────┬──────────┬──────────┬─────────┐
│ Role   │ Create   │ Read     │ Update   │ Delete  │
├────────┼──────────┼──────────┼──────────┼─────────┤
│ admin  │ Yes (all)│ Yes (all)│ Yes (all)│ Yes (all)
│ manager│ Own only │ Own only │ Own only │ Own only│
│ shipper│ No       │ Assigned │ Assigned │ No      │
│ customer│ Own only│ Own only │ Own only │ Cancel  │
└────────┴──────────┴──────────┴──────────┴─────────┘
```

---

## Order Workflow

### Order Status Flow

```
┌─────────┐
│ Pending │  (Khách tạo đơn)
└────┬────┘
     │
     ↓
┌───────────┐
│ Confirmed │  (Nhà hàng xác nhận)
└────┬──────┘
     │
     ↓
┌──────────┐
│ Preparing│  (Nhà hàng chuẩn bị)
└────┬─────┘
     │
     ↓
┌───────────┐
│ Delivering│  (Shipper giao hàng)
└────┬──────┘
     │
     ↓
┌──────────┐
│ Delivered│  (Hoàn thành)
└──────────┘

Alternative: Cancelled (bất kỳ lúc nào từ pending/confirmed)
```

### Order Service Operations

```javascript
orderService {
  // CRUD
  create(data)        // Validate, calculate totals, apply promo
  findAll()           // Get orders with pagination
  updateStatus()      // Workflow validation
  delete()            // Soft delete

  // Business Logic
  validateCreate()    // Check items, restaurant
  calculateFee()      // Distance-based delivery fee
  applyPromotion()    // Validate & apply discount
  cancelOrder()       // Refund, notifications

  // Helpers
  notifyStatusChange()  // Send notifications
  logOrderEvent()       // Audit trail
}
```

---

## Database Schema

### Collections

```javascript
{
  users: [
    { id, email, password_hash, name, role, isActive, ... }
  ],

  restaurants: [
    { id, name, categoryId, latitude, longitude, rating, ... }
  ],

  products: [
    { id, name, price, discount, restaurantId, available, ... }
  ],

  orders: [
    {
      id, userId, restaurantId, items: [],
      subtotal, deliveryFee, discount, total,
      status, paymentMethod, deliveryAddress,
      deliveryLatitude, deliveryLongitude,
      shipperId, createdAt, ...
    }
  ],

  cart: [
    { id, userId, productId, quantity, ... }
  ],

  favorites: [
    { id, userId, type: 'restaurant'|'product', referenceId, ... }
  ],

  reviews: [
    { id, userId, restaurantId, rating, comment, ... }
  ],

  promotions: [
    { id, code, discountType, discountValue, minOrderValue, ... }
  ],

  addresses: [
    { id, userId, label, address, latitude, longitude, isDefault, ... }
  ],

  notifications: [
    { id, userId, title, message, type, refId, isRead, ... }
  ]
}
```

### Relationships

```
Users ←→ Orders (1:N)
        ├→ Reviews (1:N)
        ├→ Cart (1:N)
        ├→ Favorites (1:N)
        └→ Addresses (1:N)

Restaurants ←→ Products (1:N)
            ├→ Reviews (1:N)
            ├→ Orders (1:N)
            └→ Managers (1:1)

Orders ←→ Products (through items)
       ├→ Promotions (0:1)
       └→ Shippers (0:1)
```

---

## API Layers

### Layer 1: HTTP Layer (Express)

```javascript
// server.js
app.use(cors());
app.use(express.json());
app.use(parseQuery);
app.use(formatResponse);

// routes/
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
```

### Layer 2: Routing Layer

```javascript
// routes/order.routes.js
router.get("/", protect, orderController.getMyOrders);
router.post("/", protect, validation.order.create, orderController.create);
router.patch("/:id/status", protect, orderController.updateStatus);
```

### Layer 3: Middleware Layer

```javascript
// auth.middleware.js - protect()
// Verify JWT token

// rbac.middleware.js - checkPermission()
// Check user role

// validation.middleware.js
// Validate request body
```

### Layer 4: Controller Layer

```javascript
// Handle HTTP requests/responses
// Validate input
// Call services
// Format output
```

### Layer 5: Service Layer

```javascript
// Business logic
// Database operations
// Complex calculations
// External service calls
```

### Layer 6: Database Layer

```javascript
// CRUD operations
// Data persistence
// Query optimization
```

---

## Best Practices

### 1. **Error Handling**

```javascript
// Good
try {
  const result = await service.create(data);
  res.json(result);
} catch (error) {
  next(error); // Pass to error handler
}

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message,
  });
});
```

### 2. **Validation**

```javascript
// Request validation
router.post(
  "/",
  [body("email").isEmail(), body("password").isLength({min: 6}), body("phone").notEmpty()],
  controller.create
);

// Response validation in service
if (!item) {
  return {
    success: false,
    message: "Item not found",
    statusCode: 404,
  };
}
```

### 3. **Authorization Checks**

```javascript
// Check ownership
if (resource.userId !== req.user.id && req.user.role !== "admin") {
  return res.status(403).json({
    success: false,
    message: "Not authorized",
  });
}

// Check role
router.delete("/:id", authorize("admin"), controller.delete);
```

### 4. **Secure Password Handling**

```javascript
// Hash password
const hashedPassword = await hashPassword(password);

// Never return password
const sanitizedUser = sanitizeUser(user); // Remove password field

// Verify password
const isMatch = await comparePassword(inputPassword, hashedPassword);
```

### 5. **Transaction-like Operations**

```javascript
// Order creation: do all or nothing
async beforeCreate(data) {
  try {
    // Validate items
    // Calculate totals
    // Check inventory

    // All validations passed, safe to proceed
    return transformedData;
  } catch (error) {
    return { success: false, error };
  }
}
```

### 6. **Pagination for Large Datasets**

```javascript
// Always use pagination
GET /api/orders?_page=1&_limit=10

// Response includes pagination info
{
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNext: true
  }
}
```

### 7. **Logging & Monitoring**

```javascript
// Log important events
this.logOrderEvent(orderId, "created", userId, {total});

// Track status changes
console.log(`[ORDER] #${id} ${oldStatus} → ${newStatus}`);

// Error logging
console.error(`[ERROR] Order creation failed:`, error);
```

### 8. **Rate Limiting (Future)**

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

---

## Development Workflow

### Adding New Feature

```
1. Create Database Collections (if needed)
   - Update seedData.js

2. Create Service
   - services/feature.service.js
   - Extend BaseService
   - Implement business logic

3. Create Controller
   - controllers/feature.controller.js
   - Extend BaseController
   - Handle HTTP requests

4. Create Routes
   - routes/feature.routes.js
   - Add middleware
   - Map to controller

5. Update Server
   - Add route to server.js
   - Test all endpoints

6. Write Tests
   - Add test cases
   - Test edge cases

7. Document
   - Update API_ENDPOINTS.md
   - Add examples
```

### Testing Workflow

```bash
# Unit test
npm test

# Integration test
npm run test:integration

# Manual test
npm run dev
curl http://localhost:3000/api/...

# Load test
npm run load-test
```

---

## Performance Optimization

### 1. **Pagination**

Always paginate large result sets

### 2. **Indexing**

Create indexes on frequently queried fields

### 3. **Caching**

Cache frequently accessed data (redis)

### 4. **Query Optimization**

Select only needed fields, use relationships wisely

### 5. **Compression**

Enable gzip compression

### 6. **CDN**

Use CDN for static assets

---

## Security Architecture

```
┌────────────────────────────────────┐
│ HTTPS / TLS                        │
├────────────────────────────────────┤
│ CORS Headers                       │
├────────────────────────────────────┤
│ Input Validation                   │
├────────────────────────────────────┤
│ Authentication (JWT)               │
├────────────────────────────────────┤
│ Authorization (RBAC)               │
├────────────────────────────────────┤
│ Data Encryption                    │
├────────────────────────────────────┤
│ Rate Limiting                      │
├────────────────────────────────────┤
│ Logging & Monitoring               │
└────────────────────────────────────┘
```

---

## Conclusion

Kiến trúc này được thiết kế để:

- ✅ Dễ bảo trì (separation of concerns)
- ✅ Dễ mở rộng (pattern-based)
- ✅ Dễ test (layered architecture)
- ✅ Dễ scale (modular services)
- ✅ An toàn (security layers)
- ✅ Hiệu năng (optimization strategies)
