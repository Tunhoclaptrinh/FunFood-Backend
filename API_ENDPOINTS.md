# 📚 FunFood API Endpoints - Complete Reference v2.0

## 📊 Base Information

**Base URL:** `http://localhost:3000/api`  
**Version:** 2.0.0  
**Total Endpoints:** 80  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## 📑 Table of Contents

- [Authentication](#1-authentication-apiauth)
- [Users](#2-users-apiusers)
- [Categories](#3-categories-apicategories)
- [Restaurants](#4-restaurants-apirestaurants)
- [Products](#5-products-apiproducts)
- [Cart](#6-cart-apicart)
- [Orders](#7-orders-apiorders)
- [Favorites](#8-favorites-apifavorites)
- [Reviews](#9-reviews-apireviews)
- [Promotions](#10-promotions-apipromotions)
- [Addresses](#11-addresses-apiaddresses)
- [Notifications](#12-notifications-apinotifications)
- [Query Parameters](#-query-parameters-reference)
- [Response Format](#-response-format)
- [Error Codes](#-error-codes)

---

## 1. Authentication (`/api/auth`)

### POST `/api/auth/register`

**Đăng ký tài khoản mới**

**Access:** Public

**Request Body:**

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

---

### POST `/api/auth/login`

**Đăng nhập**

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### GET `/api/auth/me`

**Lấy thông tin user hiện tại**

**Access:** Protected

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "role": "customer"
  }
}
```

---

### POST `/api/auth/logout`

**Đăng xuất**

**Access:** Protected

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### PUT `/api/auth/change-password`

**Đổi mật khẩu**

**Access:** Protected

**Request Body:**

```json
{
  "currentPassword": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 2. Users (`/api/users`)

### GET `/api/users`

**Lấy danh sách users (Admin only)**

**Access:** Admin

**Query Parameters:**

- `_page` - Số trang
- `_limit` - Số items/trang
- `_sort` - Sắp xếp theo field
- `_order` - asc/desc
- `role` - Filter theo role
- `isActive` - Filter theo status
- `q` - Search

**Example:**

```bash
GET /api/users?_page=1&_limit=20&role=customer&isActive=true
```

**Response:**

```json
{
  "success": true,
  "count": 15,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### GET `/api/users/:id`

**Lấy thông tin user theo ID**

**Access:** Owner hoặc Admin

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

---

### GET `/api/users/:id/activity`

**Xem hoạt động của user**

**Access:** Owner hoặc Admin

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

---

### GET `/api/users/stats/summary`

**Thống kê tổng quan users (Admin)**

**Access:** Admin

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 150,
    "active": 142,
    "inactive": 8,
    "byRole": {
      "customer": 145,
      "admin": 5
    },
    "withOrders": 98,
    "withReviews": 45,
    "recentSignups": 12
  }
}
```

---

### PUT `/api/users/profile`

**Cập nhật profile của mình**

**Access:** Protected

**Request Body:**

```json
{
  "name": "New Name",
  "phone": "0987654321",
  "address": "New Address",
  "avatar": "https://..."
}
```

---

### PUT `/api/users/:id`

**Cập nhật user bất kỳ (Admin)**

**Access:** Admin

---

### PATCH `/api/users/:id/status`

**Bật/tắt user status (Admin)**

**Access:** Admin

**Response:**

```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {...}
}
```

---

### DELETE `/api/users/:id`

**Xóa user - soft delete (Admin)**

**Access:** Admin

---

### DELETE `/api/users/:id/permanent`

**Xóa vĩnh viễn user và tất cả data (Admin)**

**Access:** Admin

**Response:**

```json
{
  "success": true,
  "message": "User and all related data permanently deleted",
  "deleted": {
    "user": 1,
    "orders": 15,
    "cart": 3,
    "favorites": 5,
    "reviews": 2,
    "addresses": 3
  }
}
```

---

## 3. Categories (`/api/categories`)

### GET `/api/categories`

**Lấy danh sách categories**

**Access:** Public

**Query Parameters:** Pagination, sorting

**Example:**

```bash
GET /api/categories?_sort=name&_order=asc
```

**Response:**

```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": 1,
      "name": "Cơm",
      "icon": "🍚",
      "image": "https://..."
    }
  ]
}
```

---

### GET `/api/categories/:id`

**Chi tiết category**

**Access:** Public

---

### POST `/api/categories`

**Tạo category (Admin)**

**Access:** Admin

**Request Body:**

```json
{
  "name": "Món Việt",
  "icon": "🍜",
  "image": "https://..."
}
```

---

### PUT `/api/categories/:id`

**Cập nhật category (Admin)**

**Access:** Admin

---

### DELETE `/api/categories/:id`

**Xóa category (Admin)**

**Access:** Admin

---

## 4. Restaurants (`/api/restaurants`)

### GET `/api/restaurants`

**Lấy danh sách restaurants**

**Access:** Public

**Query Parameters:**

- `_page`, `_limit` - Pagination
- `_sort`, `_order` - Sorting
- `categoryId` - Filter theo category
- `isOpen` - Filter đang mở
- `rating_gte` - Filter rating tối thiểu
- `deliveryFee_lte` - Filter phí ship tối đa
- `q` - Full-text search
- `_embed` - Nhúng products/reviews
- `_expand` - Mở rộng category

**Example:**

```bash
GET /api/restaurants?isOpen=true&rating_gte=4.5&_embed=products&_page=1&_limit=10
```

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Phở Hà Nội",
      "rating": 4.7,
      "deliveryFee": 20000,
      "deliveryTime": "25-35 phút",
      "latitude": 10.7756,
      "longitude": 106.7019,
      "isOpen": true,
      "products": [...]
    }
  ],
  "pagination": {...}
}
```

---

### GET `/api/restaurants/nearby` 🆕

**Tìm restaurants gần nhất (GPS)**

**Access:** Public

**Query Parameters:**

- `latitude` - Vĩ độ (required)
- `longitude` - Kinh độ (required)
- `radius` - Bán kính (km, default: 5)
- Các filters khác như endpoint chính

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
      "distance": 0.0,
      "deliveryFee": 20000,
      "estimatedTime": "20-25 phút"
    },
    {
      "id": 1,
      "name": "Cơm Tấm",
      "distance": 2.3,
      "deliveryFee": 25000,
      "estimatedTime": "30-35 phút"
    }
  ]
}
```

---

### GET `/api/restaurants/search`

**Tìm kiếm restaurants**

**Access:** Public

**Query Parameters:**

- `q` - Search query (required)

**Example:**

```bash
GET /api/restaurants/search?q=phở
```

---

### GET `/api/restaurants/:id`

**Chi tiết restaurant**

**Access:** Public

**Query Parameters:**

- `_embed` - products, reviews

**Example:**

```bash
GET /api/restaurants/1?_embed=products,reviews
```

---

### GET `/api/restaurants/:id/products`

**Lấy menu của restaurant**

**Access:** Public

**Query Parameters:** Pagination, sorting, filtering

**Example:**

```bash
GET /api/restaurants/1/products?available=true&_sort=price&_order=asc
```

---

### POST `/api/restaurants`

**Tạo restaurant (Admin)**

**Access:** Admin

**Request Body:**

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

---

### PUT `/api/restaurants/:id`

**Cập nhật restaurant (Admin)**

**Access:** Admin

---

### DELETE `/api/restaurants/:id`

**Xóa restaurant (Admin)**

**Access:** Admin

---

## 5. Products (`/api/products`)

### GET `/api/products`

**Lấy danh sách products**

**Access:** Public

**Query Parameters:**

- `restaurantId` - Filter theo restaurant
- `categoryId` - Filter theo category
- `available` - Filter available
- `price_gte`, `price_lte` - Filter khoảng giá
- `discount_ne` - Filter có discount
- `name_like` - Search tên
- `_expand` - restaurant, category
- Pagination, sorting

**Example:**

```bash
GET /api/products?price_gte=50000&price_lte=100000&available=true&discount_ne=0&_expand=restaurant
```

**Response:**

```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": 1,
      "name": "Phở Bò Tái",
      "price": 55000,
      "discount": 0,
      "available": true,
      "restaurant": {
        "id": 2,
        "name": "Phở Hà Nội"
      }
    }
  ],
  "pagination": {...}
}
```

---

### GET `/api/products/search`

**Tìm kiếm products**

**Access:** Public

**Example:**

```bash
GET /api/products/search?q=pizza
```

---

### GET `/api/products/:id`

**Chi tiết product**

**Access:** Public

**Query Parameters:**

- `_expand` - restaurant, category

---

### POST `/api/products`

**Tạo product (Admin)**

**Access:** Admin

---

### PUT `/api/products/:id`

**Cập nhật product (Admin)**

**Access:** Admin

---

### DELETE `/api/products/:id`

**Xóa product (Admin)**

**Access:** Admin

---

## 6. Cart (`/api/cart`)

### GET `/api/cart`

**Lấy giỏ hàng**

**Access:** Protected

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": {
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "product": {...},
        "restaurant": {...},
        "itemTotal": 90000
      }
    ],
    "groupedByRestaurant": {
      "1": {
        "restaurant": {...},
        "items": [...],
        "subtotal": 90000
      }
    },
    "summary": {
      "totalItems": 3,
      "subtotal": 150000,
      "deliveryFee": 35000,
      "total": 185000
    }
  }
}
```

---

### POST `/api/cart`

**Thêm vào giỏ hàng**

**Access:** Protected

**Request Body:**

```json
{
  "productId": 1,
  "quantity": 2
}
```

---

### POST `/api/cart/sync` 🆕

**Đồng bộ giỏ hàng từ client**

**Access:** Protected

**Request Body:**

```json
{
  "items": [
    {"productId": 1, "quantity": 2},
    {"productId": 5, "quantity": 1}
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Cart synced successfully",
  "data": {
    "synced": 2,
    "errors": 0
  }
}
```

---

### PUT `/api/cart/:id`

**Cập nhật số lượng**

**Access:** Protected

**Request Body:**

```json
{
  "quantity": 3
}
```

---

### DELETE `/api/cart/:id`

**Xóa item khỏi giỏ**

**Access:** Protected

---

### DELETE `/api/cart/restaurant/:restaurantId` 🆕

**Xóa tất cả items của 1 restaurant**

**Access:** Protected

---

### DELETE `/api/cart`

**Xóa toàn bộ giỏ hàng**

**Access:** Protected

---

## 7. Orders (`/api/orders`)

### GET `/api/orders`

**Lấy đơn hàng của mình**

**Access:** Protected

**Query Parameters:**

- `status` - Filter theo status
- `status_in` - Filter nhiều status
- `total_gte`, `total_lte` - Filter khoảng giá
- `createdAt_gte` - Filter từ ngày
- Pagination, sorting

**Example:**

```bash
GET /api/orders?status=delivered&_sort=createdAt&_order=desc&_page=1
```

**Response:**

```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": 1,
      "restaurantId": 1,
      "items": [...],
      "subtotal": 100000,
      "deliveryFee": 15000,
      "discount": 10000,
      "total": 105000,
      "status": "delivered",
      "deliveryAddress": "123 ABC",
      "deliveryLatitude": 10.7769,
      "deliveryLongitude": 106.7009,
      "createdAt": "2024-10-26T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### GET `/api/orders/all`

**Lấy tất cả đơn hàng (Admin)**

**Access:** Admin

**Query Parameters:** Giống `/api/orders` + `userId`

---

### GET `/api/orders/:id`

**Chi tiết đơn hàng**

**Access:** Owner hoặc Admin

---

### POST `/api/orders`

**Tạo đơn hàng**

**Access:** Protected

**Request Body:**

```json
{
  "restaurantId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "deliveryAddress": "123 ABC Street",
  "deliveryLatitude": 10.7769,
  "deliveryLongitude": 106.7009,
  "paymentMethod": "cash",
  "note": "Không hành",
  "promotionCode": "FUNFOOD10"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 5,
    "total": 115500,
    "status": "pending",
    "estimatedDistance": 2.3,
    "deliveryFee": 25000
  }
}
```

---

### PATCH `/api/orders/:id/status`

**Cập nhật trạng thái đơn**

**Access:** Owner (chỉ cancel) hoặc Admin

**Request Body:**

```json
{
  "status": "confirmed"
}
```

**Status values:**

- `pending` → `confirmed` → `preparing` → `delivering` → `delivered`
- `cancelled` (từ pending/confirmed)

---

### DELETE `/api/orders/:id`

**Hủy đơn hàng**

**Access:** Owner hoặc Admin

**Chỉ hủy được:** pending, confirmed

---

## 8. Favorites (`/api/favorites`)

### GET `/api/favorites`

**Danh sách yêu thích**

**Access:** Protected

**Query Parameters:** Pagination, sorting

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "restaurantId": 2,
      "createdAt": "2024-10-15T10:00:00Z",
      "restaurant": {
        "id": 2,
        "name": "Phở Hà Nội",
        "rating": 4.7
      }
    }
  ]
}
```

---

### GET `/api/favorites/restaurants` 🆕

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

---

### GET `/api/favorites/check/:restaurantId`

**Kiểm tra đã favorite chưa**

**Access:** Protected

**Response:**

```json
{
  "success": true,
  "isFavorite": true,
  "data": {...}
}
```

---

### POST `/api/favorites/:restaurantId`

**Thêm vào yêu thích**

**Access:** Protected

---

### POST `/api/favorites/toggle/:restaurantId` 🆕

**Toggle favorite (add hoặc remove)**

**Access:** Protected

**Response:**

```json
{
  "success": true,
  "message": "Added to favorites",
  "isFavorite": true
}
```

---

### DELETE `/api/favorites/:restaurantId`

**Xóa khỏi yêu thích**

**Access:** Protected

---

### DELETE `/api/favorites`

**Xóa tất cả yêu thích**

**Access:** Protected

---

## 9. Reviews (`/api/reviews`)

### GET `/api/reviews/restaurant/:restaurantId`

**Lấy reviews của restaurant**

**Access:** Public

**Query Parameters:**

- `rating` - Filter theo rating
- `rating_gte` - Rating tối thiểu
- Pagination, sorting

**Example:**

```bash
GET /api/reviews/restaurant/1?rating_gte=4&_sort=createdAt&_order=desc
```

**Response:**

```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "restaurantId": 1,
      "rating": 5,
      "comment": "Rất ngon!",
      "createdAt": "2024-10-20T14:00:00Z",
      "user": {
        "id": 2,
        "name": "Nguyễn Văn A",
        "avatar": "https://..."
      }
    }
  ],
  "pagination": {...}
}
```

---

### GET `/api/reviews`

**Lấy tất cả reviews (Admin)**

**Access:** Admin

---

### GET `/api/reviews/user/me` 🆕

**Lấy reviews của mình**

**Access:** Protected

---

### POST `/api/reviews`

**Tạo review**

**Access:** Protected

**Request Body:**

```json
{
  "restaurantId": 1,
  "orderId": 5,
  "rating": 5,
  "comment": "Rất ngon, giao hàng nhanh!"
}
```

**Rules:**

- 1 user chỉ review 1 lần/restaurant
- Rating: 1-5
- Tự động update restaurant rating

---

### PUT `/api/reviews/:id`

**Cập nhật review**

**Access:** Owner

---

### DELETE `/api/reviews/:id`

**Xóa review**

**Access:** Owner hoặc Admin

---

## 10. Promotions (`/api/promotions`)

### GET `/api/promotions`

**Danh sách khuyến mãi**

**Access:** Public

**Query Parameters:**

- `isActive` - Filter active
- `discountType` - percentage/fixed/delivery
- `discountValue_gte` - Giảm tối thiểu
- Pagination, sorting

---

### GET `/api/promotions/active`

**Khuyến mãi đang hoạt động**

**Access:** Public

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "code": "FUNFOOD10",
      "description": "Giảm 10% cho đơn từ 100k",
      "discountType": "percentage",
      "discountValue": 10,
      "minOrderValue": 100000,
      "maxDiscount": 50000,
      "validFrom": "2024-01-01",
      "validTo": "2024-12-31"
    }
  ]
}
```

---

### GET `/api/promotions/code/:code` 🆕

**Lấy promotion theo code**

**Access:** Public

**Example:**

```bash
GET /api/promotions/code/FUNFOOD10
```

---

### POST `/api/promotions/validate`

**Validate mã khuyến mãi**

**Access:** Protected

**Request Body:**

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
      "finalAmount": 135000,
      "savings": 15000
    }
  }
}
```

---

### POST `/api/promotions`

**Tạo promotion (Admin)**

**Access:** Admin

**Request Body:**

```json
{
  "code": "WEEKEND20",
  "description": "Giảm 20% cuối tuần",
  "discountType": "percentage",
  "discountValue": 20,
  "minOrderValue": 80000,
  "maxDiscount": 100000,
  "validFrom": "2024-11-01T00:00:00Z",
  "validTo": "2024-11-30T23:59:59Z",
  "usageLimit": 500,
  "perUserLimit": 2
}
```

---

### PUT `/api/promotions/:id`

**Cập nhật promotion (Admin)**

**Access:** Admin

---

### PATCH `/api/promotions/:id/toggle` 🆕

**Bật/tắt promotion (Admin)**

**Access:** Admin

---

### DELETE `/api/promotions/:id`

**Xóa promotion (Admin)**

**Access:** Admin

---

## 11. Addresses (`/api/addresses`)

### GET `/api/addresses`

**Danh sách địa chỉ**

**Access:** Protected

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "label": "Nhà",
      "address": "123 ABC Street",
      "recipientName": "Nguyễn Văn A",
      "recipientPhone": "0912345678",
      "latitude": 10.7756,
      "longitude": 106.7019,
      "note": "Gọi trước 5 phút",
      "isDefault": true
    }
  ]
}
```

