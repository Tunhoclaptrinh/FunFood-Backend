# 🚀 FunFood Backend - Quick Start Guide

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: 18.x hoặc cao hơn
- **npm**: 9.x hoặc cao hơn
- **Git**: Để clone repo
- **Postman** (Optional): Để test API

---

## ⚡ Bước 1: Cài Đặt & Setup (2 phút)

### 1.1 Clone hoặc Tải Project

```bash
# Clone từ GitHub
git clone <your-repo-url>
cd funfood-backend

# Hoặc extract ZIP file
cd funfood-backend
```

### 1.2 Cài Đặt Dependencies

```bash
npm install
```

### 1.3 Tạo File `.env`

```bash
# Copy template
cp .env.develop .env

# Hoặc tạo thủ công
cat > .env << EOF
PORT=3000
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=30d
NODE_ENV=development
EOF
```

### 1.4 Seed Database (Tạo Dữ Liệu Mẫu)

```bash
npm run seed
```

**Output:**

```
✅ Database seeded successfully!

📊 Seeded data:
   - Users: 7
   - Restaurants: 11
   - Products: 30
   - Orders: 7
   - ...

🔑 Test accounts (Password: 123456):
   Admin: admin@funfood.com
   User 1: user@funfood.com
   User 2: customer@funfood.com
```

---

## 🏃 Bước 2: Chạy Server (30 giây)

### Development Mode (Tự Reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

**Xem Server Đã Chạy:**

```
✅ Server Started
📍 URL: http://localhost:3000
🌍 Environment: development
📊 API Docs: http://localhost:3000/api
❤️  Health: http://localhost:3000/api/health
```

---

## 🔐 Bước 3: Test API (5 phút)

### 3.1 Health Check

```bash
curl http://localhost:3000/api/health
```

**Response:**

```json
{
  "status": "OK",
  "message": "FunFood API is running",
  "version": "2.0.0",
  "timestamp": "2024-10-26T10:00:00.000Z"
}
```

### 3.2 Đăng Nhập (Lấy Token)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@funfood.com",
    "password": "123456"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "name": "Nguyễn Văn A",
      "email": "user@funfood.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3.3 Lấy Danh Sách Restaurants

```bash
curl "http://localhost:3000/api/restaurants?_page=1&_limit=5"
```

### 3.4 Tìm Restaurants Gần (GPS)

```bash
curl "http://localhost:3000/api/restaurants/nearby?latitude=10.7756&longitude=106.7019&radius=5"
```

### 3.5 Xem Profile (Với Token)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Bước 4: Sử Dụng Postman (Optional)

### 4.1 Import Collection

1. Mở Postman
2. File → Import → Chọn file `funfood-api.postman_collection.json`
3. Click "Import"

### 4.2 Setup Environment Variables

1. Settings → Manage Environments
2. Tạo Environment mới: `FunFood Development`
3. Thêm Variables:
   ```
   base_url = http://localhost:3000/api
   token = [Your JWT Token]
   ```

### 4.3 Test Endpoints

- Authentication → Login
- Restaurants → Get All
- Orders → Create New
- Payments → Create Payment

---

## 🗂️ Cấu Trúc Project

```
funfood-backend/
├── config/
│   ├── database.js           # Enhanced JSON database
│   ├── endpoints.js          # API endpoints reference
│   └── database.js.backup    # Backup
├── controllers/              # Request handlers
├── middleware/               # Auth, validation, query parsing
├── routes/                   # API routes
├── services/                 # Business logic
├── utils/                    # Helpers
│   ├── BaseService.js        # Generic CRUD service
│   ├── BaseController.js     # Generic CRUD controller
│   └── helpers.js            # Utilities
├── database/
│   └── db.json               # SQLite alternative (JSON file)
├── .env                      # Environment variables
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
├── server.js                 # Entry point
├── README.md                 # Documentation
├── API_ENDPOINTS.md          # Complete API reference
├── QUICK_START.md            # This file
└── MISSING_FEATURES.md       # TODO list
```

---

## 🔄 Workflow - Tạo Order (Complete Flow)

### Step 1: Login

```bash
POST /auth/login
→ Get token
```

### Step 2: Add Products to Cart

```bash
POST /cart
{
  "productId": 1,
  "quantity": 2
}
```

### Step 3: View Cart

```bash
GET /cart
→ See items, subtotal, delivery fee
```

### Step 4: Create Order

```bash
POST /orders
{
  "restaurantId": 1,
  "items": [
    {"productId": 1, "quantity": 2}
  ],
  "deliveryAddress": "123 Nguyen Hue, Q1, HCMC",
  "deliveryLatitude": 10.7756,
  "deliveryLongitude": 106.7019,
  "paymentMethod": "momo"
}
→ Order created with ID
```

