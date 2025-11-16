# 📚 FunFood API Endpoints - Complete Reference v2.2

## 📊 Base Information

**Base URL:** `http://localhost:3000/api`  
**Version:** 2.2.0  
**Total Endpoints:** 138+  
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
17. [Schemas & Validation](#17-schemas--validation)

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

**Validation Rules:**

- `email`: Required, valid email format, unique, custom validation
- `password`: Required, min 6 characters, must contain uppercase or number
- `name`: Required, 2-100 characters
- `phone`: Required, 10-11 characters, Vietnam phone format

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

**Validation:** Only validates fields sent (name, phone, address, avatar)

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
- `POST /api/users/import` - Import file with auto password hashing (Admin)
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

**Validation:**

- `name`: Required, unique, 2-50 characters
- `icon`: Optional, emoji
- `image`: Optional, URL
- `description`: Optional, max 500 characters

### PUT `/api/categories/:id`

**Cập nhật category (Admin)**  
**Access:** Admin

### DELETE `/api/categories/:id`

**Xóa category (Admin)**  
**Access:** Admin  
**Validation:** Cannot delete if in use by restaurants/products

---

## 4. Restaurants

### GET `/api/restaurants`

**Lấy danh sách restaurants**  
**Access:** Public  
**Query:** `_page`, `_limit`, `categoryId`, `isOpen`, `rating_gte`, `q`, `_embed=products,reviews`, `_expand=category`

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

**Validation:**

- `name`: Required, unique, 2-100 characters
- `categoryId`: Required, must exist
- `address`: Required, 10-200 characters
- `latitude`, `longitude`: Optional, GPS coordinates
- `phone`: Optional, 10-15 characters
- `deliveryFee`: Optional, min 0, default 15000
- `openTime`, `closeTime`: Optional, HH:mm format
- `managerId`: Optional, foreign key to users

### PUT `/api/restaurants/:id`

**Cập nhật restaurant (Admin)**  
**Access:** Admin

### DELETE `/api/restaurants/:id`

**Xóa restaurant (Admin)**  
**Access:** Admin  
**Validation:** Cannot delete if has products

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

**Validation:**

- `name`: Required, 2-100 characters
- `restaurantId`: Required, must exist
- `categoryId`: Optional, must exist if provided
- `price`: Required, min 0
- `available`: Optional, boolean, default true
- `discount`: Optional, 0-100, default 0

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

**Validation:**

- `productId`: Required, number, must exist
- `quantity`: Required, min 1

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

**Validation:** `quantity` required

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

#### POST `/api/orders`

**Tạo đơn hàng**  
**Access:** Protected

**Validation:**

- `restaurantId`: Required, number, must exist
- `items`: Required, array with productId & quantity
- `deliveryAddress`: Required, 10-200 characters
- `deliveryLatitude`, `deliveryLongitude`: Optional, GPS coordinates
- `paymentMethod`: Required, enum [cash, card, momo, zalopay]
- `note`: Optional, max 500 characters
- `promotionCode`: Optional, max 20 characters

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

**Validations Applied:**

1. Items must exist and be available
2. All items from same restaurant
3. Restaurant must be open
4. Max 3 pending payment orders per user
5. GPS-based delivery fee calculation
6. Automatic promotion validation

#### GET `/api/orders`

**Lấy đơn hàng của mình**  
**Access:** Protected  
**Query:** `status`, `status_in`, `total_gte`, `total_lte`, `createdAt_gte`

#### GET `/api/orders/:id`

**Chi tiết đơn hàng**  
**Access:** Protected (Owner or Admin)

#### PATCH `/api/orders/:id/status`

**Cập nhật trạng thái đơn**  
**Access:** Protected (with RBAC validation)

**Validation:**

- `status`: Required, enum [pending, confirmed, preparing, delivering, delivered, cancelled]
- Workflow validation per role (see RBAC section)

#### DELETE `/api/orders/:id`

**Hủy đơn hàng**  
**Access:** Protected (Owner)  
**Validation:** Only pending/confirmed orders can be cancelled

#### POST `/api/orders/:id/reorder`

**Đặt lại đơn hàng cũ**  
**Access:** Protected

#### POST `/api/orders/:id/rate`

**Đánh giá đơn hàng**  
**Access:** Protected

**Validation:**

- `rating`: Required, 1-5
- `comment`: Required, 5-500 characters
- Only delivered orders can be rated

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

**Force update status (bypass workflow)**  
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
**Allowed:** confirmed, preparing

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
**Allowed:** delivering, delivered

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

**Validation:** type must be 'restaurant' or 'product'

### GET `/api/favorites/:type/ids`

**Lấy danh sách IDs (lightweight)**  
**Access:** Protected

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

**Validation:**

- type required (restaurant/product)
- Item must exist
- No duplicates

### POST `/api/favorites/:type/:id/toggle`

**Toggle favorite (add/remove)**  
**Access:** Protected

### DELETE `/api/favorites/:type/:id`

**Xóa khỏi favorites**  
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

**Validation:**

- `type`: Required, enum [restaurant, product]
- `restaurantId`: Required, must exist
- `productId`: Required if type=product, must exist and belong to restaurant
- `rating`: Required, 1-5
- `comment`: Required, 5-500 characters
- `orderId`: Optional, link to order
- No duplicate reviews per type+target

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

**Auto-updates after create:**

- Restaurant/Product rating recalculated
- Notification sent to user

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

**Validation:** Same as create

#### DELETE `/api/reviews/:id`

**Xóa review**  
**Access:** Protected (Owner or Admin)

**Auto-updates after delete:**

- Restaurant/Product rating recalculated

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

**Validation:**

- `code`: Required
- `orderValue`: Required, number
- `deliveryFee`: Optional, number

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

**Validation:**

- `code`: Required, unique, 4-20 uppercase alphanumeric, custom validation
- `description`: Required, max 500 characters
- `discountType`: Required, enum [percentage, fixed, delivery]
- `discountValue`: Required, min 0
- `minOrderValue`: Optional, min 0, default 0
- `maxDiscount`: Optional, min 0
- `validFrom`, `validTo`: Required, date, validFrom < validTo
- `usageLimit`, `perUserLimit`: Optional, min 0

### PUT `/api/promotions/:id`

**Cập nhật promotion (Admin)**  
**Access:** Admin

### PATCH `/api/promotions/:id/toggle`

**Bật/tắt promotion (Admin)**  
**Access:** Admin

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

**Validation:**

- `label`: Required, 1-50 characters
- `address`: Required, 10-200 characters
- `recipientName`: Required, 2-100 characters
- `recipientPhone`: Required, 10-11 characters
- `latitude`, `longitude`: Optional, GPS coordinates
- `note`: Optional, max 500 characters
- `isDefault`: Optional, boolean, default false

**Auto-behavior:**

- If isDefault=true, unsets other defaults

### PUT `/api/addresses/:id`

**Cập nhật địa chỉ**  
**Access:** Protected

### PATCH `/api/addresses/:id/default`

**Đặt làm địa chỉ mặc định**  
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

**Validation:**

- `paymentMethod`: Required, enum [cash, card, momo, zalopay]
- `cardNumber`, `cardHolder`, `expiryDate`, `cvv`: Required if method=card

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

**Payment Methods:**

- **Cash (COD)**: No additional validation
- **Card**: Validates card number format (13-19 digits)
- **MoMo**: Generates payment URL with signature
- **ZaloPay**: Generates payment URL with MAC

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

**Validates:** Signature verification

### POST `/api/payment/zalopay/callback`

**ZaloPay webhook callback**  
**Access:** Public (webhook)

**Validates:** MAC verification

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

**Validation:** Same as admin product creation, auto-assigns restaurantId

### PUT `/api/manager/products/:id`

**Cập nhật product**  
**Access:** Manager

**Validation:** Must own the product's restaurant

### PATCH `/api/manager/products/:id/availability`

**Toggle product availability**  
**Access:** Manager

**Validation:**

- `available`: Optional, boolean
- Must own the product's restaurant

### GET `/api/manager/orders`

**Lấy đơn hàng của restaurant**  
**Access:** Manager

### GET `/api/manager/orders/:id`

**Chi tiết đơn hàng**  
**Access:** Manager

**Validation:** Must own the order's restaurant

### PATCH `/api/manager/orders/:id/status`

**Cập nhật trạng thái đơn**  
**Access:** Manager

**Allowed transitions:**

- pending → confirmed
- confirmed → preparing

### GET `/api/manager/stats`

**Thống kê restaurant**  
**Access:** Manager

---

## 15. Shipper

### GET `/api/shipper/orders/available`

**Xem đơn hàng available**  
**Access:** Shipper

**Filters:** status=preparing, shipperId=null

### POST `/api/shipper/orders/:id/accept`

**Nhận đơn hàng**  
**Access:** Shipper

**Validations:**

- Order must be in 'preparing' status
- Order must not have shipper assigned
- Auto-updates order status to 'delivering'

### GET `/api/shipper/orders/my-deliveries`

**Xem đơn đang giao**  
**Access:** Shipper

### PATCH `/api/shipper/orders/:id/status`

**Cập nhật trạng thái giao hàng**  
**Access:** Shipper

**Validation:**

- `status`: Required
- Must own the order (shipperId match)

**Allowed transitions:**

- preparing → delivering (auto on accept)
- delivering → delivered

### GET `/api/shipper/orders/history`

**Xem lịch sử giao hàng**  
**Access:** Shipper

### GET `/api/shipper/stats`

**Thống kê shipper**  
**Access:** Shipper

**Calculates:**

- Total/delivering/delivered orders
- Total earnings (80% of delivery fees)
- Average delivery time
- Today's deliveries

---

## 16. Import/Export

**Supported Entities:** users, categories, restaurants, products, promotions

### GET `/api/:entity/template`

**Download import template**  
**Access:** Admin  
**Query:** `format=xlsx|csv`

**Example:**

```bash
GET /api/products/template?format=xlsx
```

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
      "name": {"type": "string", "required": true, "minLength": 2, "maxLength": 100},
      "price": {"type": "number", "required": true, "min": 0},
      "restaurantId": {"type": "number", "required": true, "foreignKey": "restaurants"}
    }
  }
}
```

### POST `/api/:entity/import`

**Import data from file**  
**Access:** Admin  
**Content-Type:** `multipart/form-data`

**Validation per row:**

1. Schema validation (type, required, min/max, unique, foreign keys)
2. Custom validation (if defined in schema)
3. Data transformation (type conversion, defaults)

**Request:**

```bash
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
    "inserted": [...],
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