---

### GET `/api/addresses/default` 🆕

**Lấy địa chỉ mặc định**

**Access:** Protected

---

### GET `/api/addresses/:id`

**Chi tiết địa chỉ**

**Access:** Protected

---

### POST `/api/addresses`

**Tạo địa chỉ mới**

**Access:** Protected

**Request Body:**

```json
{
  "label": "Công ty",
  "address": "100 Đường ABC, Quận 1",
  "recipientName": "Nguyễn Văn A",
  "recipientPhone": "0912345678",
  "latitude": 10.7756,
  "longitude": 106.7019,
  "note": "Tầng 5, phòng 501",
  "isDefault": false
}
```

---

### PUT `/api/addresses/:id`

**Cập nhật địa chỉ**

**Access:** Protected

---

### PATCH `/api/addresses/:id/default`

**Đặt làm địa chỉ mặc định**

**Access:** Protected

---

### DELETE `/api/addresses/:id`

**Xóa địa chỉ**

**Access:** Protected

---

### DELETE `/api/addresses` 🆕

**Xóa tất cả địa chỉ (trừ default)**

**Access:** Protected

---

## 12. Notifications (`/api/notifications`) 🆕

### GET `/api/notifications`

**Danh sách thông báo**

**Access:** Protected

**Query Parameters:** Pagination

