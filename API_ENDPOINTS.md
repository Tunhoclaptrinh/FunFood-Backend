# 📚 FunFood API Endpoints - Complete Reference v2.1

## 📊 Base Information

**Base URL:** `http://localhost:3000/api`  
**Version:** 2.1.0  
**Total Endpoints:** 120+  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## 📑 Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Categories](#3-categories)
4. [Restaurants](#4-restaurants)
5. [Products](#5-products)
6. [Cart](#6-cart)
7. [Orders](#7-orders)
8. [Favorites](#8-favorites)
9. [Reviews](#9-reviews)
10. [Promotions](#10-promotions)
11. [Addresses](#11-addresses)
12. [Notifications](#12-notifications)
13. [Payment](#13-payment)
14. [Manager](#14-manager)
15. [Shipper](#15-shipper)
16. [Import/Export](#16-importexport)

---

## 1. Authentication

### POST `/api/auth/register`

**Đăng ký tài khoản mới**  
**Access:** Public

**Request:**

```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "address": "123 Đường ABC"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Nguyễn Văn A",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/api/auth/login`

**Đăng nhập**  
**Access:** Public

**Request:**

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### GET `/api/auth/me`

**Lấy thông tin user hiện tại**  
**Access:** Protected

### POST `/api/auth/logout`

**Đăng xuất**  
**Access:** Protected

### PUT `/api/auth/change-password`

**Đổi mật khẩu**  
**Access:** Protected

**Request:**

```json
{
  "currentPassword": "123456",
  "newPassword": "newpassword123"
}
```

---

## 2. Users

### GET `/api/users`

**Lấy danh sách users (Admin)**  
**Access:** Admin  
**Query:** `_page`, `_limit`, `_sort`, `_order`, `role`, `isActive`, `q`

### GET `/api/users/:id`

**Lấy thông tin user theo ID**  
**Access:** Owner or Admin

### GET `/api/users/:id/activity`

**Xem hoạt động của user**  
**Access:** Owner or Admin

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {...},
    "stats": {
      "totalOrders": 15,
      "completedOrders": 12,
      "totalSpent": 1500000,
      "avgOrderValue": 125000,
      "totalReviews": 5,
      "avgRating": 4.5,
      "totalFavorites": 8
    },
    "recentOrders": [...],
    "recentReviews": [...]
  }
}
```

### GET `/api/users/stats/summary`

**Thống kê tổng quan users (Admin)**  
**Access:** Admin

### PUT `/api/users/profile`

**Cập nhật profile của mình**  
**Access:** Protected

### PUT `/api/users/:id`

**Cập nhật user bất kỳ (Admin)**  
**Access:** Admin

### PATCH `/api/users/:id/status`

**Bật/tắt user status (Admin)**  
**Access:** Admin

### DELETE `/api/users/:id`

**Xóa user - soft delete (Admin)**  
**Access:** Admin

### DELETE `/api/users/:id/permanent`

**Xóa vĩnh viễn user và data (Admin)**  
**Access:** Admin

### Import/Export

- `GET /api/users/template` - Download template (Admin)
- `GET /api/users/schema` - Get schema (Admin)
- `POST /api/users/import` - Import file (Admin)
- `GET /api/users/export` - Export data (Admin)

---

## 3. Categories

### GET `/api/categories`

**Lấy danh sách categories**  
**Access:** Public

### GET `/api/categories/search`

**Tìm kiếm categories**  
**Access:** Public

### GET `/api/categories/:id`

**Chi tiết category**  
**Access:** Public

### POST `/api/categories`

**Tạo category (Admin)**  
**Access:** Admin

### PUT `/api/categories/:id`

**Cập nhật category (Admin)**  
**Access:** Admin

### DELETE `/api/categories/:id`

**Xóa category (Admin)**  
**Access:** Admin

### Import/Export

- `GET /api/categories/template` - Download template (Admin)
- `GET /api/categories/schema` - Get schema (Admin)
- `POST /api/categories/import` - Import file (Admin)
- `GET /api/categories/export` - Export data (Admin)

---

## 4. Restaurants

### GET `/api/restaurants`

**Lấy danh sách restaurants**  
**Access:** Public  
**Query:** `_page`, `_limit`, `categoryId`, `isOpen`, `rating_gte`, `q`, `_embed=products,reviews`, `_expand=category`

**Example:**

```bash
GET /api/restaurants?isOpen=true&rating_gte=4.5&_embed=products&_page=1&_limit=10
```

### GET `/api/restaurants/nearby`

**Tìm restaurants gần nhất (GPS)**  
**Access:** Public  
**Query:** `latitude`, `longitude`, `radius` (km)

**Example:**

```bash
GET /api/restaurants/nearby?latitude=10.7756&longitude=106.7019&radius=3&isOpen=true
```

**Response:**

```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 2,
      "name": "Phở Hà Nội",
      "distance": 0.8,
      "deliveryFee": 20000,
      "estimatedTime": "20-25 phút",
      "rating": 4.7
    }
  ]
}
```

### GET `/api/restaurants/search`

**Tìm kiếm restaurants**  
**Access:** Public  
**Query:** `q` (required)

### GET `/api/restaurants/:id`

**Chi tiết restaurant**  
**Access:** Public  
**Query:** `_embed=products,reviews`

### GET `/api/restaurants/:id/products`

**Lấy menu của restaurant**  
**Access:** Public  
**Query:** Pagination, sorting, `available=true`

### POST `/api/restaurants`

**Tạo restaurant (Admin)**  
**Access:** Admin

**Request:**

```json
{
  "name": "Nhà Hàng Mới",
  "description": "Mô tả",
  "categoryId": 1,
  "address": "123 ABC",
  "latitude": 10.7756,
  "longitude": 106.7019,
  "phone": "0283123456",
  "deliveryFee": 15000,
  "deliveryTime": "20-30 phút",
  "openTime": "08:00",
  "closeTime": "22:00",
  "image": "https://..."
}
```

### PUT `/api/restaurants/:id`

**Cập nhật restaurant (Admin)**  
**Access:** Admin

### DELETE `/api/restaurants/:id`

**Xóa restaurant (Admin)**  
**Access:** Admin

### Import/Export

- `GET /api/restaurants/template` - Download template (Admin)
- `GET /api/restaurants/schema` - Get schema (Admin)
- `POST /api/restaurants/import` - Import file (Admin)
- `GET /api/restaurants/export` - Export data (Admin)

---

## 5. Products

### GET `/api/products`

**Lấy danh sách products**  
**Access:** Public  
**Query:** `restaurantId`, `categoryId`, `available`, `price_gte`, `price_lte`, `discount_ne`, `_expand=restaurant`

### GET `/api/products/search`

**Tìm kiếm products**  
**Access:** Public

### GET `/api/products/discounted`

**Lấy products đang giảm giá**  
**Access:** Public

### GET `/api/products/:id`

**Chi tiết product**  
**Access:** Public

### POST `/api/products`

**Tạo product (Admin)**  
**Access:** Admin

### PUT `/api/products/:id`

**Cập nhật product (Admin)**  
**Access:** Admin

### PATCH `/api/products/bulk/availability`

**Bulk update availability (Admin)**  
**Access:** Admin

**Request:**

```json
{
  "productIds": [1, 2, 3],
  "available": false
}
```

### DELETE `/api/products/:id`

**Xóa product (Admin)**  
**Access:** Admin

### Import/Export

- `GET /api/products/template` - Download template (Admin)
- `GET /api/products/schema` - Get schema (Admin)
- `POST /api/products/import` - Import file (Admin)
- `GET /api/products/export` - Export data (Admin)

---

## 6. Cart

### GET `/api/cart`

**Lấy giỏ hàng**  
**Access:** Protected

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": {
    "items": [...],
    "groupedByRestaurant": {...},
    "summary": {
      "totalItems": 3,
      "subtotal": 150000,
      "deliveryFee": 35000,
      "total": 185000
    }
  }
}
```

### POST `/api/cart`

**Thêm vào giỏ hàng**  
**Access:** Protected

**Request:**

```json
{
  "productId": 1,
  "quantity": 2
}
```

### POST `/api/cart/sync`

**Đồng bộ giỏ hàng từ client**  
**Access:** Protected

**Request:**

```json
{
  "items": [
    {"productId": 1, "quantity": 2},
    {"productId": 5, "quantity": 1}
  ]
}
```

### PUT `/api/cart/:id`

**Cập nhật số lượng**  
**Access:** Protected

### DELETE `/api/cart/:id`

**Xóa item khỏi giỏ**  
**Access:** Protected

### DELETE `/api/cart/restaurant/:restaurantId`

**Xóa tất cả items của 1 restaurant**  
**Access:** Protected

### DELETE `/api/cart`

**Xóa toàn bộ giỏ hàng**  
**Access:** Protected

---

## 7. Orders

### Customer Endpoints

#### GET `/api/orders`

**Lấy đơn hàng của mình**  
**Access:** Protected  
**Query:** `status`, `status_in`, `total_gte`, `total_lte`, `createdAt_gte`

#### POST `/api/orders`

**Tạo đơn hàng**  
**Access:** Protected

**Request:**

```json
{
  "restaurantId": 1,
  "items": [{"productId": 1, "quantity": 2}],
  "deliveryAddress": "123 ABC Street",
  "deliveryLatitude": 10.7769,
  "deliveryLongitude": 106.7009,
  "paymentMethod": "cash",
  "note": "Không hành",
  "promotionCode": "FUNFOOD10"
}
```

#### GET `/api/orders/:id`

**Chi tiết đơn hàng**  
**Access:** Protected (Owner or Admin)

#### PATCH `/api/orders/:id/status`

**Cập nhật trạng thái đơn**  
**Access:** Protected (with validation)

#### DELETE `/api/orders/:id`

**Hủy đơn hàng**  
**Access:** Protected (Owner)

#### POST `/api/orders/:id/reorder`

**Đặt lại đơn hàng cũ**  
**Access:** Protected

#### POST `/api/orders/:id/rate`

**Đánh giá đơn hàng**  
**Access:** Protected

#### GET `/api/orders/stats/summary`

**Thống kê đơn hàng của mình**  
**Access:** Protected

### Admin Endpoints

#### GET `/api/orders/admin/all`

**Lấy tất cả đơn hàng**  
**Access:** Admin

#### GET `/api/orders/admin/stats`

**Thống kê tổng quan**  
**Access:** Admin

#### PATCH `/api/orders/admin/:id/status`

**Force update status**  
**Access:** Admin

#### DELETE `/api/orders/admin/:id/permanent`

**Xóa vĩnh viễn đơn hàng**  
**Access:** Admin

### Manager Endpoints

#### GET `/api/orders/manager/restaurant`

**Lấy đơn hàng của restaurant**  
**Access:** Manager

#### PATCH `/api/orders/manager/:id/status`

**Confirm/Prepare order**  
**Access:** Manager

#### GET `/api/orders/manager/stats`

**Thống kê restaurant**  
**Access:** Manager

### Shipper Endpoints

#### GET `/api/orders/shipper/available`

**Lấy đơn hàng available**  
**Access:** Shipper

#### POST `/api/orders/shipper/:id/accept`

**Nhận đơn hàng**  
**Access:** Shipper

#### GET `/api/orders/shipper/deliveries`

**Lấy đơn đang giao**  
**Access:** Shipper

#### PATCH `/api/orders/shipper/:id/status`

**Update delivery status**  
**Access:** Shipper

#### GET `/api/orders/shipper/stats`

**Thống kê shipper**  
**Access:** Shipper

---

## 8. Favorites

**Note:** Unified API hỗ trợ cả Restaurant và Product

### GET `/api/favorites`

**Lấy tất cả favorites**  
**Access:** Protected

### GET `/api/favorites/:type`

**Lấy favorites theo type**  
**Access:** Protected  
**Type:** `restaurant` | `product`

### GET `/api/favorites/:type/ids`

**Lấy danh sách IDs (lightweight)**  
**Access:** Protected

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [2, 3, 4, 7, 8]
}
```

### GET `/api/favorites/trending/:type`

**Lấy trending favorites**  
**Access:** Protected

### GET `/api/favorites/stats/summary`

**Thống kê favorites**  
**Access:** Protected

### GET `/api/favorites/:type/:id/check`

**Kiểm tra đã favorite chưa**  
**Access:** Protected

### POST `/api/favorites/:type/:id`

**Thêm vào favorites**  
**Access:** Protected

### POST `/api/favorites/:type/:id/toggle`

**Toggle favorite (add/remove)**  
**Access:** Protected

### DELETE `/api/favorites/:type/:id`

**Xóa khỏi favorites**  
**Access:** Protected

### DELETE `/api/favorites/:type`

**Xóa theo type**  
**Access:** Protected

### DELETE `/api/favorites`

**Xóa tất cả favorites**  
**Access:** Protected

---

## 9. Reviews

**Note:** Unified API hỗ trợ cả Restaurant và Product

### Public Endpoints

#### GET `/api/reviews/restaurant/:restaurantId`

**Lấy reviews của restaurant**  
**Access:** Public

#### GET `/api/reviews/product/:productId`

**Lấy reviews của product**  
**Access:** Public

#### GET `/api/reviews/type/:type`

**Lấy reviews theo type**  
**Access:** Public  
**Type:** `restaurant` | `product`

### Protected Endpoints

#### POST `/api/reviews`

**Tạo review**  
**Access:** Protected

**Request:**

```json
{
  "type": "restaurant",
  "restaurantId": 1,
  "productId": null,
  "rating": 5,
  "comment": "Rất ngon!",
  "orderId": 5
}
```

#### GET `/api/reviews/user/me`

**Lấy reviews của mình**  
**Access:** Protected

#### GET `/api/reviews/user/stats`

**Thống kê reviews của mình**  
**Access:** Protected

#### GET `/api/reviews/check/:type/:targetId`

**Kiểm tra đã review chưa**  
**Access:** Protected

#### PUT `/api/reviews/:id`

**Cập nhật review**  
**Access:** Protected (Owner)

#### DELETE `/api/reviews/:id`

**Xóa review**  
**Access:** Protected (Owner or Admin)

### Admin Endpoints

#### GET `/api/reviews`

**Lấy tất cả reviews**  
**Access:** Admin

---

## 10. Promotions

### GET `/api/promotions`

**Danh sách khuyến mãi**  
**Access:** Public

### GET `/api/promotions/active`

**Khuyến mãi đang hoạt động**  
**Access:** Public

### GET `/api/promotions/code/:code`

**Lấy promotion theo code**  
**Access:** Public

### POST `/api/promotions/validate`

**Validate mã khuyến mãi**  
**Access:** Protected

**Request:**

```json
{
  "code": "FUNFOOD10",
  "orderValue": 150000,
  "deliveryFee": 15000
}
```

**Response:**

```json
{
  "success": true,
  "message": "Promotion code is valid",
  "data": {
    "promotion": {...},
    "calculation": {
      "orderValue": 150000,
      "discount": 15000,
      "finalAmount": 135000
    }
  }
}
```

### POST `/api/promotions`

**Tạo promotion (Admin)**  
**Access:** Admin

### PUT `/api/promotions/:id`

**Cập nhật promotion (Admin)**  
**Access:** Admin

### PATCH `/api/promotions/:id/toggle`

**Bật/tắt promotion (Admin)**  
**Access:** Admin

### DELETE `/api/promotions/:id`

**Xóa promotion (Admin)**  
**Access:** Admin

### Import/Export

- `GET /api/promotions/template` - Download template (Admin)
- `GET /api/promotions/schema` - Get schema (Admin)
- `POST /api/promotions/import` - Import file (Admin)
- `GET /api/promotions/export` - Export data (Admin)

---

## 11. Addresses

### GET `/api/addresses`

**Danh sách địa chỉ**  
**Access:** Protected

### GET `/api/addresses/default`

**Lấy địa chỉ mặc định**  
**Access:** Protected

### GET `/api/addresses/:id`

**Chi tiết địa chỉ**  
**Access:** Protected

### POST `/api/addresses`

**Tạo địa chỉ mới**  
**Access:** Protected

**Request:**

```json
{
  "label": "Công ty",
  "address": "100 Đường ABC",
  "recipientName": "Nguyễn Văn A",
  "recipientPhone": "0912345678",
  "latitude": 10.7756,
  "longitude": 106.7019,
  "note": "Tầng 5",
  "isDefault": false
}
```

### PUT `/api/addresses/:id`

**Cập nhật địa chỉ**  
**Access:** Protected

### PATCH `/api/addresses/:id/default`

**Đặt làm địa chỉ mặc định**  
**Access:** Protected

### DELETE `/api/addresses/:id`

**Xóa địa chỉ**  
**Access:** Protected

### DELETE `/api/addresses`

**Xóa tất cả địa chỉ (trừ default)**  
**Access:** Protected

---

## 12. Notifications

### GET `/api/notifications`

**Danh sách thông báo**  
**Access:** Protected

**Response:**

```json
{
  "success": true,
  "count": 10,
  "unreadCount": 3,
  "data": [...]
}
```

### PATCH `/api/notifications/:id/read`

**Đánh dấu đã đọc**  
**Access:** Protected

### PATCH `/api/notifications/read-all`

**Đánh dấu tất cả đã đọc**  
**Access:** Protected

### DELETE `/api/notifications/:id`

**Xóa thông báo**  
**Access:** Protected

### DELETE `/api/notifications`

**Xóa tất cả thông báo**  
**Access:** Protected

---

## 13. Payment

### POST `/api/payment/:orderId/create`

**Tạo payment cho order**  
**Access:** Protected

**Request:**

```json
{
  "paymentMethod": "momo",
  "cardNumber": "1234567890123456",
  "cardHolder": "NGUYEN VAN A",
  "expiryDate": "12/25",
  "cvv": "123"
}
```

### GET `/api/payment/:orderId/status`

**Kiểm tra payment status**  
**Access:** Protected

### POST `/api/payment/:orderId/refund`

**Refund payment (Admin)**  
**Access:** Admin

### GET `/api/payment`

**Lấy tất cả payments (Admin)**  
**Access:** Admin

### POST `/api/payment/momo/callback`

**MoMo webhook callback**  
**Access:** Public (webhook)

### POST `/api/payment/zalopay/callback`

**ZaloPay webhook callback**  
**Access:** Public (webhook)

---

## 14. Manager

### GET `/api/manager/restaurant`

**Xem thông tin restaurant của mình**  
**Access:** Manager

### GET `/api/manager/products`

**Lấy danh sách products**  
**Access:** Manager

### POST `/api/manager/products`

**Tạo product mới**  
**Access:** Manager

### PUT `/api/manager/products/:id`

**Cập nhật product**  
**Access:** Manager

### PATCH `/api/manager/products/:id/availability`

**Toggle product availability**  
**Access:** Manager

### GET `/api/manager/orders`

**Lấy đơn hàng của restaurant**  
**Access:** Manager

### GET `/api/manager/orders/:id`

**Chi tiết đơn hàng**  
**Access:** Manager

### PATCH `/api/manager/orders/:id/status`

**Cập nhật trạng thái đơn**  
**Access:** Manager

### GET `/api/manager/stats`

**Thống kê restaurant**  
**Access:** Manager

---

## 15. Shipper

### GET `/api/shipper/orders/available`

**Xem đơn hàng available**  
**Access:** Shipper

### POST `/api/shipper/orders/:id/accept`

**Nhận đơn hàng**  
**Access:** Shipper

### GET `/api/shipper/orders/my-deliveries`

**Xem đơn đang giao**  
**Access:** Shipper

### PATCH `/api/shipper/orders/:id/status`

**Cập nhật trạng thái giao hàng**  
**Access:** Shipper

### GET `/api/shipper/orders/history`

**Xem lịch sử giao hàng**  
**Access:** Shipper

### GET `/api/shipper/stats`

**Thống kê shipper**  
**Access:** Shipper

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 50,
    "delivering": 2,
    "delivered": 48,
    "totalEarnings": 960000,
    "avgDeliveryTime": 25,
    "todayDeliveries": 5
  }
}
```

---

## 16. Import/Export

**Supported Entities:** users, categories, restaurants, products, promotions

### GET `/api/:entity/template`

**Download import template**  
**Access:** Admin  
**Query:** `format=xlsx|csv`

### GET `/api/:entity/schema`

**Get entity schema**  
**Access:** Admin

**Response:**

```json
{
  "success": true,
  "data": {
    "entity": "products",
    "schema": {
      "name": {"type": "string", "required": true},
      "price": {"type": "number", "required": true, "min": 0},
      "restaurantId": {"type": "number", "foreignKey": "restaurants"}
    }
  }
}
```

### POST `/api/:entity/import`

**Import data from file**  
**Access:** Admin  
**Content-Type:** `multipart/form-data`

**Request:**

```
POST /api/products/import
Content-Type: multipart/form-data
file: products.xlsx
```

**Response:**

```json
{
  "success": true,
  "message": "Import completed: 45 succeeded, 3 failed",
  "data": {
    "summary": {
      "total": 48,
      "success": 45,
      "failed": 3
    },
    "errors": [
      {
        "row": 12,
        "data": {...},
        "errors": ["Price must be >= 0"]
      }
    ]
  }
}
```

### GET `/api/:entity/export`

**Export data to file**  
**Access:** Admin  
**Query:** `format=xlsx|csv`, `includeRelations=true`, `columns=name,price`

---

## 📊 Query Parameters Reference

### Pagination

| Parameter         | Type   | Default | Description          |
| ----------------- | ------ | ------- | -------------------- |
| `_page`, `page`   | number | 1       | Số trang             |
| `_limit`, `limit` | number | 10      | Items/page (max 100) |

### Sorting

| Parameter         | Type   | Default | Description       |
| ----------------- | ------ | ------- | ----------------- |
| `_sort`, `sort`   | string | -       | Trường sắp xếp    |
| `_order`, `order` | string | asc     | `asc` hoặc `desc` |

### Filtering

| Operator | Example             | Description             |
| -------- | ------------------- | ----------------------- |
| Exact    | `?categoryId=1`     | Bằng chính xác          |
| `_gte`   | `?price_gte=50000`  | Lớn hơn hoặc bằng       |
| `_lte`   | `?price_lte=100000` | Nhỏ hơn hoặc bằng       |
| `_ne`    | `?discount_ne=0`    | Khác                    |
| `_like`  | `?name_like=pizza`  | Chứa (case-insensitive) |
| `_in`    | `?id_in=1,2,3`      | Trong danh sách         |

### Search

| Parameter | Description      |
| --------- | ---------------- |
| `q`, `_q` | Full-text search |

### Relationships

| Parameter | Example                    | Description         |
| --------- | -------------------------- | ------------------- |
| `_embed`  | `?_embed=products,reviews` | Nhúng related data  |
| `_expand` | `?_expand=restaurant`      | Mở rộng foreign key |

---

## 📤 Response Format

### Success (Paginated)

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

### Success (Simple)

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "errors": [{"field": "email", "message": "Email is required"}]
}
```

---

## ⚠️ Error Codes

| Code | Message       | Description           |
| ---- | ------------- | --------------------- |
| 200  | OK            | Success               |
| 201  | Created       | Resource created      |
| 400  | Bad Request   | Invalid input         |
| 401  | Unauthorized  | Missing/invalid token |
| 403  | Forbidden     | No permission         |
| 404  | Not Found     | Resource not found    |
| 409  | Conflict      | Duplicate data        |
| 422  | Unprocessable | Validation failed     |
| 500  | Server Error  | Internal error        |

---

## 📞 Quick Examples

### Authentication Flow

```bash
# 1. Register
POST /api/auth/register

# 2. Login
POST /api/auth/login
# Get token

# 3. Use token
GET /api/auth/me
Header: Authorization: Bearer {token}
```

### Create Order Flow

```bash
# 1. Get restaurants
GET /api/restaurants?isOpen=true

# 2. Get menu
GET /api/restaurants/1/products

# 3. Add to cart
POST /api/cart
{"productId": 1, "quantity": 2}

# 4. Create order
POST /api/orders
{
  "restaurantId": 1,
  "items": [{"productId": 1, "quantity": 2}],
  "deliveryAddress": "...",
  "paymentMethod": "cash"
}

# 5. Track order
GET /api/orders/1
```

### Import/Export Flow

```bash
# 1. Get schema
GET /api/products/schema

# 2. Download template
GET /api/products/template?format=xlsx

# 3. Upload file
POST /api/products/import
file: products.xlsx

# 4. Export data
GET /api/products/export?format=xlsx&includeRelations=true
```

---

## 🎯 Advanced Query Examples

### Complex Filtering

```bash
# Products: price 50k-100k, có discount, available
GET /api/products?price_gte=50000&price_lte=100000&discount_ne=0&available=true

# Orders: completed trong tháng 10, total > 100k
GET /api/orders?status=delivered&createdAt_gte=2024-10-01&total_gte=100000

# Restaurants: nearby, open, rating >= 4.5
GET /api/restaurants/nearby?latitude=10.7756&longitude=106.7019&radius=5&isOpen=true&rating_gte=4.5
```

### Multi-level Relationships

```bash
# Restaurant với products và reviews
GET /api/restaurants/1?_embed=products,reviews

# Product với restaurant info
GET /api/products?_expand=restaurant&_page=1&_limit=10

# Orders với full info
GET /api/orders?_expand=restaurant&_embed=items
```

### Combined Queries

```bash
# Search + Filter + Sort + Pagination
GET /api/products?q=pizza&price_lte=200000&_sort=price&_order=asc&_page=1&_limit=20

# GPS + Filter + Embed
GET /api/restaurants/nearby?latitude=10.7756&longitude=106.7019&categoryId=1&_embed=products
```

---

## 🔐 Authentication Examples

### Register & Login

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456",
    "name": "Nguyễn Văn A",
    "phone": "0912345678"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456"
  }'

# Response: Save token
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Use Token

```bash
# Get profile
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Protected request
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

---

## 🛒 Complete Order Flow Example

```bash
# Step 1: Browse restaurants
GET /api/restaurants?isOpen=true&categoryId=1&_page=1&_limit=10

# Step 2: Get restaurant details with menu
GET /api/restaurants/2?_embed=products

# Step 3: Add items to cart
POST /api/cart
{
  "productId": 4,
  "quantity": 1
}

POST /api/cart
{
  "productId": 5,
  "quantity": 2
}

# Step 4: View cart
GET /api/cart
# Response shows grouped items, totals

# Step 5: Get delivery address
GET /api/addresses/default

# Step 6: Validate promotion
POST /api/promotions/validate
{
  "code": "FUNFOOD10",
  "orderValue": 150000,
  "deliveryFee": 20000
}

# Step 7: Create order
POST /api/orders
{
  "restaurantId": 2,
  "items": [
    {"productId": 4, "quantity": 1},
    {"productId": 5, "quantity": 2}
  ],
  "deliveryAddress": "123 ABC",
  "deliveryLatitude": 10.7756,
  "deliveryLongitude": 106.7019,
  "paymentMethod": "momo",
  "promotionCode": "FUNFOOD10",
  "note": "Không hành"
}

# Step 8: Payment (if needed)
POST /api/payment/5/create
{
  "paymentMethod": "momo"
}

# Step 9: Track order
GET /api/orders/5

# Step 10: Rate after delivered
POST /api/orders/5/rate
{
  "rating": 5,
  "comment": "Rất ngon!"
}
```

---

## 👨‍💼 Manager Workflow Example

```bash
# Step 1: Login as manager
POST /api/auth/login
{
  "email": "manager.chay@funfood.com",
  "password": "123456"
}

# Step 2: View restaurant info
GET /api/manager/restaurant

# Step 3: View menu
GET /api/manager/products

# Step 4: Add new product
POST /api/manager/products
{
  "name": "Gỏi Cuốn Chay",
  "description": "Gỏi cuốn chay với rau sống và bún",
  "price": 35000,
  "image": "https://...",
  "available": true,
  "discount": 0
}

# Step 5: View pending orders
GET /api/manager/orders?status=pending

# Step 6: Confirm order
PATCH /api/manager/orders/8/status
{
  "status": "confirmed"
}

# Step 7: Mark as preparing
PATCH /api/manager/orders/8/status
{
  "status": "preparing"
}

# Step 8: View statistics
GET /api/manager/stats
```

---

## 🚚 Shipper Workflow Example

```bash
# Step 1: Login as shipper
POST /api/auth/login
{
  "email": "shipper@funfood.com",
  "password": "123456"
}

# Step 2: View available orders
GET /api/shipper/orders/available

# Step 3: Accept order
POST /api/shipper/orders/8/accept

# Step 4: View my deliveries
GET /api/shipper/orders/my-deliveries

# Step 5: Update to delivering
PATCH /api/shipper/orders/8/status
{
  "status": "delivering"
}

# Step 6: Mark as delivered
PATCH /api/shipper/orders/8/status
{
  "status": "delivered"
}

# Step 7: View stats
GET /api/shipper/stats

# Response shows earnings, deliveries count, avg time
```

---

## 📥 Import/Export Workflow Example

```bash
# Step 1: Get entity schema
GET /api/products/schema

# Response shows required fields, types, validation rules

# Step 2: Download template
GET /api/products/template?format=xlsx

# Step 3: Fill in data in Excel
# name, price, restaurantId, categoryId, discount, available, image...

# Step 4: Upload file
curl -X POST http://localhost:3000/api/products/import \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@products.xlsx"

# Response shows:
{
  "success": true,
  "message": "Import completed: 45 succeeded, 3 failed",
  "data": {
    "summary": {
      "total": 48,
      "success": 45,
      "failed": 3
    },
    "errors": [
      {
        "row": 12,
        "data": {"name": "Pizza", "price": -10000},
        "errors": ["Price must be >= 0"]
      }
    ]
  }
}

# Step 5: Export data
GET /api/products/export?format=xlsx&includeRelations=true&columns=name,price,restaurantName

# Downloads Excel file with all products
```

---

## 🔍 Search & Filter Patterns

### Restaurant Search

```bash
# By name
GET /api/restaurants/search?q=phở

# By location + category
GET /api/restaurants/nearby?latitude=10.7756&longitude=106.7019&categoryId=2

# Open now, high rating
GET /api/restaurants?isOpen=true&rating_gte=4.5&_sort=rating&_order=desc

# With menu embedded
GET /api/restaurants?_embed=products&_page=1
```

### Product Search

```bash
# By name
GET /api/products/search?q=pizza

# By price range
GET /api/products?price_gte=50000&price_lte=150000

# On sale only
GET /api/products/discounted?_sort=discount&_order=desc

# Available only from restaurant
GET /api/restaurants/1/products?available=true
```

### Order Search

```bash
# My recent orders
GET /api/orders?_sort=createdAt&_order=desc&_limit=10

# Orders in date range
GET /api/orders?createdAt_gte=2024-10-01&createdAt_lte=2024-10-31

# By status
GET /api/orders?status_in=pending,confirmed,preparing

# High value orders
GET /api/orders?total_gte=200000
```

---

## 🎨 Response Headers

### Pagination Headers

```
X-Total-Count: 150
X-Total-Pages: 15
X-Current-Page: 1
X-Per-Page: 10
Link: <...?_page=1>; rel="first", <...?_page=2>; rel="next", <...?_page=15>; rel="last"
```

### CORS Headers

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Expose-Headers: X-Total-Count, X-Total-Pages, Link
```

---

## 🔧 Rate Limiting

### Per Role Limits (per hour)

```
Guest: 50 requests
Customer: 100 requests
Manager: 200 requests
Shipper: 200 requests
Admin: 1000 requests
```

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-10-26T12:00:00Z
```

### Exceeded Response

```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "limit": 100,
  "resetTime": "2024-10-26T12:00:00Z"
}
```

---

## 🎯 Best Practices

### 1. Always Use Pagination

```bash
# ❌ Bad - might return thousands of items
GET /api/products

# ✅ Good - controlled data size
GET /api/products?_page=1&_limit=20
```

### 2. Include Auth Token

```bash
# ❌ Bad
GET /api/cart

# ✅ Good
GET /api/cart
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Handle Errors Gracefully

```javascript
try {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const result = await response.json();

  if (!result.success) {
    // Handle error
    console.error(result.message);
  }
} catch (error) {
  console.error("Network error:", error);
}
```

### 4. Use Appropriate HTTP Methods

```bash
# ✅ Correct
GET /api/products          # Read
POST /api/products         # Create
PUT /api/products/1        # Full update
PATCH /api/products/1      # Partial update
DELETE /api/products/1     # Delete

# ❌ Wrong
POST /api/products/get     # Should be GET
GET /api/products/delete/1 # Should be DELETE
```

### 5. Validate Before Sending

```javascript
// ✅ Good - validate on client
const orderData = {
  restaurantId: 1,
  items: items.length > 0 ? items : null,
  deliveryAddress: address || null,
};

if (!orderData.items) {
  alert("Cart is empty");
  return;
}

// Then send
await createOrder(orderData);
```

---

## 📚 Additional Resources

### Health Check

```bash
GET /api/health

Response:
{
  "status": "OK",
  "version": "2.1.0",
  "timestamp": "2024-10-26T10:00:00Z",
  "uptime": 3600.5,
  "database": "JSON File (Mock)"
}
```

### API Documentation

```bash
GET /api

Response:
{
  "message": "FunFood API v2.1",
  "version": "2.1.0",
  "documentation": {
    "full_docs": "/docs/API_ENDPOINTS.md",
    "status_page": "/api/health",
    "endpoints": "/api/endpoints"
  }
}
```

### Endpoints Reference

```bash
GET /api/endpoints

Returns complete endpoints configuration with examples
```

---

## 🐛 Common Issues & Solutions

### 1. 401 Unauthorized

```
Problem: Token missing or expired
Solution:
- Check if token is included in Authorization header
- Re-login to get new token
- Format: "Bearer {token}"
```

### 2. 403 Forbidden

```
Problem: Insufficient permissions
Solution:
- Check user role
- Verify route permissions in RBAC
- Admin routes require admin role
```

### 3. 404 Not Found

```
Problem: Resource doesn't exist
Solution:
- Verify ID is correct
- Check if resource was deleted
- Use search to find valid IDs
```

### 4. 422 Validation Error

```
Problem: Invalid data format
Solution:
- Check required fields
- Verify data types (number, string, boolean)
- Follow schema validation rules
```

### 5. 429 Rate Limit

```
Problem: Too many requests
Solution:
- Implement request throttling on client
- Wait for rate limit reset time
- Use pagination to reduce request count
```

---

## 💡 Tips & Tricks

### 1. Save Token Properly

```javascript
// After login
localStorage.setItem('token', response.data.token);

// Use in requests
const token = localStorage.getItem('token');
headers: {
  'Authorization': `Bearer ${token}`
}

// Clear on logout
localStorage.removeItem('token');
```

### 2. Batch Operations

```bash
# Instead of multiple requests
POST /api/cart (productId: 1)
POST /api/cart (productId: 2)
POST /api/cart (productId: 3)

# Use sync endpoint
POST /api/cart/sync
{
  "items": [
    {"productId": 1, "quantity": 1},
    {"productId": 2, "quantity": 2},
    {"productId": 3, "quantity": 1}
  ]
}
```

### 3. Optimize Queries

```bash
# ❌ Multiple requests
GET /api/restaurants/1
GET /api/products?restaurantId=1
GET /api/reviews/restaurant/1

# ✅ Single request with embed
GET /api/restaurants/1?_embed=products,reviews
```

### 4. Handle Pagination

```javascript
// Load more pattern
const loadMore = async (page) => {
  const response = await fetch(`/api/products?_page=${page}&_limit=20`);
  const data = await response.json();

  // Check if has more
  if (data.pagination.hasNext) {
    // Show "Load More" button
  }
};
```

### 5. Real-time Updates

```javascript
// Poll for order updates
const pollOrderStatus = (orderId) => {
  const interval = setInterval(async () => {
    const order = await getOrder(orderId);

    if (order.status === "delivered") {
      clearInterval(interval);
      // Show success message
    }
  }, 30000); // Every 30 seconds
};
```

---

## 📞 Support & Contact (FAKE!!!)

**Documentation:** https://docs.funfood.com  
**API Status:** https://status.funfood.com  
**Support Email:** api@funfood.com  
**GitHub Issues:** https://github.com/funfood/backend/issues

---

**Version:** 2.1.0  
**Last Updated:** November 2024  
**Total Endpoints:** 120+  
**Status:** Production Ready ✅