**Example:**

```bash
GET /api/products/export?format=xlsx&includeRelations=true&columns=name,price,restaurantName
```

**Features:**

- Exports all data or filtered results
- Can include related entity names (foreign keys expanded)
- Column selection
- Pagination support

---

## 17. Schemas & Validation

### Schema-Based Validation

All entities use schema-based validation with automatic type conversion and custom rules.

**Available Schemas:**

- `user`, `category`, `restaurant`, `product`, `promotion`
- `address`, `order`, `cart`, `favorite`, `review`
- `notification`, `payment`

### Validation Types

**Basic Types:**

```javascript
{
  type: "string" | "number" | "boolean" | "email" | "date" | "enum";
}
```

**Constraints:**

```javascript
{
  required: boolean,
  unique: boolean,
  min: number,         // for numbers
  max: number,
  minLength: number,   // for strings
  maxLength: number,
  enum: [],           // allowed values
  default: any,
  foreignKey: string  // reference to other entity
}
```

**Custom Validation:**

```javascript
{
  custom: (value, allData) => {
    // Return error message or null
    if (invalid) return "Error message";
    return null;
  };
}
```

### Example: Product Schema

```javascript
{
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  price: {
    type: 'number',
    required: true,
    min: 0
  },
  restaurantId: {
    type: 'number',
    required: true,
    foreignKey: 'restaurants'
  },
  discount: {
    type: 'number',
    required: false,
    min: 0,
    max: 100,
    default: 0
  }
}
```

