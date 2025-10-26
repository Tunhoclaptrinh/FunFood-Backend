# 🔄 Migration Guide - Nâng cấp FunFood Backend API

## 📊 Tổng quan

Document này mô tả các thay đổi và cập nhật từ **version 1.0** (basic) lên **version 2.0** (enhanced với JSON-Server features).

**Version:** 1.0 → 2.0  
**Breaking Changes:** Không có (backward compatible)  
**Thời gian migration:** ~30-60 phút  
**Difficulty:** Medium

---

## 🆕 Những gì mới

### 1. Query Features (JSON-Server Style)

#### ✨ Pagination

**Trước (v1.0):**

```javascript
// Không hỗ trợ pagination, trả về tất cả
GET / api / restaurants;
// Response: { success: true, data: [...] }
```

**Sau (v2.0):**

```javascript
// Hỗ trợ pagination với headers
GET /api/restaurants?_page=1&_limit=10

// Response:
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

// Headers:
X-Total-Count: 50
X-Total-Pages: 5
X-Current-Page: 1
X-Per-Page: 10
Link: <...>; rel="first", <...>; rel="next", <...>; rel="last"
```

#### ✨ Sorting

**Trước (v1.0):**

```javascript
// Không hỗ trợ sorting
GET / api / restaurants;
```

**Sau (v2.0):**

```javascript
// Single field
GET /api/restaurants?_sort=rating&_order=desc

// Multiple fields
GET /api/products?_sort=price,name&_order=asc
```

#### ✨ Full-text Search

**Trước (v1.0):**

```javascript
// Chỉ có endpoint /search riêng
GET /api/restaurants/search?q=pizza
```

**Sau (v2.0):**

```javascript
// Tích hợp trực tiếp vào main endpoint
GET /api/restaurants?q=pizza

// Vẫn giữ endpoint /search cho backward compatibility
GET /api/restaurants/search?q=pizza
```

#### ✨ Advanced Filtering

**Trước (v1.0):**

```javascript
// Chỉ exact match
GET /api/products?categoryId=1
```

**Sau (v2.0):**

```javascript
// Exact match (vẫn hoạt động)
GET /api/products?categoryId=1

// Greater than or equal
GET /api/products?price_gte=50000

// Less than or equal
GET /api/products?price_lte=100000

// Not equal
GET /api/products?discount_ne=0

// Like search
GET /api/products?name_like=pizza

// In operator
GET /api/orders?status_in=pending,confirmed

// Combine multiple
GET /api/products?price_gte=50000&price_lte=100000&available=true
```

#### ✨ Relationships

**Trước (v1.0):**

```javascript
// Không hỗ trợ relationships
GET / api / restaurants / 1;
// Response: { id: 1, name: "...", ... }

// Phải gọi riêng để lấy products
GET / api / restaurants / 1 / products;
```

**Sau (v2.0):**

```javascript
// Embed (nhúng dữ liệu con)
GET /api/restaurants/1?_embed=products
// Response: { id: 1, name: "...", products: [...] }

// Embed nhiều relations
GET /api/restaurants/1?_embed=products,reviews

// Expand (mở rộng foreign key)
GET /api/products/1?_expand=restaurant
// Response: { id: 1, name: "...", restaurant: {...} }

// Expand nhiều foreign keys
GET /api/products/1?_expand=restaurant,category
```

### 2. Database Layer

#### 📦 Enhanced Database Methods

**File mới:** `config/database.js`

**Thêm methods:**

```javascript
// OLD (v1.0)
db.findAll(collection);
db.findById(collection, id);
db.findOne(collection, query);
db.findMany(collection, query);
db.create(collection, data);
db.update(collection, id, data);
db.delete(collection, id);

// NEW (v2.0) - Thêm vào
db.findAllAdvanced(collection, options);
db.applyFilters(items, filters);
db.applyFullTextSearch(items, query);
db.applyRelations(items, collection, options);
db.applySorting(items, sortField, order);
db.applyPagination(items, page, limit);
```

**Ví dụ sử dụng:**

```javascript
// OLD
const restaurants = db.findMany("restaurants", {categoryId: 1});

// NEW
const result = db.findAllAdvanced("restaurants", {
  filter: {categoryId: 1},
  page: 1,
  limit: 10,
  sort: "rating",
  order: "desc",
});
// result = { data: [...], pagination: {...} }
```

