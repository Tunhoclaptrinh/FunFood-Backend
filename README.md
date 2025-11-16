# 🍔 FunFood Backend API v2.2 - Complete Documentation

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-9.0-orange.svg)](https://jwt.io/)

Backend API hoàn chỉnh cho ứng dụng đặt đồ ăn FunFood. Được xây dựng với Node.js, Express, JWT Authentication và tích hợp đầy đủ tính năng JSON-Server style queries với GPS tracking, RBAC, Payment Gateway Integration, Schema-based Validation và nhiều hơn nữa.

---

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ](#-công-nghệ)
- [Cài đặt nhanh](#-cài-đặt-nhanh)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Authentication & Authorization](#-authentication--authorization)
- [API Endpoints](#-api-endpoints)
- [Tính năng JSON-Server](#-tính-năng-json-server)
- [Schema Validation System](#-schema-validation-system)
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
- **Ownership Verification**: Kiểm tra quyền sở hữu resource
- **Dynamic Permissions**: Phân quyền chi tiết per action
- **Custom Validation**: Cross-field validation với custom functions

#### 📋 Schema Validation System (NEW!)

- **Centralized Schema Definitions**: Schema cho tất cả entities
- **Auto Type Conversion**: Tự động chuyển đổi kiểu dữ liệu
- **Foreign Key Validation**: Kiểm tra tính hợp lệ của FK
- **Custom Validation Functions**: Validation logic tùy chỉnh
- **Unique Constraint Checks**: Kiểm tra unique fields
- **Cross-field Validation**: Validation phụ thuộc nhiều fields
- **Import/Export Integration**: Validation cho batch operations

#### 🏪 Quản lý nhà hàng

- **CRUD đầy đủ** với phân quyền
- Lọc theo category, status, rating
- Tìm kiếm full-text
- **GPS coordinates** (latitude, longitude)
- **Nearby search** - Tìm nhà hàng gần nhất (Haversine formula)
- **Distance Calculation**: Tính khoảng cách tự động
- Open/Close time tracking
- Tự động cập nhật rating từ reviews
- Manager assignment system

#### 🍕 Quản lý sản phẩm

- CRUD sản phẩm với images
- Lọc theo restaurant, category, price range
- **Discount management** (percentage-based)
- Available/Unavailable status
- Full-text search
- Relationship với restaurant & category
- **Bulk update availability**: Cập nhật hàng loạt
- Schema-based validation

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
- Workflow validation per role

#### ❤️ Yêu thích (Unified)

- Favorite **Restaurants & Products** (unified API)
- **Toggle favorite** (add hoặc remove)
- Check favorite status
- Get favorite IDs only (lightweight)
- List với restaurant/product details
- **Trending favorites**: Top favorites theo loại
- Statistics & analytics

#### ⭐ Đánh giá (Unified)

- Rate **Restaurants & Products** (unified API)
- Comment/Review text (1-5 sao)
- Link với order (optional)
- Tự động update restaurant/product rating
- **Chống duplicate review** per type
- Edit/Delete own reviews
- **Review statistics**: Phân tích đánh giá
- Cross-field validation

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
- Schema-based code validation

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

#### 💳 Payment Processing

- **Multiple Methods**: Cash, Card, MoMo, ZaloPay
- Payment status tracking
- Refund system
- Webhook callbacks (mock)
- Payment history
- **Payment validation**: Kiểm tra signature

#### 👨‍💼 Manager Dashboard

- Quản lý restaurant riêng
- Menu management (CRUD products)
- Order tracking & status update
- Statistics & revenue
- **Product availability toggle**
- Manager assignment per restaurant

#### 🚚 Shipper Operations

- View available orders
- Accept order (assign to self)
- Track deliveries
- Update delivery status
- Delivery statistics & earnings
- **Auto-calculate earnings**: 80% delivery fee
- Order assignment system

#### 📥 Import/Export (Enhanced)

- **Supported Formats**: Excel (.xlsx), CSV
- Batch import with schema validation
- Export with relationships
- Template generation with schema
- Schema reference documentation
- Error reporting per row
- **Partial success handling**
- Auto type conversion

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

## 🎯 Schema Validation System

### Tổng quan

Hệ thống validation tập trung dựa trên schema definitions cho tất cả entities. Schema được định nghĩa trong `schemas/` directory và được integrate vào `BaseService`.

### Schema Structure

```javascript
// schemas/user.schema.js
module.exports = {
  name: {
    type: "string",
    required: true,
    minLength: 2,
    maxLength: 100,
    description: "Full name of user",
  },
  email: {
    type: "email",
    required: true,
    unique: true,
    description: "Email address (must be unique)",
    custom: (value, allData) => {
      // Custom validation
      if (value.endsWith("@competitor.com")) {
        return "Cannot use competitor email";
      }
      // Cross-field validation
      if (allData.role === "admin" && !value.endsWith("@funfood.com")) {
        return "Admin must use company email";
      }
      return null; // Valid
    },
  },
  phone: {
    type: "string",
    required: true,
    minLength: 10,
    maxLength: 11,
    description: "Phone number",
    custom: (value) => {
      const vnPhoneRegex = /^(0|\+84)[0-9]{9}$/;
      if (!vnPhoneRegex.test(value)) {
        return "Invalid Vietnam phone number format";
      }
      return null;
    },
  },
};
```

### Supported Validation Types

- **Basic Types**: `string`, `number`, `boolean`, `date`, `email`, `enum`
- **Constraints**: `required`, `unique`, `min`, `max`, `minLength`, `maxLength`
- **Relations**: `foreignKey` - tự động validate FK references
- **Custom Functions**: `custom` - validation logic tùy chỉnh với cross-field support

### Auto Features

```javascript
// BaseService tự động:
✓ Type conversion (string → number, "true" → boolean)
✓ Foreign key validation
✓ Unique constraint checks
✓ Required field validation
✓ Range & length validation
✓ Custom validation execution
✓ Error aggregation
```

### Usage in Services

```javascript
class UserService extends BaseService {
  constructor() {
    super("users"); // Tự động load schema
  }

  // BaseService tự động validate khi:
  async create(data) {
    // 1. Schema validation
    // 2. Custom validateCreate() hook
    // 3. Type conversion
    // 4. beforeCreate() transform
    // 5. Database save
    // 6. afterCreate() hook
  }

  async update(id, data) {
    // Tương tự với update
  }
}
```

### Import/Export Integration

```javascript
// Import với schema validation
POST /api/users/import
file: users.xlsx

// Server validate từng row theo schema:
✓ Required fields
✓ Type conversion
✓ Foreign key references
✓ Unique constraints
✓ Custom validations

// Response với detailed errors
{
  "summary": {
    "total": 48,
    "success": 45,
    "failed": 3
  },
  "errors": [
    {
      "row": 12,
      "data": {"email": "invalid@"},
      "errors": ["email must be a valid email"]
    }
  ]
}
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

Manager (Nhà Hàng Chay - ID: 8):
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
│   ├── database.js              # Enhanced DB + JSON-Server features
│   └── endpoints.js             # API endpoints reference
│
├── controllers/                 # HTTP request handlers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── [... 15 controllers ...]
│   └── importExport.controller.js
│
├── middleware/                  # Express middleware
│   ├── auth.middleware.js       # JWT + ownership check
│   ├── query.middleware.js      # Query parser + formatter
│   ├── rbac.middleware.js       # Role-based access control
│   └── validation.middleware.js # Schema-based validation
│
├── routes/                      # API route definitions
│   ├── auth.routes.js
│   ├── [... 15 route files ...]
│   └── shipper.routes.js
│
├── services/                    # Business logic
│   ├── auth.service.js
│   ├── [... services ...]
│   └── importExport.service.js
│
├── schemas/                     # 🆕 Schema definitions
│   ├── index.js                 # Schema exports
│   ├── user.schema.js
│   ├── restaurant.schema.js
│   ├── product.schema.js
│   ├── order.schema.js
│   ├── promotion.schema.js
│   └── [... 12 schemas ...]
│
├── utils/                       # Utilities
│   ├── BaseService.js           # Enhanced with schema validation
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
   ├─ Validate email & password (schema-based)
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

// Workflow validation
router.patch("/:id/status", checkOwnership("order"), validateOrderStatusTransition, controller.updateStatus);
```

---

## 📊 API Endpoints Summary

| Module        | Public | Protected | Admin  | Total   |
| ------------- | ------ | --------- | ------ | ------- |
| Auth          | 2      | 3         | 0      | 5       |
| Users         | 0      | 3         | 10     | 13      |
| Categories    | 2      | 0         | 7      | 9       |
| Restaurants   | 5      | 0         | 7      | 12      |
| Products      | 3      | 0         | 7      | 10      |
| Cart          | 0      | 7         | 0      | 7       |
| Orders        | 0      | 8         | 8      | 16      |
| Favorites     | 0      | 11        | 0      | 11      |
| Reviews       | 3      | 5         | 2      | 10      |
| Promotions    | 3      | 1         | 8      | 12      |
| Addresses     | 0      | 8         | 0      | 8       |
| Notifications | 0      | 5         | 0      | 5       |
| Payment       | 2      | 2         | 2      | 6       |
| Manager       | 0      | 8         | 0      | 8       |
| Shipper       | 0      | 6         | 0      | 6       |
| **TOTAL**     | **20** | **67**    | **51** | **138** |

**📖 Full documentation:** [API_ENDPOINTS.md](docs/API_ENDPOINTS.md)

---

## 📦 Advanced Features

### 1. Schema-Based Validation System

```javascript
✓ Centralized schema definitions
✓ Auto type conversion
✓ Foreign key validation
✓ Unique constraint checks
✓ Custom validation functions
✓ Cross-field validation
✓ Import/export integration
✓ Detailed error reporting
```

### 2. Order Workflow & Validation

```javascript
Order Status Flow:
pending → confirmed → preparing → delivering → delivered
                   ↓
                cancelled (anytime from pending/confirmed)

Validation before create:
✓ Items must exist & available (schema validation)
✓ All items from same restaurant
✓ Delivery address required
✓ Restaurant must be open
✓ Check pending payment orders
✓ GPS coordinates validated
```

### 3. Unified Favorites & Reviews

```javascript
// Hỗ trợ cả Restaurant & Product trong cùng API
GET /api/favorites/:type          // type = restaurant | product
POST /api/favorites/:type/:id/toggle
GET /api/reviews/type/:type
POST /api/reviews                 // Tự động detect type
```

### 4. Import/Export với Schema Validation

```bash
# Download template với schema hints
GET /api/products/template?format=xlsx

# Get schema documentation
GET /api/products/schema

# Import với validation
POST /api/products/import
file: products.xlsx

# Response với detailed errors
{
  "summary": {
    "total": 48,
    "success": 45,
    "failed": 3
  },
  "errors": [
    {
      "row": 12,
      "data": {"price": -10000},
      "errors": ["price must be >= 0"]
    }
  ]
}

# Export với relationships
GET /api/products/export?format=xlsx&includeRelations=true
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
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

### Response Headers (paginated)

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
- [x] Schema-based validation implemented
- [x] JWT authentication active
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
- [x] API documentation complete
- [x] Schema documentation
- [ ] Deployment guide
- [ ] Runbook for incidents
```

---

## 📚 Documentation

- **[API_ENDPOINTS.md](docs/API_ENDPOINTS.md)** - Complete API reference với tất cả 111 endpoints
- **[QUICK_START.md](docs/QUICK_START.md)** - Quick start guide
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment guide
- **[MISSING_FEATURES.md](docs/MISSING_FEATURES.md)** - Future enhancements

---

## 🆕 What's New in v2.2

### Schema Validation System

- ✅ Centralized schema definitions trong `schemas/` directory
- ✅ Auto type conversion & validation
- ✅ Foreign key validation tự động
- ✅ Custom validation functions với cross-field support
- ✅ Integration với Import/Export

### Enhanced Services

- ✅ BaseService với schema validation built-in
- ✅ Auto validation hooks trong CRUD operations
- ✅ Improved error reporting với field-level details

### Unified APIs

- ✅ Favorites API support cả restaurant & product
- ✅ Reviews API support cả restaurant & product
- ✅ Consistent API patterns across modules

### Improved Documentation

- ✅ Complete schema documentation
- ✅ Enhanced API endpoint docs
- ✅ Architecture guide updates
- ✅ Import/export workflow guide

---

## 📞 Support & Resources

- **Documentation**: See `/docs` folder
- **API Health**: `GET /api/health`
- **API Explorer**: `GET /api`
- **Endpoints Reference**: `GET /api/endpoints`
- **Schema Reference**: `GET /api/:entity/schema`

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 🙏 Acknowledgments

- Inspired by [JSON Server](https://github.com/typicode/json-server)
- Built with [Express.js](https://expressjs.com/)
- Authentication with [JWT](https://jwt.io/)
- GPS calculations using Haversine formula
- Validation inspired by JSON Schema standards

---

**Made with ❤️ for FunFood App** | Version 2.2.0 | Last Updated: November 2024
