# 🍔 FunFood Backend API v2.0

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-9.0-orange.svg)](https://jwt.io/)

<!-- [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) -->

Backend API hoàn chỉnh cho ứng dụng đặt đồ ăn FunFood. Được xây dựng với Node.js, Express, JWT Authentication và tích hợp đầy đủ tính năng JSON-Server style queries với GPS tracking.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ](#-công-nghệ)
- [Cài đặt nhanh](#-cài-đặt-nhanh)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Endpoints](#-api-endpoints)
- [Tính năng JSON-Server](#-tính-năng-json-server)
- [GPS & Location Features](#-gps--location-features)
- [Authentication](#-authentication)
- [Testing](#-testing)
- [Deployment](#-deployment)

## ✨ Tính năng

### 🎯 Core Features

#### 🔐 Authentication & Authorization

- Đăng ký, đăng nhập với JWT
- Role-based access control (customer, admin)
- Password hashing với bcrypt
- Change password
- Protected routes với middleware
- Token expiration: 30 days

#### 🏪 Quản lý nhà hàng

- CRUD nhà hàng với phân quyền
- Lọc theo category, status, rating
- Tìm kiếm full-text
- **GPS coordinates** (latitude, longitude)
- **Nearby search** - Tìm nhà hàng gần nhất
- Open/Close time tracking
- Tự động cập nhật rating từ reviews
- Phone contact information

#### 🍕 Quản lý sản phẩm

- CRUD sản phẩm với images
- Lọc theo restaurant, category, price range
- Discount management (%)
- Available/Unavailable status
- Full-text search
- Relationship với restaurant & category

#### 🛒 Giỏ hàng

- Add/Remove/Update items
- Tính tổng tự động
- **Sync cart** từ client
- Clear by restaurant
- Group items by restaurant
- Real-time total calculation

#### 📦 Đơn hàng

- Tạo đơn với validation đầy đủ
- 6 trạng thái: pending → confirmed → preparing → delivering → delivered / cancelled
- **GPS tracking** (delivery location)
- **Distance calculation** tự động
- **Dynamic delivery fee** theo khoảng cách
- Tự động áp dụng promotion
- Payment methods: cash, card, momo, zalopay
- Order history với pagination
- Cancel order (chỉ pending/confirmed)

#### ❤️ Yêu thích

- Add/Remove favorites
- **Toggle favorite** (add hoặc remove)
- Check favorite status
- Get favorite IDs only (lightweight)
- List với restaurant details

#### ⭐ Đánh giá

- Rating 1-5 sao
- Comment/Review text
- Link với order (optional)
- Tự động update restaurant rating
- Chống duplicate review
- Edit/Delete own reviews

#### 🎟️ Khuyến mãi

- 3 loại discount:
  - **Percentage**: % giảm với max discount
  - **Fixed**: Số tiền cố định
  - **Delivery**: Free ship
- Code validation với rules
- Date range validity
- Usage limits (total & per user)
- Min order value requirement
- Active/Inactive toggle

#### 📍 Địa chỉ giao hàng

- Quản lý nhiều địa chỉ
- **GPS coordinates** (latitude, longitude)
- Set default address
- Label (Nhà, Công ty, etc.)
- Recipient info (name, phone)
- Delivery notes
- Clear non-default addresses

#### 🔔 Thông báo (NEW!)

- Order status updates
- Promotion announcements
- Favorite restaurant updates
- Read/Unread status
- Mark as read
- Clear all notifications
- Push notification ready

### 🚀 JSON-Server Style Features

#### 📄 Pagination

- `?_page=1&_limit=10`
- Response headers: X-Total-Count, X-Total-Pages, Link
- Navigation: first, prev, next, last
- Default: page=1, limit=10
- Max limit: 100

#### 🔤 Sorting

- `?_sort=rating&_order=desc`
- Multiple fields: `?_sort=price,name`
- Order: asc (default) / desc

#### 🔍 Full-text Search

- `?q=pizza`
- Search across all string fields
- Case-insensitive
- Partial match

#### 🎯 Advanced Filtering

- Exact match: `?categoryId=1`
- Greater/Equal: `?price_gte=50000`
- Less/Equal: `?price_lte=100000`
- Not equal: `?discount_ne=0`
- Like: `?name_like=pizza`
- In list: `?status_in=pending,confirmed`

#### 🔗 Relationships

- **Embed**: `?_embed=products` (nhúng dữ liệu con)
- **Expand**: `?_expand=restaurant` (mở rộng foreign key)
- Multiple: `?_embed=products,reviews&_expand=category`

### 🗺️ GPS & Location Features (NEW!)

#### 📍 Restaurant GPS

- Latitude & Longitude coordinates
- **Nearby search** endpoint
- Distance calculation (Haversine formula)
- Radius filter (km)
- Sort by distance

#### 🚚 Delivery GPS

- Save delivery location coordinates
- **Calculate distance** restaurant → customer
- **Dynamic delivery fee** based on distance
- Estimated delivery time
- Route tracking ready

#### 💰 Smart Delivery Fee

```javascript
Distance ≤ 2km:  15,000đ (base fee)
2km < d ≤ 5km:   15,000đ + (d-2) × 5,000đ/km
Distance > 5km:  30,000đ + (d-5) × 7,000đ/km
```

## 🛠 Công nghệ

- **Runtime**: Node.js 18.x
- **Framework**: Express 4.18
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Password**: bcryptjs 2.4
- **Validation**: express-validator 7.0
- **Database**: JSON file-based (development)
- **CORS**: Enabled with exposed headers
- **Environment**: dotenv

## 🚀 Cài đặt nhanh

### Prerequisites

- Node.js 18.x hoặc cao hơn
- npm hoặc yarn

### Installation

```bash
# 1. Clone hoặc tạo project
git clone <your-repo>
cd funfood-backend

# 2. Install dependencies
npm install

# 3. Tạo file .env
cat > .env << EOF
PORT=3000
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=30d
NODE_ENV=development
EOF

# 4. Seed database (tạo dữ liệu mẫu)
npm run seed

# 5. Start server
npm run dev
```

**Server chạy tại:** http://localhost:3000

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

## 📁 Cấu trúc dự án

```
funfood-backend/
├── config/
│   └── database.js              # Enhanced database với JSON-Server features
├── controllers/
│   ├── auth.controller.js       # Authentication & JWT
│   ├── user.controller.js       # User management + activity stats
│   ├── category.controller.js   # Categories CRUD
│   ├── restaurant.controller.js # Restaurants + GPS + nearby search
│   ├── product.controller.js    # Products + advanced filtering
│   ├── order.controller.js      # Orders + GPS tracking
│   ├── cart.controller.js       # Cart + sync functionality
│   ├── favorite.controller.js   # Favorites + toggle
│   ├── review.controller.js     # Reviews + auto rating update
│   ├── promotion.controller.js  # Promotions + validation
│   ├── address.controller.js    # Addresses + GPS
│   └── notification.controller.js # Notifications (NEW!)
├── middleware/
│   ├── auth.middleware.js       # JWT auth + role authorization
│   └── query.middleware.js      # Query parser + response formatter
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── category.routes.js
│   ├── restaurant.routes.js
│   ├── product.routes.js
│   ├── order.routes.js
│   ├── cart.routes.js
│   ├── favorite.routes.js
│   ├── review.routes.js
│   ├── promotion.routes.js
│   ├── address.routes.js
│   └── notification.routes.js    # NEW!
├── utils/
│   ├── helpers.js               # JWT, bcrypt, distance calculation
│   └── seedData.js              # Database seeding script
├── database/
│   └── db.json                  # JSON database (auto-generated)
├── .env                         # Environment variables
├── package.json
├── server.js                    # Entry point
├── README.md
├── API_ENDPOINTS.md
└── MIGRATION.md
```

## 🔌 API Endpoints

### Base URL

```
http://localhost:3000/api
```

### 📊 Summary

| Module        | Public | Protected | Admin Only | Total  |
| ------------- | ------ | --------- | ---------- | ------ |
| Auth          | 2      | 3         | 0          | 5      |
| Users         | 0      | 3         | 6          | 9      |
| Categories    | 2      | 0         | 3          | 5      |
| Restaurants   | 5      | 0         | 3          | 8      |
| Products      | 3      | 0         | 3          | 6      |
| Cart          | 0      | 7         | 0          | 7      |
| Orders        | 0      | 5         | 1          | 6      |
| Favorites     | 0      | 7         | 0          | 7      |
| Reviews       | 1      | 4         | 1          | 6      |
| Promotions    | 3      | 1         | 4          | 8      |
| Addresses     | 0      | 8         | 0          | 8      |
| Notifications | 0      | 5         | 0          | 5      |
| **TOTAL**     | **16** | **43**    | **21**     | **80** |

### Quick Reference

#### Authentication (`/api/auth`)

```bash
POST   /register           # Đăng ký
POST   /login              # Đăng nhập
GET    /me                 # Get profile [Protected]
POST   /logout             # Đăng xuất [Protected]
PUT    /change-password    # Đổi mật khẩu [Protected]
```

#### Restaurants (`/api/restaurants`)

```bash
GET    /                   # List + filters + pagination
GET    /nearby             # Tìm gần (GPS) [NEW!]
GET    /search?q=...       # Search
GET    /:id                # Details
GET    /:id/products       # Menu
POST   /                   # Create [Admin]
PUT    /:id                # Update [Admin]
DELETE /:id                # Delete [Admin]
```

#### Orders (`/api/orders`)

```bash
GET    /                   # My orders [Protected]
GET    /all                # All orders [Admin]
GET    /:id                # Order details [Protected]
POST   /                   # Create [Protected]
PATCH  /:id/status         # Update status [Protected]
DELETE /:id                # Cancel [Protected]
```

#### Notifications (`/api/notifications`) [NEW!]

```bash
GET    /                   # List [Protected]
PATCH  /:id/read           # Mark as read [Protected]
PATCH  /read-all           # Mark all read [Protected]
DELETE /:id                # Delete one [Protected]
DELETE /                   # Clear all [Protected]
```

**📖 Full documentation:** [API_ENDPOINTS.md](API_ENDPOINTS.md)

## 🎨 Tính năng JSON-Server

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

### 3. Distance Calculation

```javascript
// Haversine Formula
Distance = √[(Δlat)² + (Δlon)²] × Earth_Radius

// Example:
Restaurant: (10.7756, 106.7019)
Customer:   (10.7769, 106.7009)
→ Distance: ~0.14 km
→ Delivery Fee: 15,000đ (base fee)
```

## 🔐 Authentication

### Flow

```bash
# 1. Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "123456",
  "name": "John Doe",
  "phone": "0912345678"
}
→ Response: { token: "..." }

# 2. Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "123456"
}
→ Response: { token: "..." }

# 3. Use Token
GET /api/orders
Authorization: Bearer eyJhbGc...

# 4. Change Password
PUT /api/auth/change-password
Authorization: Bearer eyJhbGc...
{
  "currentPassword": "123456",
  "newPassword": "newpass"
}
```

### Test Accounts (after seed)

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

## 🧪 Testing

### Automated Test Flow

```bash
#!/bin/bash
# test.sh

BASE_URL="http://localhost:3000/api"

echo "1. Health Check"
curl $BASE_URL/health

echo "\n2. Login"
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@funfood.com","password":"123456"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"

echo "\n3. Get Restaurants (paginated)"
curl "$BASE_URL/restaurants?_page=1&_limit=5"

echo "\n4. Nearby Restaurants"
curl "$BASE_URL/restaurants/nearby?latitude=10.7756&longitude=106.7019&radius=3"

echo "\n5. Add to Cart"
curl -X POST $BASE_URL/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'

echo "\n6. Get Cart"
curl $BASE_URL/cart \
  -H "Authorization: Bearer $TOKEN"

echo "\n7. Create Order"
curl -X POST $BASE_URL/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId":1,
    "items":[{"productId":1,"quantity":2}],
    "deliveryAddress":"123 Test St",
    "deliveryLatitude":10.7769,
    "deliveryLongitude":106.7009,
    "paymentMethod":"cash"
  }'

echo "\n8. Get My Orders"
curl "$BASE_URL/orders?_page=1&_limit=10" \
  -H "Authorization: Bearer $TOKEN"

echo "\nDone!"
```

### Manual Testing

```bash
# Test pagination headers
curl -i "http://localhost:3000/api/restaurants?_page=1&_limit=5"

# Check X-Total-Count header
# Check Link header for navigation

# Test filtering
curl "http://localhost:3000/api/products?price_gte=50000&price_lte=100000&available=true"

# Test sorting
curl "http://localhost:3000/api/restaurants?_sort=rating&_order=desc"

# Test full-text search
curl "http://localhost:3000/api/products?q=pizza"

# Test relationships
curl "http://localhost:3000/api/restaurants/1?_embed=products,reviews"
```

## 📦 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use real database (MongoDB/PostgreSQL)
- [ ] Enable HTTPS
- [ ] Setup rate limiting
- [ ] Add logging (Winston/Morgan)
- [ ] Setup monitoring (PM2/New Relic)
- [ ] Configure CORS properly
- [ ] Add compression middleware
- [ ] Setup backup strategy
- [ ] Use environment variables
- [ ] Setup CI/CD pipeline

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create funfood-api

# Set environment
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set NODE_ENV=production
heroku config:set JWT_EXPIRE=30d

# Deploy
git push heroku main

# Open
heroku open
```

### Deploy to VPS (Ubuntu)

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone project
git clone <your-repo>
cd funfood-backend

# 3. Install dependencies
npm install --production

# 4. Setup PM2
sudo npm install -g pm2
pm2 start server.js --name funfood-api
pm2 startup
pm2 save

# 5. Nginx reverse proxy
sudo nano /etc/nginx/sites-available/funfood-api

# Paste:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/funfood-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 6. SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📚 Documentation

- **[API_ENDPOINTS.md](API_ENDPOINTS.md)** - Complete API reference với tất cả 80 endpoints
- **[MIGRATION.md](MIGRATION.md)** - Migration guide từ v1.0 → v2.0
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

<!-- ## 📄 License

This project is licensed under the MIT License. -->

<!-- ## 👥 Support

- **Email**: support@funfood.com
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Docs**: [Full Documentation](https://docs.funfood.com) -->

## 🙏 Acknowledgments

- Inspired by [JSON Server](https://github.com/typicode/json-server)
- Built with [Express.js](https://expressjs.com/)
- Authentication with [JWT](https://jwt.io/)
- GPS calculations using Haversine formula

---

**Made with ❤️ for FunFood App** | Version 2.0.0 | Last Updated: October 2024