**Response:**

```json
{
  "success": true,
  "count": 10,
  "unreadCount": 3,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "title": "Đơn hàng đã giao",
      "message": "Đơn hàng #5 đã được giao thành công",
      "type": "order",
      "refId": 5,
      "isRead": false,
      "createdAt": "2024-10-26T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

**Notification Types:**

- `order` - Order updates
- `promotion` - Promotion announcements
- `favorite` - Favorite restaurant updates
- `system` - System messages

---

### PATCH `/api/notifications/:id/read`

**Đánh dấu đã đọc**

**Access:** Protected

---

### PATCH `/api/notifications/read-all`

**Đánh dấu tất cả đã đọc**

**Access:** Protected

**Response:**

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "count": 5
}
```

---

### DELETE `/api/notifications/:id`

**Xóa thông báo**

**Access:** Protected

---

### DELETE `/api/notifications`

**Xóa tất cả thông báo**

**Access:** Protected

---

## 📊 Query Parameters Reference

### Pagination

| Parameter          | Type   | Default | Description                |
| ------------------ | ------ | ------- | -------------------------- |
| `_page` / `page`   | number | 1       | Số trang                   |
| `_limit` / `limit` | number | 10      | Items mỗi trang (max: 100) |

### Sorting

| Parameter          | Type   | Default | Description      |
| ------------------ | ------ | ------- | ---------------- |
| `_sort` / `sort`   | string | -       | Trường sắp xếp   |
| `_order` / `order` | string | asc     | Thứ tự: asc/desc |