### GET `/api/schemas`

**Get all available schemas**  
**Access:** Admin

### GET `/api/schema/:entity`

**Get specific entity schema**  
**Access:** Admin

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

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": {
    "email": "Invalid email format",
    "password": "Password must contain uppercase or number"
  }
}
```

---

## ⚠️ Error Codes

| Code | Message           | Description              |
| ---- | ----------------- | ------------------------ |
| 200  | OK                | Success                  |
| 201  | Created           | Resource created         |
| 207  | Multi-Status      | Partial success (import) |
| 400  | Bad Request       | Invalid input            |
| 401  | Unauthorized      | Missing/invalid token    |
| 403  | Forbidden         | No permission            |
| 404  | Not Found         | Resource not found       |
| 409  | Conflict          | Duplicate data           |
| 422  | Unprocessable     | Validation failed        |
| 429  | Too Many Requests | Rate limit exceeded      |
| 500  | Server Error      | Internal error           |

---

## 🔐 RBAC - Role-Based Access Control

### Roles

1. **admin** - Full access to all resources
2. **manager** - Manage own restaurant and products
3. **shipper** - Accept and deliver orders
4. **customer** - Place orders, manage favorites, reviews

### Permissions Matrix

#### Orders

| Action        | Admin    | Manager              | Shipper       | Customer                    |
| ------------- | -------- | -------------------- | ------------- | --------------------------- |
| Create        | ✅       | ❌                   | ❌            | ✅ (own)                    |
| Read          | ✅ (all) | ✅ (own restaurant)  | ✅ (assigned) | ✅ (own)                    |
| Update Status | ✅ (any) | ✅ (confirm/prepare) | ✅ (deliver)  | ❌                          |
| Cancel        | ✅       | ❌                   | ❌            | ✅ (pending/confirmed only) |
| Delete        | ✅       | ❌                   | ❌            | ❌                          |

#### Products

| Action | Admin | Manager             | Shipper | Customer |
| ------ | ----- | ------------------- | ------- | -------- |
| Create | ✅    | ✅ (own restaurant) | ❌      | ❌       |
| Read   | ✅    | ✅                  | ✅      | ✅       |
| Update | ✅    | ✅ (own restaurant) | ❌      | ❌       |
| Delete | ✅    | ✅ (own restaurant) | ❌      | ❌       |

#### Reviews

| Action | Admin | Manager | Shipper | Customer |
| ------ | ----- | ------- | ------- | -------- |
| Create | ❌    | ❌      | ❌      | ✅       |
| Read   | ✅    | ✅      | ✅      | ✅       |
| Update | ❌    | ❌      | ❌      | ✅ (own) |
| Delete | ✅    | ❌      | ❌      | ✅ (own) |

### Order Status Workflow

**Customer:**

- Can only cancel (pending/confirmed → cancelled)

**Manager:**

- pending → confirmed
- confirmed → preparing

**Shipper:**

- preparing → delivering (on accept)
- delivering → delivered

**Admin:**

- Any status → Any status (bypass workflow)

### Middleware Usage

```javascript
// Check permission for action
checkPermission("orders", "create");

