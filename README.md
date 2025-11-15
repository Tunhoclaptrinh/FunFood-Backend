# 🍔 FunFood Backend API v2.1 - Complete Documentation

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-9.0-orange.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

Hệ thống backend API hoàn chỉnh cho ứng dụng đặt đồ ăn FunFood v2.1 với các tính năng nâng cao như RBAC, GPS tracking, Import/Export, Payment Gateway Integration và nhiều hơn nữa.

---

## 📋 Mục lục

1. [Tính năng](#-tính-năng)
2. [Công nghệ](#-công-nghệ)
3. [Cài đặt nhanh](#-cài-đặt-nhanh)
4. [Cấu trúc dự án](#-cấu-trúc-dự-án)
5. [Authentication & Authorization](#-authentication--authorization)
6. [API Endpoints](#-api-endpoints)
7. [Advanced Features](#-advanced-features)
8. [Error Handling](#-error-handling)
9. [Deployment](#-deployment)

---

## ✨ Tính năng

### 🔐 Authentication & Authorization

- **JWT Token-based Authentication**: Đăng ký, đăng nhập với token 30 ngày
- **Role-Based Access Control (RBAC)**: 4 roles (Admin, Customer, Manager, Shipper)
- **Ownership Verification**: Kiểm tra quyền sở hữu resource
- **Dynamic Permissions**: Phân quyền chi tiết per action

### 🏪 Restaurant Management (Quản lý nhà hàng)

- CRUD đầy đủ cho nhà hàng
- **GPS Coordinates**: Lưu vị trí nhà hàng
- **Nearby Search**: Tìm nhà hàng gần nhất (Haversine formula)
- **Distance Calculation**: Tính khoảng cách tự động
- Operating hours tracking
- Tự động cập nhật rating từ reviews

### 🍕 Product Management (Quản lý sản phẩm)

- CRUD products với advanced filtering
- Discount system (percentage-based)
- Availability management
- Category association
- Image URL support
- Bulk update availability

### 📦 Order System (Đơn hàng)

- **6-Status Workflow**: pending → confirmed → preparing → delivering → delivered/cancelled
- **Dynamic Delivery Fee**: Tính theo khoảng cách (Haversine)
- **Order Validation**: Kiểm tra đầy đủ trước tạo
- **Payment Integration**: Cash, Card, MoMo, ZaloPay
- **Order History**: Với pagination & filtering
- **Promotion Auto-apply**: Validate & apply discount

### 🛒 Cart System (Giỏ hàng)

- Add/Remove/Update items
- Auto total calculation
- **Cart Sync**: Đồng bộ từ client
- Group by restaurant
- Clear by restaurant/all

### ❤️ Favorites System (Yêu thích)

- Favorite **Restaurants & Products**
- Toggle favorite (add/remove)
- Check favorite status
- Lightweight ID list
- Trending favorites

### ⭐ Reviews & Ratings (Đánh giá)

- Rate **Restaurants & Products**
- Prevent duplicate reviews per type
- Auto rating update
- User review history
- Review statistics

### 🎟️ Promotions & Discounts (Khuyến mãi)

- 3 discount types
  - **Percentage**: % giảm với max discount
  - **Fixed**: Số tiền cố định
  - **Delivery**: Free ship
- Date range validity
- Usage limits (global & per-user)
- Promotion validation
- Bật/tắt toggle

### 📍 Address Management (Địa chỉ giao hàng)

- Multiple addresses per user
- **GPS Coordinates**
- Default address
- Labels (Home, Office, etc.)
- Recipient info
- Clear non-default

### 🔔 Notifications (Thông báo)

- Order status updates
- Promotion announcements
- Favorite restaurant updates
- Read/Unread status
- Mark as read (individual & bulk)
- Bulk clear

### 💳 Payment Processing (NEW!)

- **Multiple Methods**: Cash, Card, MoMo, ZaloPay
- Payment status tracking
- Refund system
- Webhook callbacks (mock)
- Payment history

### 👨‍💼 Manager Dashboard (NEW!)

- Quản lý restaurant riêng
- Menu management
- Order tracking & status update
- Statistics & revenue

### 🚚 Shipper Operations (NEW!)

- View available orders
- Accept order (assign to self)
- Track deliveries
- Update delivery status
- Delivery statistics & earnings

### 📥 Import/Export (NEW!)

- **Supported Formats**: Excel (.xlsx), CSV
- Batch import with validation
- Export with relationships
- Template generation
- Schema reference
- Error reporting

### 🔍 Advanced Query Features

- **Pagination**: `_page`, `_limit` (max 100)
- **Sorting**: `_sort`, `_order` (asc/desc)
- **Full-text Search**: `q` parameter
- **Advanced Filters**:
  - `field_gte`: Greater than or equal
  - `field_lte`: Less than or equal
  - `field_ne`: Not equal
  - `field_like`: Contains (case-insensitive)
  - `field_in`: In array
- **Relationships**: `_embed`, `_expand`
- **Response Headers**: X-Total-Count, X-Total-Pages, Link

### 📊 Analytics & Reports

- User statistics & activity
- Order analytics
- Revenue tracking
- Restaurant performance
- Shipper statistics

---

## 🛠 Công nghệ

| Công nghệ | Version | Mục đích              |
| --------- | ------- | --------------------- |
| Node.js   | 18.x+   | Runtime               |
| Express   | 4.18+   | Web Framework         |
| JWT       | 9.0+    | Authentication        |
| bcryptjs  | 2.4+    | Password hashing      |
| XLSX      | 0.18+   | Excel import/export   |
| json2csv  | 6.0+    | CSV export            |
| CORS      | 2.8+    | Cross-origin requests |
| dotenv    | 16.3+   | Environment variables |

---

## 🚀 Cài đặt nhanh

### Prerequisites

- Node.js 18.x hoặc cao hơn
- npm hoặc yarn
- Git

### Installation

```bash
# 1. Clone repository
git clone <your-repo-url>
cd funfood-backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.develop .env

# 4. Seed database
npm run seed

# 5. Start development
npm run dev
```

Server chạy tại: `http://localhost:3000`

### Test Accounts

```
Admin:     admin@funfood.com / 123456
Customer:  user@funfood.com / 123456
Manager:   manager.chay@funfood.com / 123456
Shipper:   shipper@funfood.com / 123456
```

---

## 📁 Cấu trúc dự án

```
funfood-backend/
├── config/
│   ├── database.js              # Database + advanced queries
│   └── endpoints.js             # API reference config
│
├── controllers/                 # HTTP request handlers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── restaurant.controller.js
│   ├── product.controller.js
│   ├── order.controller.js
│   ├── cart.controller.js
│   ├── favorite.controller.js
│   ├── review.controller.js
│   ├── promotion.controller.js
│   ├── address.controller.js
│   ├── notification.controller.js
│   ├── payment.controller.js
│   ├── manager.controller.js
│   ├── shipper.controller.js
│   └── importExport.controller.js
│
├── middleware/                  # Express middleware
│   ├── auth.middleware.js       # JWT + ownership check
│   ├── query.middleware.js      # Query parser + formatter
│   ├── rbac.middleware.js       # Role-based access control
│   └── validation.middleware.js # Input validation rules
│
├── routes/                      # API route definitions
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
├── services/                    # Business logic
│   ├── auth.service.js
│   ├── user.service.js
│   ├── restaurant.service.js
│   ├── product.service.js
│   ├── order.service.js
│   ├── cart.service.js
│   ├── favorite.service.js
│   ├── review.service.js
│   ├── promotion.service.js
│   ├── address.service.js
│   ├── notification.service.js
│   ├── payment.service.js
│   ├── shipper.service.js
│   └── importExport.service.js
│
├── utils/                       # Utilities
│   ├── BaseService.js           # Generic CRUD service
│   ├── BaseController.js        # Generic HTTP controller
│   ├── helpers.js               # JWT, crypto, GPS
│   └── seedData.js              # Database seeding
│
├── database/
│   └── db.json                  # JSON database (auto-generated)
│
├── .env                         # Environment config
├── .env.develop                 # Development template
├── .env.example                 # Full example
├── .gitignore
├── package.json
└── server.js                    # Entry point
```

---

## 🔐 Authentication & Authorization

### JWT Authentication Flow

```
1. POST /api/auth/register
   ├─ Validate email & password
   ├─ Hash password
   ├─ Create user
   └─ Generate JWT token (30 days)

2. POST /api/auth/login
   ├─ Find user by email
   ├─ Verify password
   └─ Generate JWT token

3. Authenticated Request
   GET /api/auth/me
   Header: Authorization: Bearer <token>
   ├─ Verify token signature
   ├─ Check expiration
   └─ Get user from database
```

### RBAC - Role-Based Access Control

| Role         | Module          | Permissions                                       |
| ------------ | --------------- | ------------------------------------------------- |
| **Admin**    | All             | create, read, update, delete, export, import      |
| **Manager**  | Own Restaurant  | read, update products, confirm orders, view stats |
| **Shipper**  | Assigned Orders | read, accept, update status, view earnings        |
| **Customer** | Own Data        | create orders, read own data, update profile      |

### Authorization Examples

```javascript
// Exact role check
router.delete("/:id", authorize("admin"), controller.delete);

// Permission-based
router.post("/", checkPermission("orders", "create"), controller.create);

// Ownership check
router.get("/:id", checkOwnership("order"), controller.getById);
```

---

## 📊 API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Summary

| Module        | Public | Protected | Admin  | Total   |
| ------------- | ------ | --------- | ------ | ------- |
| Auth          | 2      | 3         | 0      | 5       |
| Users         | 0      | 3         | 6      | 9       |
| Categories    | 2      | 0         | 3      | 5       |
| Restaurants   | 5      | 0         | 3      | 8       |
| Products      | 3      | 0         | 3      | 6       |
| Cart          | 0      | 7         | 0      | 7       |
| Orders        | 0      | 5         | 4      | 9       |
| Favorites     | 0      | 7         | 0      | 7       |
| Reviews       | 1      | 4         | 1      | 6       |
| Promotions    | 3      | 1         | 4      | 8       |
| Addresses     | 0      | 8         | 0      | 8       |
| Notifications | 0      | 5         | 0      | 5       |
| Payment       | 0      | 2         | 2      | 4       |
| Manager       | 0      | 5         | 0      | 5       |
| Shipper       | 0      | 5         | 0      | 5       |
| Import/Export | 0      | 0         | 9      | 9       |
| **TOTAL**     | **16** | **55**    | **40** | **111** |

### Authentication (`/api/auth`)

```
POST   /register              # Đăng ký (Public)
POST   /login                 # Đăng nhập (Public)
GET    /me                    # Get profile (Protected)
POST   /logout                # Đăng xuất (Protected)
PUT    /change-password       # Đổi password (Protected)
```

### Restaurants (`/api/restaurants`)

```
GET    /                      # List + filters (Public)
GET    /nearby                # Nearby search GPS (Public)
GET    /search?q=             # Full-text search (Public)
GET    /:id                   # Details (Public)
GET    /:id/products          # Menu (Public)
POST   /                      # Create (Admin)
PUT    /:id                   # Update (Admin)
DELETE /:id                   # Delete (Admin)

# Import/Export
GET    /template              # Download template (Admin)
GET    /schema                # Get schema (Admin)
POST   /import                # Import Excel/CSV (Admin)
GET    /export                # Export data (Admin)
```

### Products (`/api/products`)

```
GET    /                      # List + filters (Public)
GET    /search?q=             # Search (Public)
GET    /discounted            # On sale (Public)
GET    /:id                   # Details (Public)
POST   /                      # Create (Admin)
PUT    /:id                   # Update (Admin)
PATCH  /bulk/availability     # Bulk update (Admin)
DELETE /:id                   # Delete (Admin)

# Import/Export
GET    /template              # Template (Admin)
POST   /import                # Import (Admin)
GET    /export                # Export (Admin)
```

### Orders (`/api/orders`)

```
# Customer
GET    /                      # My orders (Protected)
POST   /                      # Create (Protected)
GET    /:id                   # Details (Protected)
PATCH  /:id/status            # Update status (Protected)
DELETE /:id                   # Cancel (Protected)
POST   /:id/reorder           # Reorder (Protected)
POST   /:id/rate              # Rate (Protected)
GET    /stats/summary         # My stats (Protected)

# Manager
GET    /manager/restaurant    # My restaurant (Manager)
GET    /manager/orders        # Orders (Manager)
PATCH  /manager/:id/status    # Update status (Manager)
GET    /manager/stats         # Stats (Manager)

# Shipper
GET    /shipper/available     # Available (Shipper)
POST   /shipper/:id/accept    # Accept (Shipper)
GET    /shipper/deliveries    # My deliveries (Shipper)
PATCH  /shipper/:id/status    # Update status (Shipper)
GET    /shipper/stats         # Stats (Shipper)

# Admin
GET    /admin/all             # All orders (Admin)
GET    /admin/stats           # Stats (Admin)
PATCH  /admin/:id/status      # Force update (Admin)
DELETE /admin/:id/permanent   # Permanent delete (Admin)
```

### Favorites (`/api/favorites`)

```
GET    /                      # All (Protected)
GET    /:type                 # By type (Protected)
GET    /:type/ids             # Lightweight IDs (Protected)
GET    /trending/:type        # Trending (Protected)
GET    /stats/summary         # Stats (Protected)
GET    /:type/:id/check       # Check (Protected)
POST   /:type/:id             # Add (Protected)
POST   /:type/:id/toggle      # Toggle (Protected)
DELETE /:type/:id             # Remove (Protected)
DELETE /:type                 # Clear by type (Protected)
DELETE /                      # Clear all (Protected)
```

### Reviews (`/api/reviews`)

```
GET    /restaurant/:id        # Restaurant reviews (Public)
GET    /product/:id           # Product reviews (Public)
GET    /type/:type            # By type (Public)
POST   /                      # Create (Protected)
GET    /user/me               # My reviews (Protected)
GET    /user/stats            # My stats (Protected)
GET    /check/:type/:id       # Check reviewed (Protected)
PUT    /:id                   # Update (Protected)
DELETE /:id                   # Delete (Protected)
GET    /                      # All (Admin)
```

### Import/Export Endpoints

```
# Available for: Users, Categories, Restaurants, Products, Promotions

GET    /<entity>/template     # Download template (Admin)
GET    /<entity>/schema       # Get schema (Admin)
POST   /<entity>/import       # Import file (Admin)
GET    /<entity>/export       # Export data (Admin)
```

**Supported Entities**: users, categories, restaurants, products, promotions

---

## 🚀 Advanced Features

### 1. GPS & Location Features

#### Nearby Search

```bash
GET /api/restaurants/nearby?latitude=10.7756&longitude=106.7019&radius=5
```

**Response**:

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Phở Hà Nội",
      "distance": 0.8,
      "deliveryFee": 15000,
      "estimatedTime": "20-25 phút"
    }
  ]
}
```

#### Dynamic Delivery Fee

```javascript
// Based on distance (Haversine formula)
Distance ≤ 2km:     15,000đ (base fee)
2-5km:              15,000đ + (distance-2) × 5,000đ/km
> 5km:              30,000đ + (distance-5) × 7,000đ/km
```

### 2. Advanced Query Features

```bash
# Pagination
GET /api/restaurants?_page=1&_limit=20

# Sorting (multi-field)
GET /api/restaurants?_sort=rating,name&_order=desc

# Search
GET /api/products?q=pizza

# Complex filtering
GET /api/orders?status_in=pending,confirmed&total_gte=100000&total_lte=500000

# Relationships
GET /api/restaurants/1?_embed=products,reviews&_expand=category

# Combined
GET /api/products?price_gte=50000&price_lte=100000&available=true&_embed=restaurant&_page=1&_limit=10
```

### 3. Order Workflow & Validation

```javascript
Order Status Flow:
pending → confirmed → preparing → delivering → delivered
                   ↓
                cancelled (anytime from pending/confirmed)

Validation before create:
✓ Items must exist & available
✓ All items from same restaurant
✓ Delivery address required
✓ Restaurant must be open
```

### 4. Promotion System

```javascript
// 3 Discount Types:
1. Percentage:  discount = orderValue × (discountValue / 100)
2. Fixed:       discount = discountValue
3. Delivery:    discount = deliveryFee

// Validation:
- Check date range validity
- Verify min order value
- Check usage limits (global & per-user)
- Prevent double usage
```

### 5. Import/Export Features

#### Import (Excel/CSV)

```bash
POST /api/products/import
Content-Type: multipart/form-data
file: products.xlsx
```

**Features**:

- Batch validation
- Foreign key verification
- Duplicate detection
- Error reporting
- Partial success handling

#### Export

```bash
GET /api/restaurants/export?format=xlsx&includeRelations=true
```

**Options**:

- Format: xlsx, csv
- Include relationships
- Select columns
- Filters & pagination

#### Schema Reference

```bash
GET /api/products/schema
```

**Response**:

```json
{
  "name": {"type": "string", "required": true},
  "price": {"type": "number", "required": true, "min": 0},
  "restaurantId": {"type": "number", "required": true, "foreignKey": "restaurants"}
}
```

### 6. Payment Integration

```javascript
Supported Methods:
1. Cash (COD)
2. Card (Stripe-ready)
3. MoMo (Integration ready)
4. ZaloPay (Integration ready)

Flow:
1. POST /api/payment/:orderId/create
2. Process payment (external gateway or mock)
3. Webhook callback validation
4. Update order payment status
5. Send notification
```

### 7. Manager Dashboard

```
Operations:
- View restaurant info
- Manage menu (CRUD products)
- Toggle product availability
- View orders for restaurant
- Confirm/prepare orders
- View revenue & statistics
```

### 8. Shipper Operations

```
Operations:
- View available orders (status: preparing)
- Accept order (assign to self)
- Track current deliveries
- Update delivery status (delivering → delivered)
- View earnings (80% of delivery fee)
- View delivery statistics
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning       | Example                  |
| ---- | ------------- | ------------------------ |
| 200  | OK            | Resource retrieved       |
| 201  | Created       | Resource created         |
| 400  | Bad Request   | Invalid input            |
| 401  | Unauthorized  | Missing/invalid token    |
| 403  | Forbidden     | Insufficient permissions |
| 404  | Not Found     | Resource not found       |
| 409  | Conflict      | Duplicate data           |
| 422  | Unprocessable | Validation failed        |
| 500  | Server Error  | Internal error           |

### Common Errors

```javascript
// Missing authentication
{ success: false, message: "Not authorized to access this route" }

// Invalid role
{ success: false, message: "User role 'customer' is not authorized" }

// Resource not found
{ success: false, message: "Restaurant not found", statusCode: 404 }

// Business logic error
{ success: false, message: "Cannot cancel order in status: delivered" }

// Validation error
{
  success: false,
  message: "Validation failed",
  errors: [
    { field: "price", message: "Price must be >= 0" }
  ]
}
```

---

## 📦 Response Format

### Success with Pagination

```json
{
  "success": true,
  "count": 10,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Response Headers (for paginated requests)

```
X-Total-Count: 50
X-Total-Pages: 5
X-Current-Page: 1
X-Per-Page: 10
Link: <...>; rel="first", <...>; rel="prev", <...>; rel="next", <...>; rel="last"
```

---

## 🚀 Deployment

### Pre-deployment Checklist

```
Security:
- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS/TLS
- [ ] Enable rate limiting
- [ ] Add CORS whitelist
- [ ] Input sanitization

Database:
- [ ] Migrate to real database (MongoDB/PostgreSQL)
- [ ] Setup backup strategy
- [ ] Create indexes
- [ ] Test restore procedure

Monitoring:
- [ ] Setup logging (Winston)
- [ ] Setup error tracking (Sentry)
- [ ] Setup performance monitoring
- [ ] Setup uptime monitoring

Documentation:
- [ ] API documentation complete
- [ ] Deployment guide
- [ ] Runbook for incidents
```

### Deploy to Heroku

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login
heroku login

# 3. Create app
heroku create funfood-api

# 4. Set environment
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set NODE_ENV=production
heroku config:set JWT_EXPIRE=30d

# 5. Deploy
git push heroku main

# 6. View logs
heroku logs --tail
```

### Deploy to VPS (Ubuntu)

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Setup PM2
sudo npm install -g pm2

# 3. Clone & install
git clone <repo>
cd funfood-backend
npm install --production

# 4. Start with PM2
pm2 start server.js --name funfood-api
pm2 startup
pm2 save

# 5. Setup Nginx (reverse proxy)
sudo apt install nginx
# Configure /etc/nginx/sites-available/funfood-api
# Point to localhost:3000
```

---

## 📞 Support & Resources

- **Documentation**: See `/docs` folder
- **API Health**: `GET /api/health`
- **API Explorer**: `GET /api`
- **Endpoints Reference**: `GET /api/endpoints`

---

## 📄 License

This project is licensed under the MIT License.

---

**Version**: 2.1.0 | **Last Updated**: 2024 | **Status**: Production Ready
