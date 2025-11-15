# 🍔 FunFood Backend API v2.1 - Complete Documentation

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-9.0-orange.svg)](https://jwt.io/)

<!-- [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#license) -->

Backend API hoàn chỉnh cho ứng dụng đặt đồ ăn FunFood. Được xây dựng với Node.js, Express, JWT Authentication và tích hợp đầy đủ tính năng JSON-Server style queries với GPS tracking, RBAC, Payment Gateway Integration và nhiều hơn nữa.

---

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ](#-công-nghệ)
- [Cài đặt nhanh](#-cài-đặt-nhanh)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Authentication & Authorization](#-authentication--authorization)
- [API Endpoints](#-api-endpoints)
- [Tính năng JSON-Server](#-tính-năng-json-server)
- [GPS & Location Features](#-gps--location-features)
- [Advanced Features](#-advanced-features)
- [Error Handling](#-error-handling)
- [Deployment](#-deployment)

---

## ✨ Tính năng

### 🎯 Core Features

#### 🔐 Authentication & Authorization

- **JWT Token-based Authentication**: Đăng ký, đăng nhập với JWT token 30 ngày
- **Role-Based Access Control (RBAC)**: 4 roles (Admin, Customer, Manager, Shipper)
- **Password hashing**: bcrypt với salt rounds = 10
- **Change password**: Đổi mật khẩu an toàn
- **Protected routes**: Middleware bảo vệ routes
- **Token expiration**: 30 ngày (configurable)
- **Ownership Verification**: Kiểm tra quyền sở hữu resource
- **Dynamic Permissions**: Phân quyền chi tiết per action

#### 🏪 Quản lý nhà hàng

- **CRUD đầy đủ** với phân quyền
- Lọc theo category, status, rating
- Tìm kiếm full-text
- **GPS coordinates** (latitude, longitude)
- **Nearby search** - Tìm nhà hàng gần nhất (Haversine formula)
- **Distance Calculation**: Tính khoảng cách tự động
- Open/Close time tracking
- Tự động cập nhật rating từ reviews
- Phone contact information
- Operating hours management

#### 🍕 Quản lý sản phẩm

- CRUD sản phẩm với images
- Lọc theo restaurant, category, price range
- **Discount management** (percentage-based)
- Available/Unavailable status
- Full-text search
- Relationship với restaurant & category
- **Bulk update availability**: Cập nhật hàng loạt

#### 🛒 Giỏ hàng

- Add/Remove/Update items
- Tính tổng tự động
- **Sync cart** từ client
- Clear by restaurant
- Group items by restaurant
- Real-time total calculation
- Enrich với product & restaurant info

#### 📦 Đơn hàng

- **6-Status Workflow**: pending → confirmed → preparing → delivering → delivered/cancelled
- Tạo đơn với validation đầy đủ
- **GPS tracking** (delivery location)
- **Distance calculation** tự động
- **Dynamic delivery fee** theo khoảng cách
- Tự động áp dụng promotion
- **Payment methods**: Cash, Card, MoMo, ZaloPay
- Order history với pagination
- Cancel order (chỉ pending/confirmed)
- **Reorder**: Đặt lại đơn cũ
- **Rate order**: Đánh giá sau khi giao

#### ❤️ Yêu thích

- Favorite **Restaurants & Products** (unified)
- **Toggle favorite** (add hoặc remove)
- Check favorite status
- Get favorite IDs only (lightweight)
- List với restaurant/product details
- **Trending favorites**: Top favorites theo loại

#### ⭐ Đánh giá

- Rate **Restaurants & Products** (1-5 sao)
- Comment/Review text
- Link với order (optional)
- Tự động update restaurant/product rating
- **Chống duplicate review** per type
- Edit/Delete own reviews
- **Review statistics**: Phân tích đánh giá

#### 🎟️ Khuyến mãi

- **3 loại discount**:
  - **Percentage**: % giảm với max discount
  - **Fixed**: Số tiền cố định
  - **Delivery**: Free ship
- Code validation với rules
- Date range validity
- Usage limits (total & per user)
- Min order value requirement
- Active/Inactive toggle
- **Promotion validation**: Kiểm tra hợp lệ trước áp dụng

#### 📍 Địa chỉ giao hàng

- Quản lý nhiều địa chỉ
- **GPS coordinates** (latitude, longitude)
- Set default address
- Label (Nhà, Công ty, etc.)
- Recipient info (name, phone)
- Delivery notes
- Clear non-default addresses

#### 🔔 Thông báo

- Order status updates
- Promotion announcements
- Favorite restaurant updates
- Read/Unread status
- Mark as read (individual & bulk)
- Clear all notifications
- Push notification ready

#### 💳 Payment Processing (NEW!)

- **Multiple Methods**: Cash, Card, MoMo, ZaloPay
- Payment status tracking
- Refund system
- Webhook callbacks (mock)
- Payment history
- **Payment validation**: Kiểm tra signature

#### 👨‍💼 Manager Dashboard (NEW!)

- Quản lý restaurant riêng
- Menu management (CRUD products)
- Order tracking & status update
- Statistics & revenue
- **Product availability toggle**

#### 🚚 Shipper Operations (NEW!)

- View available orders
- Accept order (assign to self)
- Track deliveries
- Update delivery status
- Delivery statistics & earnings
- **Auto-calculate earnings**: 80% delivery fee

#### 📥 Import/Export (NEW!)

- **Supported Formats**: Excel (.xlsx), CSV
- Batch import with validation
- Export with relationships
- Template generation
- Schema reference
- Error reporting
- **Partial success handling**

---

## 🚀 Tính năng JSON-Server

### Complete Example

```bash
# Tìm restaurants gần tôi, đang mở, rating >= 4.5, kèm products, phân trang
GET /api/restaurants/nearby?latitude=10.7756&longitude=106.7019&radius=3&isOpen=true&rating_gte=4.5&_embed=products&_page=1&_limit=5

# Response:
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Phở Hà Nội",
      "rating": 4.7,
      "distance": 0.8,
      "products": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 3,
    "totalPages": 1
  }
}

# Headers:
X-Total-Count: 3
X-Current-Page: 1
Link: <...>; rel="first", <...>; rel="last"
```

### All Query Parameters

| Parameter    | Example               | Description                     |
| ------------ | --------------------- | ------------------------------- |
| `_page`      | `?_page=2`            | Trang số 2                      |
| `_limit`     | `?_limit=20`          | 20 items/trang                  |
| `_sort`      | `?_sort=price`        | Sắp xếp theo price              |
| `_order`     | `?_order=desc`        | Thứ tự giảm dần                 |
| `q`          | `?q=pizza`            | Tìm "pizza" trong tất cả fields |
| `field_gte`  | `?price_gte=50000`    | price >= 50000                  |
| `field_lte`  | `?price_lte=100000`   | price <= 100000                 |
| `field_ne`   | `?discount_ne=0`      | discount ≠ 0                    |
| `field_like` | `?name_like=phở`      | name chứa "phở"                 |
| `field_in`   | `?id_in=1,2,3`        | id trong [1,2,3]                |
| `_embed`     | `?_embed=products`    | Nhúng products                  |
| `_expand`    | `?_expand=restaurant` | Mở rộng FK                      |

### Pagination

```bash
# Trang 1, 10 items
GET /api/restaurants?_page=1&_limit=10

# Response Headers:
X-Total-Count: 50
X-Total-Pages: 5
X-Current-Page: 1
Link: <...>; rel="first", <...>; rel="next", <...>; rel="last"
```

### Sorting (Multiple Fields)

```bash
# Sắp xếp theo rating (desc), sau đó name (asc)
GET /api/restaurants?_sort=rating,name&_order=desc,asc
```

### Full-Text Search

```bash
# Tìm "pizza" trong tất cả string fields
GET /api/products?q=pizza

# Case-insensitive, partial match
```

### Advanced Filtering

```bash
# Kết hợp nhiều operators
GET /api/products?price_gte=50000&price_lte=100000&discount_ne=0&available=true

# In list
GET /api/orders?status_in=pending,confirmed,preparing

# Like (contains)
GET /api/restaurants?name_like=phở
```

### Relationships

```bash
# Embed: nhúng dữ liệu con
GET /api/restaurants/1?_embed=products,reviews

# Expand: mở rộng foreign key
GET /api/products/1?_expand=restaurant,category

# Kết hợp
GET /api/restaurants?_embed=products&_expand=category
```

---

## 🗺️ GPS & Location Features

### 1. Nearby Restaurants

```bash
# Tìm restaurants trong bán kính 5km
GET /api/restaurants/nearby?latitude=10.7756&longitude=106.7019&radius=5

# Response:
{
  "data": [
    {
      "id": 2,
      "name": "Phở Hà Nội",
      "latitude": 10.7756,
      "longitude": 106.7019,
      "distance": 0.0,
      "deliveryTime": "25-35 phút",
      "deliveryFee": 20000
    },
    {
      "id": 1,
      "name": "Cơm Tấm",
      "distance": 2.3,
      "deliveryFee": 25000
    }
  ]
}
```

### 2. Order với GPS

```bash
POST /api/orders
{
  "restaurantId": 1,
  "items": [...],
  "deliveryAddress": "123 ABC Street",
  "deliveryLatitude": 10.7769,
  "deliveryLongitude": 106.7009,
  "paymentMethod": "cash"
}

# Server tự động:
# 1. Tính khoảng cách từ restaurant → địa chỉ giao
# 2. Tính phí giao hàng động (dynamic delivery fee)
# 3. Lưu GPS coordinates
```

### 3. Distance Calculation & Dynamic Delivery Fee

```javascript
// Haversine Formula
Distance = √[(Δlat)² + (Δlon)²] × Earth_Radius

// Dynamic Delivery Fee:
Distance ≤ 2km:     15,000đ (base fee)
2km < d ≤ 5km:      15,000đ + (d-2) × 5,000đ/km
Distance > 5km:     30,000đ + (d-5) × 7,000đ/km

// Example:
Restaurant: (10.7756, 106.7019)
Customer:   (10.7769, 106.7009)
→ Distance: ~0.14 km
→ Delivery Fee: 15,000đ (base fee)
```

---

## 🛠 Công nghệ

| Công nghệ         | Version | Mục đích              |
| ----------------- | ------- | --------------------- |
| Node.js           | 18.x+   | Runtime               |
| Express           | 4.18+   | Web Framework         |
| JWT               | 9.0+    | Authentication        |
| bcryptjs          | 2.4+    | Password hashing      |
| XLSX              | 0.18+   | Excel import/export   |
| json2csv          | 6.0+    | CSV export            |
| CORS              | 2.8+    | Cross-origin requests |
| dotenv            | 16.3+   | Environment variables |
| express-validator | 7.0+    | Input validation      |
| multer            | 2.0+    | File upload           |

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

**Server chạy tại:** `http://localhost:3000`

### Test Accounts (sau khi seed)

```
Admin:
Email: admin@funfood.com
Password: 123456

Customer 1:
Email: user@funfood.com
Password: 123456

Customer 2:
Email: customer@funfood.com
Password: 123456

Shipper:
Email: shipper@funfood.com
Password: 123456

Manager:
Email: manager.chay@funfood.com
Password: 123456
```

### Quick Test

```bash
# Health check
curl http://localhost:3000/api/health

# API docs
curl http://localhost:3000/api

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@funfood.com","password":"123456"}'
```

---

## 📁 Cấu trúc dự án

```
funfood-backend/
├── config/
│   ├── database.js              # Enhanced database + JSON-Server features
│   └── endpoints.js             # API endpoints reference
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
│   ├── restaurant.service.js    # GPS features
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
├── utils/                       # Utilities
│   ├── BaseService.js           # Generic CRUD service
│   ├── BaseController.js        # Generic HTTP controller
│   ├── helpers.js               # JWT, crypto, GPS functions
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

### Quick Reference

#### Authentication (`/api/auth`)

```bash
POST   /register              # Đăng ký (Public)
POST   /login                 # Đăng nhập (Public)
GET    /me                    # Get profile (Protected)
POST   /logout                # Đăng xuất (Protected)
PUT    /change-password       # Đổi password (Protected)
```

#### Restaurants (`/api/restaurants`)

```bash
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

#### Orders (`/api/orders`)

```bash
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

**📖 Full documentation:** [API_ENDPOINTS.md](docs/API_ENDPOINTS.md)

---

## 📦 Advanced Features

### 1. Order Workflow & Validation

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
✓ Check pending payment orders
```

### 2. Promotion System

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

### 3. Import/Export Features

#### Import (Excel/CSV)

```bash
POST /api/products/import
Content-Type: multipart/form-data
file: products.xlsx
```

**Features:**

- Batch validation
- Foreign key verification
- Duplicate detection
- Error reporting
- Partial success handling

#### Export

```bash
GET /api/restaurants/export?format=xlsx&includeRelations=true
```

**Options:**

- Format: xlsx, csv
- Include relationships
- Select columns
- Filters & pagination

#### Schema Reference

```bash
GET /api/products/schema
```

**Response:**

```json
{
  "name": {"type": "string", "required": true},
  "price": {"type": "number", "required": true, "min": 0},
  "restaurantId": {"type": "number", "required": true, "foreignKey": "restaurants"}
}
```

### 4. Payment Integration

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

## 📚 Documentation

- **[API_ENDPOINTS.md](docs/API_ENDPOINTS.md)** - Complete API reference với tất cả 111 endpoints
- **[QUICK_START.md](docs/QUICK_START.md)** - Quick start guide
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment guide
- **[MISSING_FEATURES.md](docs/MISSING_FEATURES.md)** - Future enhancements

---

## 📞 Support & Resources

- **Documentation**: See `/docs` folder
- **API Health**: `GET /api/health`
- **API Explorer**: `GET /api`
- **Endpoints Reference**: `GET /api/endpoints`

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

<!-- ---

## 📄 License

This project is licensed under the MIT License.

--- -->

## 🙏 Acknowledgments

- Inspired by [JSON Server](https://github.com/typicode/json-server)
- Built with [Express.js](https://expressjs.com/)
- Authentication with [JWT](https://jwt.io/)
- GPS calculations using Haversine formula

---

**Made with ❤️ for FunFood App** | Version 2.1.0 | Last Updated: November 2024