// Check ownership of resource
checkOwnership("order");

// Validate status transition
validateOrderStatusTransition();
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

## 🔍 Complete Workflow Examples

### 1. User Registration & Login

```bash
# Step 1: Register
POST /api/auth/register
{
  "email": "newuser@funfood.com",
  "password": "MyPass123",
  "name": "Nguyễn Văn B",
  "phone": "0909123456"
}

# Step 2: Login
POST /api/auth/login
{
  "email": "newuser@funfood.com",
  "password": "MyPass123"
}

# Response: Save token
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {...}
  }
}

# Step 3: Use token in subsequent requests
GET /api/auth/me
Header: Authorization: Bearer YOUR_TOKEN
```

### 2. Browse & Order Flow

```bash
# Step 1: Browse restaurants
GET /api/restaurants?isOpen=true&categoryId=1&_page=1&_limit=10

# Step 2: Get restaurant menu
GET /api/restaurants/2/products?available=true

# Step 3: Add to cart
POST /api/cart
{
  "productId": 4,
  "quantity": 1
}

# Step 4: View cart
GET /api/cart

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
  "items": [{"productId": 4, "quantity": 1}],
  "deliveryAddress": "123 ABC",
  "deliveryLatitude": 10.7756,
  "deliveryLongitude": 106.7019,
  "paymentMethod": "momo",
  "promotionCode": "FUNFOOD10"
}

# Step 8: Payment (if online)
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

### 3. Manager Restaurant Workflow

```bash
# Login as manager
POST /api/auth/login
{
  "email": "manager.chay@funfood.com",
  "password": "123456"
}