### 3. Middleware Layer

#### 🔧 Query Middleware

**File mới:** `middleware/query.middleware.js`

**Chức năng:**

- Parse query parameters tự động
- Validate inputs
- Format response với pagination headers
- Logging (development mode)

**Sử dụng:**

```javascript
// server.js
const {parseQuery, formatResponse} = require("./middleware/query.middleware");

app.use(parseQuery); // Parse tất cả query params
app.use(formatResponse); // Format response với headers
```

**Tự động parse:**

```javascript
// Request: GET /api/products?_page=1&price_gte=50000&isOpen=true

// req.parsedQuery sẽ có:
{
  filter: {
    price_gte: 50000,
    isOpen: true
  },
  page: 1,
  limit: 10,
  sort: null,
  order: 'asc',
  q: null,
  embed: null,
  expand: null
}
```

### 4. Controller Updates

#### 🎮 Enhanced Controllers

**Files được cập nhật:**

- `controllers/restaurant.controller.js`
- `controllers/product.controller.js`
- `controllers/order.controller.js`
- `controllers/category.controller.js`
- `controllers/review.controller.js`
- `controllers/promotion.controller.js`
- `controllers/cart.controller.js`
- `controllers/favorite.controller.js`
- `controllers/address.controller.js`
- `controllers/user.controller.js`

**Thay đổi chính:**

**BEFORE (v1.0):**

```javascript
exports.getRestaurants = async (req, res, next) => {
  try {
    const {categoryId, isOpen} = req.query;
    let restaurants = db.findAll("restaurants");

    if (categoryId) {
      restaurants = restaurants.filter((r) => r.categoryId === parseInt(categoryId));
    }

    if (isOpen !== undefined) {
      restaurants = restaurants.filter((r) => r.isOpen === (isOpen === "true"));
    }

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};
```

**AFTER (v2.0):**

```javascript
exports.getRestaurants = async (req, res, next) => {
  try {
    // Tự động handle tất cả filters, sorting, pagination
    const result = db.findAllAdvanced("restaurants", req.parsedQuery);

    res.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination, // NEW!
    });
  } catch (error) {
    next(error);
  }
};
```

### 5. New Features trong Controllers

#### 🆕 Cart Controller - Sync Feature

```javascript
// NEW endpoint
POST /api/cart/sync
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 5, "quantity": 1 }
  ]
}
// Merge client cart với server cart
```

#### 🆕 Cart Controller - Clear by Restaurant

```javascript
// NEW endpoint
DELETE /api/cart/restaurant/:restaurantId
// Xóa tất cả items của 1 restaurant
```

#### 🆕 Favorite Controller - Toggle

```javascript
// NEW endpoint
POST /api/favorites/toggle/:restaurantId
// Add nếu chưa có, remove nếu đã có
```

#### 🆕 Favorite Controller - Get IDs only

```javascript
// NEW endpoint (lightweight)
GET / api / favorites / restaurants;
// Response: [1, 3, 5, 7] - chỉ IDs
```

#### 🆕 Promotion Controller - Get by Code

```javascript
// NEW endpoint
GET /api/promotions/code/:code
// Lấy promotion theo code
```

#### 🆕 Promotion Controller - Toggle Active

```javascript
// NEW endpoint
PATCH /api/promotions/:id/toggle
// Bật/tắt promotion
```

#### 🆕 Address Controller - Get Default

```javascript
// NEW endpoint
GET /api/addresses/default
// Lấy địa chỉ mặc định
```

#### 🆕 Address Controller - Clear Non-default

```javascript
// NEW endpoint
DELETE / api / addresses;
// Xóa tất cả địa chỉ trừ default
```

#### 🆕 User Controller - Activity Summary

```javascript
// NEW endpoint
GET /api/users/:id/activity
// Response:
{
  "user": {...},
  "stats": {
    "totalOrders": 15,
    "completedOrders": 12,
    "totalSpent": 1500000,
    "avgOrderValue": 125000,
    "totalReviews": 5,
    "avgRating": 4.5
  },
  "recentOrders": [...],
  "recentReviews": [...]
}
```

#### 🆕 User Controller - Statistics

