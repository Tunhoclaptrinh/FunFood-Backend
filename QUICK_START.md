# 🚀 FunFood Backend - Quick Start Guide

## Mục lục

1. [Installation](#installation)
2. [Running the Server](#running-the-server)
3. [Database Setup](#database-setup)
4. [Test Accounts](#test-accounts)
5. [API Testing](#api-testing)
6. [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites

- Node.js 18.x hoặc cao hơn
- npm hoặc yarn
- Git (optional)

### Step 1: Clone/Setup Project

```bash
# Clone project (nếu có từ GitHub)
git clone <your-repo-url>
cd funfood-backend

# Hoặc tạo thư mục mới
mkdir funfood-backend
cd funfood-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

Hoặc nếu sử dụng yarn:

```bash
yarn install
```

### Step 3: Setup Environment Variables

Tạo file `.env` trong thư mục root:

```bash
# Linux/Mac
cp .env.develop .env

# Windows
copy .env.develop .env
```

Nội dung `.env`:

```
PORT=3000
JWT_SECRET=funfood_secret_key_2024_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
```

### Step 4: Seed Database

```bash
npm run seed
```

Điều này sẽ tạo file `database/db.json` với dữ liệu test bao gồm:

- 7 users (admin, customers, manager, shipper)
- 12 categories
- 11 restaurants
- 30 products
- 7 orders
- Favorites, reviews, promotions, addresses, notifications

---

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

Hoặc sử dụng nodemon trực tiếp:

```bash
npx nodemon server.js
```

### Production Mode

```bash
npm start
```

### Expected Output

```
╔══════════════════════════════════════════════════════════════════╗
║   🚀 FunFood Server Started!                                     ║
╠══════════════════════════════════════════════════════════════════╣
║   📍 URL: http://localhost:3000                                   ║
║   🌍 Environment: development                                    ║
║   📊 API Docs: http://localhost:3000/api                          ║
║   ❤️  Health: http://localhost:3000/api/health                    ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Database Setup

### Auto Seed

```bash
npm run seed
```

### Manual Database Reset

1. Xóa file `database/db.json`
2. Chạy `npm run seed` lại
3. Server sẽ tự động tạo database mới

### Database Location

```
funfood-backend/
└── database/
    └── db.json          # Database file (tự động tạo)
```

### Backup Database

```bash
# Backup
cp database/db.json database/db.json.backup

# Restore
cp database/db.json.backup database/db.json
```

---

## Test Accounts

Sau khi seed, bạn có các tài khoản test:

### Admin

```
Email: admin@funfood.com
Password: 123456
```

### Customer 1

```
Email: user@funfood.com
Password: 123456
```

### Customer 2

```
Email: customer@funfood.com
Password: 123456
```

### Shipper

```
Email: shipper@funfood.com
Password: 123456
```

### Manager (Nhà Hàng Chay)

```
Email: manager.chay@funfood.com
Password: 123456
```

---

## API Testing

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "OK",
  "message": "FunFood API is running",
  "version": "2.0.0",
  "timestamp": "2024-10-26T10:00:00.000Z",
  "uptime": 125.432
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@funfood.com",
    "password": "123456"
  }'
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "email": "user@funfood.com",
      "name": "Nguyễn Văn A",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Restaurants (Public)

```bash
curl http://localhost:3000/api/restaurants?_page=1&_limit=10
```

### 4. Get My Profile (Protected)

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get Cart (Protected)

```bash
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Tìm process dùng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Hoặc sử dụng port khác
PORT=3001 npm run dev
```

### Database File Not Found

```bash
# Tạo thủ công
mkdir -p database
npm run seed
```

### Permission Denied

```bash
# Linux/Mac
chmod +x node_modules/.bin/nodemon

# Hoặc sử dụng npx
npx nodemon server.js
```

### JWT Token Issues

- Token hết hạn: Hãy login lại
- Token không hợp lệ: Kiểm tra JWT_SECRET trong `.env`
- Format sai: Token phải là `Bearer <token>` trong header

### Database Corruption

```bash
# Reset database
rm database/db.json
npm run seed
```

---

## Next Steps

1. **Đọc API Documentation**: [API_ENDPOINTS.md](./API_ENDPOINTS.md)
2. **Tìm hiểu các features**: [README.md](./README.md)
3. **Integration Frontend**: Sử dụng token từ `/api/auth/login`
4. **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Tips & Tricks

### Auto-format Request

```bash
# Cài jq để format JSON output
brew install jq

# Sử dụng
curl http://localhost:3000/api/restaurants | jq
```

### Save Token to Variable

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@funfood.com","password":"123456"}' | jq -r '.data.token')

echo $TOKEN
```

### Test Authenticated Requests

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Pagination Examples

```bash
# Page 1, 10 items per page
GET /api/restaurants?_page=1&_limit=10

# Page 2, 20 items per page
GET /api/restaurants?_page=2&_limit=20

# Sort by rating descending
GET /api/restaurants?_sort=rating&_order=desc

# Combined
GET /api/restaurants?_page=1&_limit=10&_sort=rating&_order=desc
```

### Advanced Search

```bash
# Search by name
GET /api/restaurants?q=phở

# Filter by category
GET /api/restaurants?categoryId=2

# Filter by rating
GET /api/restaurants?rating_gte=4.5

# Combined filters
GET /api/restaurants?categoryId=2&rating_gte=4.5&_embed=products
```

---

## Support

- **Documentation**: /docs folder
- **API Endpoints**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health
- **Issues**: Check MISSING_FEATURES.md for known issues