# View restaurant info
GET /api/manager/restaurant

# View menu
GET /api/manager/products

# Add new product
POST /api/manager/products
{
  "name": "Gỏi Cuốn Chay",
  "description": "Gỏi cuốn với rau sống",
  "price": 35000,
  "available": true,
  "discount": 0
}

# View pending orders
GET /api/manager/orders?status=pending

# Confirm order
PATCH /api/manager/orders/8/status
{
  "status": "confirmed"
}

# Mark as preparing
PATCH /api/manager/orders/8/status
{
  "status": "preparing"
}

# View stats
GET /api/manager/stats
```

### 4. Shipper Delivery Workflow

```bash
# Login as shipper
POST /api/auth/login
{
  "email": "shipper@funfood.com",
  "password": "123456"
}

# View available orders
GET /api/shipper/orders/available

# Accept order
POST /api/shipper/orders/8/accept

# View my deliveries
GET /api/shipper/orders/my-deliveries

# Update to delivering (auto on accept)
# Order status already changed to 'delivering'

# Mark as delivered
PATCH /api/shipper/orders/8/status
{
  "status": "delivered"
}

# View stats
GET /api/shipper/stats
```

### 5. Import/Export Workflow

```bash
# Step 1: Get entity schema
GET /api/products/schema

# Step 2: Download template
GET /api/products/template?format=xlsx

# Step 3: Fill in Excel and upload
POST /api/products/import
Content-Type: multipart/form-data
file: products.xlsx

# Response shows success/failed rows
{
  "success": true,
  "message": "Import completed: 45 succeeded, 3 failed",
  "data": {
    "summary": {
      "total": 48,
      "success": 45,
      "failed": 3
    },
    "errors": [...]
  }
}

# Step 4: Export data
GET /api/products/export?format=xlsx&includeRelations=true
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

---

## 🎯 Best Practices

### 1. Always Use Pagination

```bash
# ❌ Bad
GET /api/products

# ✅ Good
GET /api/products?_page=1&_limit=20
```

### 2. Include Auth Token

```bash
# ❌ Bad
GET /api/cart

# ✅ Good
GET /api/cart
Authorization: Bearer YOUR_TOKEN
```

### 3. Validate Before Sending

```javascript
// Client-side validation
const orderData = {
  restaurantId: 1,
  items: items.length > 0 ? items : null,
  deliveryAddress: address || null,
};

if (!orderData.items) {
  alert("Cart is empty");
  return;
}
```

### 4. Handle Errors Gracefully

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
    // Show validation errors
    if (result.errors) {
      Object.values(result.errors).forEach((error) => console.error(error));
    }
  }
} catch (error) {
  console.error("Network error:", error);
}
```

---

## 💡 Tips & Tricks

### 1. Batch Operations

```bash
# Instead of multiple requests
POST /api/cart (productId: 1)
POST /api/cart (productId: 2)

# Use sync endpoint
POST /api/cart/sync
{
  "items": [
    {"productId": 1, "quantity": 1},
    {"productId": 2, "quantity": 2}
  ]
}
```

### 2. Optimize Queries

```bash
# ❌ Multiple requests
GET /api/restaurants/1
GET /api/products?restaurantId=1
GET /api/reviews/restaurant/1

# ✅ Single request
GET /api/restaurants/1?_embed=products,reviews
```

### 3. Schema Validation

```bash
# Before importing, always check schema
GET /api/products/schema

# This shows you:
# - Required fields
# - Data types
# - Constraints (min/max, unique, etc.)
# - Foreign keys
```

---

## 📞 Support & Resources

**Documentation:** See `/docs` folder  
**API Health:** `GET /api/health`  
**API Explorer:** `GET /api`  
**Endpoints Reference:** `GET /api/endpoints`  
**Schemas:** `GET /api/schemas`

---

**Version:** 2.2.0  
**Last Updated:** November 2024  
**Total Endpoints:** 125+  
**Status:** Production Ready ✅