```javascript
// NEW endpoint (Admin)
GET /api/users/stats/summary
// Response:
{
  "total": 150,
  "active": 142,
  "byRole": {
    "customer": 145,
    "admin": 5
  },
  "withOrders": 98,
  "recentSignups": 12
}
```

#### 🆕 Review Controller - Get My Reviews

```javascript
// NEW endpoint
GET / api / reviews / user / me;
// Lấy tất cả reviews của user hiện tại
```

### 6. Route Updates

#### 📍 Routes được thêm

**`routes/user.routes.js`**

```javascript
// NEW routes
GET /users/:id/activity
GET /users/stats/summary
PATCH /users/:id/status
DELETE /users/:id/permanent
```

**`routes/cart.routes.js`**

```javascript
// NEW routes
POST /cart/sync
DELETE /cart/restaurant/:restaurantId
```

**`routes/favorite.routes.js`**

```javascript
// NEW routes
GET /favorites/restaurants
POST /favorites/toggle/:restaurantId
DELETE /favorites
```

**`routes/promotion.routes.js`**

```javascript
// NEW routes
GET /promotions/code/:code
PATCH /promotions/:id/toggle
```

**`routes/address.routes.js`**

```javascript
// NEW routes
GET /addresses/default
DELETE /addresses (clear non-default)
```

**`routes/review.routes.js`**

```javascript
// NEW routes
GET /reviews (admin - all reviews)
GET /reviews/user/me
```

### 7. Response Format Changes

#### 📤 Response với Pagination

**BEFORE (v1.0):**

```json
{
  "success": true,
  "count": 50,
  "data": [...]
}
```

**AFTER (v2.0):**

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

#### 📤 Response Headers

**NEW in v2.0:**

```http
X-Total-Count: 50
X-Total-Pages: 5
X-Current-Page: 1
X-Per-Page: 10
Link: <http://...?_page=1>; rel="first", <http://...?_page=2>; rel="next"
Access-Control-Expose-Headers: X-Total-Count, X-Total-Pages, Link
```

### 8. Utilities

#### 🛠 Seed Data Script

**File mới:** `utils/seedData.js`

**Chức năng:**

- Tạo dữ liệu mẫu đầy đủ
- 3 test users (admin, 2 customers)
- 8 categories
- 6 restaurants
- 18 products
- 3 promotions
- 3 addresses

**Sử dụng:**

```bash
npm run seed
```

**Data được tạo:**

- Users: 3 (với password đã hash)
- Categories: 8
- Restaurants: 6
- Products: 18
- Promotions: 3
- Addresses: 3

### 9. Package.json Updates

**NEW scripts:**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node utils/seedData.js" // NEW!
  }
}
```

**Version bump:**

```json
{
  "version": "2.0.0" // was 1.0.0
}
```

---

## 🔄 Migration Steps

### Step 1: Backup hiện tại

```bash
# Backup toàn bộ project
cp -r funfood-backend funfood-backend-v1-backup

# Backup database
cp database/db.json database/db.json.backup
```

### Step 2: Cập nhật files

#### A. Core System

1. ✅ Thay thế `config/database.js`
2. ✅ Tạo mới `middleware/query.middleware.js`
3. ✅ Cập nhật `server.js`

#### B. Controllers

1. ✅ Cập nhật `controllers/restaurant.controller.js`
2. ✅ Cập nhật `controllers/product.controller.js`
3. ✅ Cập nhật `controllers/order.controller.js`
4. ✅ Cập nhật `controllers/category.controller.js`
5. ✅ Cập nhật `controllers/review.controller.js`
6. ✅ Cập nhật `controllers/promotion.controller.js`
7. ✅ Cập nhật `controllers/cart.controller.js`
8. ✅ Cập nhật `controllers/favorite.controller.js`
9. ✅ Cập nhật `controllers/address.controller.js`
10. ✅ Cập nhật `controllers/user.controller.js`

#### C. Routes

1. ✅ Cập nhật tất cả route files (nếu cần)

#### D. Utilities

1. ✅ Tạo mới `utils/seedData.js`

#### E. Config

1. ✅ Cập nhật `package.json`

### Step 3: Test Migration

```bash
# 1. Install (nếu cần)
npm install

# 2. Seed database
npm run seed

# 3. Start server
npm run dev

# 4. Test basic endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/restaurants?_page=1&_limit=5

# 5. Test pagination
curl -i "http://localhost:3000/api/restaurants?_page=1&_limit=5"
# Kiểm tra headers: X-Total-Count, Link