### Search

| Parameter  | Type   | Description        |
| ---------- | ------ | ------------------ |
| `q` / `_q` | string | Tìm kiếm full-text |

### Filtering

| Operator    | Example             | Description             |
| ----------- | ------------------- | ----------------------- |
| Exact match | `?categoryId=1`     | Bằng chính xác          |
| `_gte`      | `?price_gte=50000`  | Lớn hơn hoặc bằng       |
| `_lte`      | `?price_lte=100000` | Nhỏ hơn hoặc bằng       |
| `_ne`       | `?discount_ne=0`    | Khác                    |
| `_like`     | `?name_like=pizza`  | Chứa (case-insensitive) |
| `_in`       | `?id_in=1,2,3`      | Trong danh sách         |

### Relationships

| Parameter | Example               | Description         |
| --------- | --------------------- | ------------------- |
| `_embed`  | `?_embed=products`    | Nhúng dữ liệu con   |
| `_expand` | `?_expand=restaurant` | Mở rộng foreign key |

---

## 📤 Response Format

### Success (với pagination)

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

### Success (đơn giản)

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
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## ⚠️ Error Codes

| Code | Message       | Description           |
| ---- | ------------- | --------------------- |
| 400  | Bad Request   | Invalid input         |
| 401  | Unauthorized  | Token missing/invalid |
| 403  | Forbidden     | No permission         |
| 404  | Not Found     | Resource not found    |
| 409  | Conflict      | Duplicate data        |
| 422  | Unprocessable | Validation failed     |
| 500  | Server Error  | Internal error        |

---

## 📞 Support

**Documentation:** https://docs.funfood.com  
**API Status:** https://status.funfood.com  
**Email:** api@funfood.com

---

**Version:** 2.0.0 | **Last Updated:** October 2024 | **Total Endpoints:** 80