### Step 5: Make Payment

```bash
POST /payment/1/create
{
  "paymentMethod": "momo"
}
→ Get payment URL/deeplink
```

### Step 6: Check Order Status

```bash
GET /orders/1
→ See status updates
```

### Step 7: Review Order

```bash
POST /reviews
{
  "restaurantId": 1,
  "orderId": 1,
  "rating": 5,
  "comment": "Rất ngon!"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Đặt Hàng Thành Công

```bash
# 1. Login
POST /auth/login
email: user@funfood.com
password: 123456

# 2. Add to cart
POST /cart
productId: 1, quantity: 2

# 3. Create order
POST /orders
restaurantId: 1, items: [...]

# 4. Pay with MoMo
POST /payment/1/create
paymentMethod: momo
```

### Scenario 2: Tìm Nhà Hàng Gần

```bash
GET /restaurants/nearby?latitude=10.7756&longitude=106.7019&radius=3&isOpen=true
```

### Scenario 3: Xem Danh Sách Yêu Thích

```bash
GET /favorites?_embed=restaurant
```

### Scenario 4: Filter & Search

```bash
# Sản phẩm trong khoảng giá
GET /products?price_gte=50000&price_lte=100000&available=true

# Tìm kiếm
GET /products?q=pizza

# Sắp xếp & phân trang
GET /restaurants?_sort=rating&_order=desc&_page=1&_limit=10
```

---

## 📊 Account cho Testing

### Admin Account

```
Email: admin@funfood.com
Password: 123456
Role: admin
```

### Customer Account 1

```
Email: user@funfood.com
Password: 123456
Role: customer
```

### Customer Account 2

```
Email: customer@funfood.com
Password: 123456
Role: customer
```

### Shipper Account

```
Email: shipper@funfood.com
Password: 123456
Role: shipper
```

### Manager Account

```
Email: manager.chay@funfood.com
Password: 123456
Role: manager
Restaurant: Nhà Hàng Chay An Lạc (ID: 8)
```

---

## 🐛 Common Issues & Solutions

### ❌ Error: Port 3000 Already in Use

```bash
# Kill process on port 3000
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### ❌ Error: Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: Database File Not Found

```bash
# Recreate database
npm run seed
```

### ❌ JWT Token Invalid

```bash
# Token expired? Login again to get new token
POST /auth/login
```

### ❌ Cannot Add to Cart (403)

```bash
# Not authenticated? Add Authorization header
Authorization: Bearer {token}
```

---

## 📖 Documentation Links

| Document              | Purpose                                |
| --------------------- | -------------------------------------- |
| `README.md`           | Project overview                       |
| `API_ENDPOINTS.md`    | Complete API reference (80+ endpoints) |
| `MISSING_FEATURES.md` | Features for future development        |
| `QUICK_START.md`      | This file - Getting started            |

---

## 🚀 Deploy to Production

### Heroku (Recommended for Beginners)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create funfood-api

# Set environment
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs -t
```

### VPS (Ubuntu)

```bash
# See README.md for detailed instructions
```

---

## 💡 Tips & Tricks

1. **Use Postman** for easier testing
2. **Check `/api` endpoint** for all available routes
3. **Always send `Authorization` header** for protected endpoints
4. **Use GPS coordinates** for nearby search:
   - Default: 10.7756, 106.7019 (Ho Chi Minh City)
5. **Test roles**: Different accounts have different permissions
6. **Check logs** in terminal when debugging

---

## ✅ Checklist - Siêu Nhanh (5 phút)

- [ ] `npm install`
- [ ] `npm run seed`
- [ ] `npm run dev`
- [ ] Open http://localhost:3000/api/health
- [ ] Test login: POST /auth/login
- [ ] Create order: POST /orders
- [ ] Create payment: POST /payment/{id}/create
- [ ] ✅ Ready to go!

---

## 🎓 Next Steps

1. **Explore API**: Check `API_ENDPOINTS.md`
2. **Test Workflows**: Try complete order flow
3. **Customize**: Modify seed data in `utils/seedData.js`
4. **Deploy**: Push to Heroku or VPS
5. **Connect Frontend**: Use endpoints with React/Vue app

---

## 📞 Support

- **API Docs**: `/api` endpoint
- **Health Check**: `/api/health`
- **Issues**: Check `MISSING_FEATURES.md`
- **Logs**: Check terminal output

---

**Version:** 2.0.0  
**Last Updated:** 2024-10-26  
**Status:** ✅ Production Ready MVP
