# 🍔 FunFood Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Backend API hoàn chỉnh cho ứng dụng đặt đồ ăn FunFood. Được xây dựng với Node.js, Express, JWT Authentication và tích hợp đầy đủ tính năng của JSON-Server.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ](#-công-nghệ)
- [Cài đặt nhanh](#-cài-đặt-nhanh)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Endpoints](#-api-endpoints)
- [Tính năng JSON-Server](#-tính-năng-json-server)
- [Authentication](#-authentication)
- [Ví dụ sử dụng](#-ví-dụ-sử-dụng)
- [Testing](#-testing)
- [Deployment](#-deployment)

## ✨ Tính năng

### 🎯 Tính năng cốt lõi

- ✅ **Authentication & Authorization**

  - Đăng ký, đăng nhập với JWT
  - Role-based access control (customer, admin)
  - Đổi mật khẩu
  - Password hashing với bcrypt
  - Protected routes với middleware

- ✅ **Quản lý nhà hàng**

  - CRUD nhà hàng với phân quyền
  - Lọc theo category, status, rating
  - Tìm kiếm full-text (tất cả các trường - fields không kể trường cụ thể)
  - Tự động cập nhật rating từ reviews

- ✅ **Quản lý sản phẩm**

  - CRUD sản phẩm
  - Lọc theo nhà hàng, category, giá
  - Quản lý giảm giá
  - Trạng thái available/unavailable

- ✅ **Giỏ hàng**

  - Thêm/xóa/cập nhật items
  - Tính tổng tự động
  - Sync giỏ hàng từ client
  - Group theo restaurant

- ✅ **Đơn hàng**

  - Tạo đơn hàng với validation
  - Tracking status (6 trạng thái)
  - Tự động áp dụng khuyến mãi
  - Lịch sử đơn hàng có phân trang

- ✅ **Yêu thích**

  - Thêm/xóa restaurants yêu thích
  - Toggle favorite
  - Kiểm tra trạng thái favorite

- ✅ **Đánh giá**

  - Đánh giá nhà hàng (1-5 sao)
  - Tự động cập nhật rating
  - Chống duplicate review

- ✅ **Khuyến mãi**

  - Nhiều loại discount (%, fixed, delivery)
  - Validate mã promotion
  - Giới hạn sử dụng

- ✅ **Địa chỉ giao hàng**
  - Quản lý nhiều địa chỉ
  - Đặt địa chỉ mặc định
  - Lưu tọa độ GPS

### 🚀 Tính năng JSON-Server Style

- ✅ **Pagination** - `?_page=1&_limit=10`
- ✅ **Sorting** - `?_sort=rating&_order=desc`
- ✅ **Full-text Search** - `?q=pizza`
- ✅ **Filtering** - `?categoryId=1&isOpen=true`
- ✅ **Operators** - `?price_gte=50000&price_lte=100000`
- ✅ **Like Search** - `?name_like=phở`
- ✅ **In Operator** - `?status_in=pending,confirmed`
- ✅ **Relationships** - `?_embed=products&_expand=category`
- ✅ **Response Headers** - X-Total-Count, Link, X-Total-Pages

## 🛠 Công nghệ

- **Runtime**: Node.js 18.x
- **Framework**: Express 4.18
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Database**: JSON file-based (development)
- **CORS**: Enabled
- **Environment**: dotenv

## 🚀 Cài đặt nhanh

### 1. Clone hoặc tạo project

```bash
mkdir funfood-backend
cd funfood-backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Tạo file .env

```bash
PORT=3000
JWT_SECRET=funfood_secret_key_2024_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
```

### 4. Seed database với dữ liệu mẫu

```bash
npm run seed
```

### 5. Chạy server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: **http://localhost:3000**

### 6. Test API

```bash
# Health check
curl http://localhost:3000/api/health

# API documentation
curl http://localhost:3000/api
```

## 📁 Cấu trúc dự án

```
funfood-backend/
├── config/
│   └── database.js              # Database handler với JSON-Server features
├── controllers/
│   ├── auth.controller.js       # Authentication logic
│   ├── user.controller.js       # User management + stats
│   ├── category.controller.js   # Categories CRUD
│   ├── restaurant.controller.js # Restaurants + advanced queries
│   ├── product.controller.js    # Products + filtering
│   ├── order.controller.js      # Orders + tracking
│   ├── cart.controller.js       # Cart + sync
│   ├── favorite.controller.js   # Favorites + toggle
│   ├── review.controller.js     # Reviews + rating update
│   ├── promotion.controller.js  # Promotions + validation
│   └── address.controller.js    # Addresses + default
├── middleware/
│   ├── auth.middleware.js       # JWT authentication & authorization
│   └── query.middleware.js      # Query parser & response formatter
├── routes/
│   ├── auth.routes.js           # Auth endpoints
│   ├── user.routes.js           # User endpoints
│   ├── category.routes.js       # Category endpoints
│   ├── restaurant.routes.js     # Restaurant endpoints
│   ├── product.routes.js        # Product endpoints
│   ├── order.routes.js          # Order endpoints
│   ├── cart.routes.js           # Cart endpoints
│   ├── favorite.routes.js       # Favorite endpoints
│   ├── review.routes.js         # Review endpoints
│   ├── promotion.routes.js      # Promotion endpoints
│   └── address.routes.js        # Address endpoints
├── utils/
│   ├── helpers.js               # Helper functions (JWT, bcrypt, etc.)
│   └── seedData.js              # Seed script for sample data
├── database/
│   └── db.json                  # JSON database (auto-generated)
├── .env                         # Environment variables
├── package.json                 # Dependencies & scripts
├── server.js                    # Main entry point
└── README.md                    # This file
```

## 🔌 API Endpoints

### Base URL

```
http://localhost:3000/api
```

### 1. Authentication (`/api/auth`)

| Method | Endpoint           | Description             | Auth      |
| ------ | ------------------ | ----------------------- | --------- |
| POST   | `/register`        | Đăng ký tài khoản       | Public    |
| POST   | `/login`           | Đăng nhập               | Public    |
| GET    | `/me`              | Thông tin user hiện tại | Protected |
| POST   | `/logout`          | Đăng xuất               | Protected |
| PUT    | `/change-password` | Đổi mật khẩu            | Protected |

### 2. Users (`/api/users`)

| Method | Endpoint         | Description        | Auth        |
| ------ | ---------------- | ------------------ | ----------- |
| GET    | `/`              | Danh sách users    | Admin       |
| GET    | `/:id`           | Chi tiết user      | Owner/Admin |
| GET    | `/:id/activity`  | Hoạt động của user | Owner/Admin |
| GET    | `/stats/summary` | Thống kê users     | Admin       |
| PUT    | `/profile`       | Cập nhật profile   | Protected   |
| PUT    | `/:id`           | Cập nhật user      | Admin       |
| PATCH  | `/:id/status`    | Bật/tắt user       | Admin       |
| DELETE | `/:id`           | Xóa user (soft)    | Admin       |
| DELETE | `/:id/permanent` | Xóa vĩnh viễn      | Admin       |

### 3. Categories (`/api/categories`)

| Method | Endpoint | Description          | Auth   |
| ------ | -------- | -------------------- | ------ |
| GET    | `/`      | Danh sách categories | Public |
| GET    | `/:id`   | Chi tiết category    | Public |
| POST   | `/`      | Tạo category         | Admin  |
| PUT    | `/:id`   | Cập nhật category    | Admin  |
| DELETE | `/:id`   | Xóa category         | Admin  |

### 4. Restaurants (`/api/restaurants`)

| Method | Endpoint        | Description           | Auth   |
| ------ | --------------- | --------------------- | ------ |
| GET    | `/`             | Danh sách restaurants | Public |
| GET    | `/search?q=...` | Tìm kiếm              | Public |
| GET    | `/:id`          | Chi tiết restaurant   | Public |
| GET    | `/:id/products` | Menu của restaurant   | Public |
| POST   | `/`             | Tạo restaurant        | Admin  |
| PUT    | `/:id`          | Cập nhật restaurant   | Admin  |
| DELETE | `/:id`          | Xóa restaurant        | Admin  |

### 5. Products (`/api/products`)

| Method | Endpoint        | Description        | Auth   |
| ------ | --------------- | ------------------ | ------ |
| GET    | `/`             | Danh sách products | Public |
| GET    | `/search?q=...` | Tìm kiếm           | Public |
| GET    | `/:id`          | Chi tiết product   | Public |
| POST   | `/`             | Tạo product        | Admin  |
| PUT    | `/:id`          | Cập nhật product   | Admin  |
| DELETE | `/:id`          | Xóa product        | Admin  |

### 6. Cart (`/api/cart`)

| Method | Endpoint          | Description              | Auth      |
| ------ | ----------------- | ------------------------ | --------- |
| GET    | `/`               | Lấy giỏ hàng             | Protected |
| POST   | `/`               | Thêm vào giỏ             | Protected |
| POST   | `/sync`           | Đồng bộ giỏ              | Protected |
| PUT    | `/:id`            | Cập nhật số lượng        | Protected |
| DELETE | `/:id`            | Xóa item                 | Protected |
| DELETE | `/restaurant/:id` | Xóa items của restaurant | Protected |
| DELETE | `/`               | Xóa toàn bộ giỏ          | Protected |

### 7. Orders (`/api/orders`)

| Method | Endpoint      | Description         | Auth        |
| ------ | ------------- | ------------------- | ----------- |
| GET    | `/`           | Đơn hàng của tôi    | Protected   |
| GET    | `/all`        | Tất cả đơn hàng     | Admin       |
| GET    | `/:id`        | Chi tiết đơn hàng   | Owner/Admin |
| POST   | `/`           | Tạo đơn hàng        | Protected   |
| PATCH  | `/:id/status` | Cập nhật trạng thái | Owner/Admin |
| DELETE | `/:id`        | Hủy đơn hàng        | Owner/Admin |

### 8. Favorites (`/api/favorites`)

| Method | Endpoint                | Description         | Auth      |
| ------ | ----------------------- | ------------------- | --------- |
| GET    | `/`                     | Danh sách yêu thích | Protected |
| GET    | `/restaurants`          | Danh sách IDs       | Protected |
| GET    | `/check/:restaurantId`  | Kiểm tra favorite   | Protected |
| POST   | `/:restaurantId`        | Thêm favorite       | Protected |
| POST   | `/toggle/:restaurantId` | Toggle favorite     | Protected |
| DELETE | `/:restaurantId`        | Xóa favorite        | Protected |
| DELETE | `/`                     | Xóa tất cả          | Protected |

### 9. Reviews (`/api/reviews`)

| Method | Endpoint                    | Description            | Auth        |
| ------ | --------------------------- | ---------------------- | ----------- |
| GET    | `/restaurant/:restaurantId` | Reviews của restaurant | Public      |
| GET    | `/`                         | Tất cả reviews         | Admin       |
| GET    | `/user/me`                  | Reviews của tôi        | Protected   |
| POST   | `/`                         | Tạo review             | Protected   |
| PUT    | `/:id`                      | Cập nhật review        | Owner       |
| DELETE | `/:id`                      | Xóa review             | Owner/Admin |

### 10. Promotions (`/api/promotions`)

| Method | Endpoint      | Description            | Auth      |
| ------ | ------------- | ---------------------- | --------- |
| GET    | `/`           | Danh sách promotions   | Public    |
| GET    | `/active`     | Promotions đang active | Public    |
| GET    | `/code/:code` | Lấy theo code          | Public    |
| POST   | `/validate`   | Validate mã            | Protected |
| POST   | `/`           | Tạo promotion          | Admin     |
| PUT    | `/:id`        | Cập nhật promotion     | Admin     |
| PATCH  | `/:id/toggle` | Bật/tắt promotion      | Admin     |
| DELETE | `/:id`        | Xóa promotion          | Admin     |

### 11. Addresses (`/api/addresses`)

| Method | Endpoint       | Description         | Auth      |
| ------ | -------------- | ------------------- | --------- |
| GET    | `/`            | Danh sách addresses | Protected |
| GET    | `/default`     | Địa chỉ mặc định    | Protected |
| GET    | `/:id`         | Chi tiết address    | Protected |
| POST   | `/`            | Tạo address         | Protected |
| PUT    | `/:id`         | Cập nhật address    | Protected |
| PATCH  | `/:id/default` | Đặt mặc định        | Protected |
| DELETE | `/:id`         | Xóa address         | Protected |
| DELETE | `/`            | Xóa non-default     | Protected |

## 🎨 Tính năng JSON-Server

### Pagination

```bash
# Trang 1, 10 items
GET /api/restaurants?_page=1&_limit=10

# Response headers:
X-Total-Count: 50
X-Total-Pages: 5
X-Current-Page: 1
X-Per-Page: 10
Link: <...>; rel="first", <...>; rel="next", <...>; rel="last"
```

### Sorting

```bash
# Sắp xếp theo rating giảm dần
GET /api/restaurants?_sort=rating&_order=desc

# Sắp xếp nhiều trường
GET /api/products?_sort=price,name&_order=asc
```

### Full-text Search

```bash
# Tìm trong tất cả fields
GET /api/restaurants?q=pizza

# Kết hợp với pagination
GET /api/products?q=cơm&_page=1&_limit=20
```

### Filtering

```bash
# Exact match
GET /api/restaurants?categoryId=1&isOpen=true

# Operators
GET /api/products?price_gte=50000&price_lte=100000
GET /api/products?discount_ne=0
GET /api/restaurants?rating_gte=4.5

# Like search
GET /api/products?name_like=pizza

# In operator
GET /api/orders?status_in=pending,confirmed
```

### Relationships

```bash
# Embed (nhúng dữ liệu con)
GET /api/restaurants/1?_embed=products,reviews

# Expand (mở rộng foreign key)
GET /api/products/1?_expand=restaurant,category
```

### Kết hợp

```bash
# Tìm pizza, giá 100k-200k, sắp xếp, phân trang
GET /api/products?q=pizza&price_gte=100000&price_lte=200000&_sort=price&_order=asc&_page=1&_limit=10
```

## 🔐 Authentication

### Đăng ký

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456",
    "name": "Nguyễn Văn A",
    "phone": "0912345678"
  }'
```

### Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Sử dụng Token

```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 💡 Ví dụ sử dụng

### 1. Lấy top restaurants theo rating

```bash
curl "http://localhost:3000/api/restaurants?_sort=rating&_order=desc&_limit=5&_embed=products"
```

### 2. Tìm món ăn giá rẻ

```bash
curl "http://localhost:3000/api/products?price_lte=50000&available=true&_sort=price&_order=asc"
```

### 3. Tạo đơn hàng

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "restaurantId": 1,
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ],
    "deliveryAddress": "123 Test Street",
    "paymentMethod": "cash",
    "promotionCode": "FUNFOOD10"
  }'
```

### 4. Xem đơn hàng đã hoàn thành

```bash
curl "http://localhost:3000/api/orders?status=delivered&_sort=createdAt&_order=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🧪 Testing

### Test accounts (sau khi seed)

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
```

### Test flow

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@funfood.com","password":"123456"}' \
  | jq -r '.data.token')

# 2. Get restaurants
curl "http://localhost:3000/api/restaurants?_page=1&_limit=5"

# 3. Add to cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"productId":1,"quantity":2}'

# 4. View cart
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer $TOKEN"

# 5. Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "restaurantId":1,
    "items":[{"productId":1,"quantity":2}],
    "deliveryAddress":"123 Test St",
    "paymentMethod":"cash"
  }'
```

## 📦 Deployment

### Production checklist

- [ ] Đổi `JWT_SECRET` trong `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Chuyển sang database thực (MongoDB, PostgreSQL)
- [ ] Enable HTTPS
- [ ] Setup rate limiting
- [ ] Add logging (Winston, Morgan)
- [ ] Setup monitoring
- [ ] Configure CORS properly
- [ ] Add compression middleware
- [ ] Setup backup strategy

### Deploy lên Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create funfood-api

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open
heroku open
```

### Deploy lên VPS

```bash
# Clone project
git clone your-repo
cd funfood-backend

# Install dependencies
npm install --production

# Setup PM2
npm install -g pm2
pm2 start server.js --name funfood-api

# Setup Nginx reverse proxy
# ... (configure Nginx)

# Setup SSL with Let's Encrypt
# ... (configure SSL)
```

## 📚 Tài liệu bổ sung

- [API_ENDPOINTS.md](API_ENDPOINTS.md) - Chi tiết tất cả endpoints
- [MIGRATION.md](MIGRATION.md) - Hướng dẫn nâng cấp từ version cũ
- [QUICK_START.md](QUICK_START.md) - Hướng dẫn bắt đầu nhanh

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Inspired by [JSON Server](https://github.com/typicode/json-server)
- Built with [Express.js](https://expressjs.com/)
- Authentication with [JWT](https://jwt.io/)

---

Made with ❤️ for FunFood App