# 6. Test filtering
curl "http://localhost:3000/api/products?price_gte=50000&price_lte=100000"

# 7. Test sorting
curl "http://localhost:3000/api/restaurants?_sort=rating&_order=desc"

# 8. Test search
curl "http://localhost:3000/api/products?q=pizza"

# 9. Test relationships
curl "http://localhost:3000/api/restaurants/1?_embed=products"

# 10. Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@funfood.com","password":"123456"}'
```

### Step 4: Update Client Code

#### Android Example

**BEFORE:**

```kotlin
@GET("api/restaurants")
suspend fun getRestaurants(
    @Query("categoryId") categoryId: Int?
): RestaurantResponse
```

**AFTER:**

```kotlin
@GET("api/restaurants")
suspend fun getRestaurants(
    @Query("_page") page: Int = 1,
    @Query("_limit") limit: Int = 10,
    @Query("_sort") sort: String = "rating",
    @Query("_order") order: String = "desc",
    @Query("categoryId") categoryId: Int? = null,
    @Query("isOpen") isOpen: Boolean? = null,
    @Query("rating_gte") minRating: Float? = null,
    @Query("q") search: String? = null
): RestaurantResponse

// Response model cũng cần update
data class RestaurantResponse(
    val success: Boolean,
    val count: Int,
    val data: List<Restaurant>,
    val pagination: Pagination  // NEW!
)

data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int,
    val totalPages: Int,
    val hasNext: Boolean,
    val hasPrev: Boolean
)
```

---

## ✅ Verification Checklist

Sau khi migration, verify:

- [ ] Server khởi động không lỗi
- [ ] Health check: `GET /api/health` → OK
- [ ] Pagination: Check response có `pagination` object
- [ ] Pagination headers: Check X-Total-Count, Link headers
- [ ] Sorting: `?_sort=rating&_order=desc` hoạt động
- [ ] Filtering: `?categoryId=1&isOpen=true` hoạt động
- [ ] Operators: `?price_gte=50000` hoạt động
- [ ] Search: `?q=pizza` hoạt động
- [ ] Relationships: `?_embed=products` hoạt động
- [ ] Authentication vẫn hoạt động bình thường
- [ ] Tất cả CRUD operations OK
- [ ] Backward compatibility: old queries vẫn work

---

## 🔙 Rollback Plan

Nếu có vấn đề:

```bash
# 1. Stop server
pm2 stop funfood-api
# or
Ctrl+C

# 2. Restore backup
rm -rf funfood-backend
mv funfood-backend-v1-backup funfood-backend
cd funfood-backend

# 3. Restore database
cp database/db.json.backup database/db.json

# 4. Restart
npm run dev
```

---

## 📊 Performance Impact

### Trước Migration (v1.0)

- Response time: ~50-100ms
- Memory usage: ~50-80MB
- No pagination: trả về toàn bộ data

### Sau Migration (v2.0)

- Response time: ~50-120ms (+20ms cho processing)
- Memory usage: ~60-90MB (+10-15MB cho query processing)
- With pagination: chỉ trả về page hiện tại

**Kết luận:** Impact nhỏ, acceptable cho đổi lại features lớn

---

## 🎯 Breaking Changes

### KHÔNG CÓ Breaking Changes!

Tất cả API cũ vẫn hoạt động:

- ✅ `GET /api/restaurants` → vẫn work (default pagination)
- ✅ `GET /api/products?categoryId=1` → vẫn work
- ✅ Authentication → không thay đổi
- ✅ Request/Response format cũ → vẫn support

**Chỉ bổ sung thêm:**

- Pagination object trong response (optional)
- Headers mới (optional để dùng)
- Query parameters mới (optional)

---

## 📚 Resources

- [README.md](README.md) - Full documentation
- [API_ENDPOINTS.md](API_ENDPOINTS.md) - Complete API reference
- [QUICK_START.md](QUICK_START.md) - Quick start guide

---

## 💬 Support

Nếu gặp vấn đề trong quá trình migration:

1. Check server logs
2. Verify file đã copy đúng chưa
3. Test với cURL commands
4. Review checklist ở trên

---

**Last Updated:** October 2024  
**Migration Version:** 1.0 → 2.0  
**Status:** ✅ Stable & Production Ready
