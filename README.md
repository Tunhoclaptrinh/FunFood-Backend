# 🍔 FunFood Backend API

Backend API hoàn chỉnh cho ứng dụng đặt đồ ăn FunFood - Xây dựng với Node.js, Express, JWT Authentication.

## 📋 Mục lục

- [Tính năng](#tính-năng)
- [Cài đặt](#cài-đặt)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [API Endpoints](#api-endpoints)
- [Ví dụ sử dụng](#ví-dụ-sử-dụng)
- [Tích hợp Android](#tích-hợp-android)

## ✨ Tính năng

### 🔐 Authentication & Authorization

- ✅ Đăng ký tài khoản
- ✅ Đăng nhập với JWT token
- ✅ Đổi mật khẩu
- ✅ Protected routes với middleware
- ✅ Role-based access (customer, admin)
- ✅ Password hashing với bcrypt

### 🏪 Quản lý nhà hàng

- ✅ Danh sách nhà hàng
- ✅ Lọc theo danh mục, trạng thái mở/đóng
- ✅ Tìm kiếm nhà hàng
- ✅ Xem chi tiết & menu nhà hàng
- ✅ Đánh giá & rating tự động

### 🍕 Quản lý sản phẩm

- ✅ Danh sách món ăn
- ✅ Lọc theo nhà hàng, danh mục
- ✅ Tìm kiếm món ăn
- ✅ Quản lý giá & giảm giá

### 🛒 Giỏ hàng

- ✅ Thêm/Xóa/Cập nhật giỏ hàng
- ✅ Tính tổng tự động
- ✅ Xóa toàn bộ giỏ hàng

### 📦 Đơn hàng

- ✅ Tạo đơn hàng
- ✅ Theo dõi trạng thái đơn (pending, confirmed, preparing, delivering, delivered, cancelled)
- ✅ Lịch sử đơn hàng
- ✅ Hủy đơn hàng
- ✅ Tính toán giá tự động (subtotal, delivery fee, discount)

### ❤️ Yêu thích

- ✅ Thêm/Xóa nhà hàng yêu thích
- ✅ Danh sách yêu thích
- ✅ Kiểm tra trạng thái yêu thích

### ⭐ Đánh giá

- ✅ Đánh giá nhà hàng (1-5 sao)
- ✅ Viết nhận xét
- ✅ Cập nhật rating tự động

### 🎟️ Khuyến mãi

- ✅ Mã giảm giá
- ✅ Validate mã promotion
- ✅ Nhiều loại discount (percentage, fixed, delivery)

### 📍 Địa chỉ

- ✅ Quản lý nhiều địa chỉ
- ✅ Đặt địa chỉ mặc định
- ✅ Lưu tọa độ GPS

## 🚀 Cài đặt

### 1. Clone hoặc tạo project

```bash
mkdir funfood-backend
cd funfood-backend
npm init -y
```

### 2. Cài đặt dependencies

```bash
npm install express bcryptjs jsonwebtoken cors dotenv express-validator uuid
npm install --save-dev nodemon
```

### 3. Tạo cấu trúc thư mục

```bash
mkdir config controllers middleware routes utils database
```

### 4. Tạo file .env

```env
PORT=3000
JWT_SECRET=funfood_secret_key_2024_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
```

### 5. Tạo database/db.json

```json
{
  "users": [],
  "categories": [],
  "restaurants": [],
  "products": [],
  "orders": [],
  "cart": [],
  "favorites": [],
  "reviews": [],
  "promotions": [],
  "addresses": []
}
```

### 6. Copy code từ artifact vào các file tương ứng

- `server.js` - Main server file
- `config/database.js` - Database handler
- `middleware/auth.middleware.js` - Authentication middleware
- `utils/helpers.js` - Helper functions
- `routes/*.routes.js` - All route files
- `controllers/*.controller.js` - All controller files

### 7. Cập nhật package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 8. Chạy server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

## 📁 Cấu trúc thư mục

```
funfood-backend/
├── config/
│   └── database.js              # Database handler (JSON-based)
├── controllers/
│   ├── auth.controller.js       # Authentication logic
│   ├── user.controller.js       # User management
│   ├── category.controller.js   # Categories
│   ├── restaurant.controller.js # Restaurants
│   ├── product.controller.js    # Products/Menu
│   ├── order.controller.js      # Orders
│   ├── cart.controller.js       # Shopping cart
│   ├── favorite.controller.js   # Favorites
│   ├── review.controller.js     # Reviews & ratings
│   ├── promotion.controller.js  # Promotions
│   └── address.controller.js    # Addresses
├── middleware/
│   └── auth.middleware.js       # JWT authentication & authorization
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
│   └── helpers.js               # Helper functions
├── database/
│   └── db.json                  # JSON database
├── .env                         # Environment variables
├── package.json
└── server.js                    # Main entry point
```

## 🔌 API Endpoints

### Authentication (Public)

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| POST   | `/api/auth/register`        | Đăng ký tài khoản              |
| POST   | `/api/auth/login`           | Đăng nhập                      |
| GET    | `/api/auth/me`              | Lấy thông tin user (protected) |
| POST   | `/api/auth/logout`          | Đăng xuất (protected)          |
| PUT    | `/api/auth/change-password` | Đổi mật khẩu (protected)       |

### Categories (Public)

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| GET    | `/api/categories`     | Danh sách danh mục |
| GET    | `/api/categories/:id` | Chi tiết danh mục  |

### Restaurants (Public)

| Method | Endpoint                        | Description        |
| ------ | ------------------------------- | ------------------ |
| GET    | `/api/restaurants`              | Danh sách nhà hàng |
| GET    | `/api/restaurants/search?q=...` | Tìm kiếm nhà hàng  |
| GET    | `/api/restaurants/:id`          | Chi tiết nhà hàng  |
| GET    | `/api/restaurants/:id/products` | Menu nhà hàng      |

### Products (Public)

| Method | Endpoint                     | Description      |
| ------ | ---------------------------- | ---------------- |
| GET    | `/api/products`              | Danh sách món ăn |
| GET    | `/api/products/search?q=...` | Tìm kiếm món ăn  |
| GET    | `/api/products/:id`          | Chi tiết món ăn  |

### Cart (Protected)

| Method | Endpoint        | Description       |
| ------ | --------------- | ----------------- |
| GET    | `/api/cart`     | Lấy giỏ hàng      |
| POST   | `/api/cart`     | Thêm vào giỏ      |
| PUT    | `/api/cart/:id` | Cập nhật số lượng |
| DELETE | `/api/cart/:id` | Xóa khỏi giỏ      |
| DELETE | `/api/cart`     | Xóa toàn bộ giỏ   |

### Orders (Protected)

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| GET    | `/api/orders`            | Đơn hàng của tôi    |
| GET    | `/api/orders/:id`        | Chi tiết đơn hàng   |
| POST   | `/api/orders`            | Tạo đơn hàng        |
| PATCH  | `/api/orders/:id/status` | Cập nhật trạng thái |
| DELETE | `/api/orders/:id`        | Hủy đơn hàng        |

### Favorites (Protected)

| Method | Endpoint                             | Description         |
| ------ | ------------------------------------ | ------------------- |
| GET    | `/api/favorites`                     | Danh sách yêu thích |
| POST   | `/api/favorites/:restaurantId`       | Thêm yêu thích      |
| DELETE | `/api/favorites/:restaurantId`       | Xóa yêu thích       |
| GET    | `/api/favorites/check/:restaurantId` | Kiểm tra yêu thích  |

### Reviews (Protected)

| Method | Endpoint                                | Description           |
| ------ | --------------------------------------- | --------------------- |
| GET    | `/api/reviews/restaurant/:restaurantId` | Đánh giá của nhà hàng |
| POST   | `/api/reviews`                          | Tạo đánh giá          |
| PUT    | `/api/reviews/:id`                      | Cập nhật đánh giá     |
| DELETE | `/api/reviews/:id`                      | Xóa đánh giá          |

### Promotions (Public/Protected)

| Method | Endpoint                   | Description               |
| ------ | -------------------------- | ------------------------- |
| GET    | `/api/promotions`          | Danh sách khuyến mãi      |
| GET    | `/api/promotions/active`   | Khuyến mãi đang hoạt động |
| POST   | `/api/promotions/validate` | Validate mã (protected)   |

### Addresses (Protected)

| Method | Endpoint                     | Description          |
| ------ | ---------------------------- | -------------------- |
| GET    | `/api/addresses`             | Danh sách địa chỉ    |
| POST   | `/api/addresses`             | Thêm địa chỉ         |
| PUT    | `/api/addresses/:id`         | Cập nhật địa chỉ     |
| DELETE | `/api/addresses/:id`         | Xóa địa chỉ          |
| PATCH  | `/api/addresses/:id/default` | Đặt địa chỉ mặc định |

## 📝 Ví dụ sử dụng

### 1. Đăng ký

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

Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Nguyễn Văn A",
      "phone": "0912345678",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456"
  }'
```
