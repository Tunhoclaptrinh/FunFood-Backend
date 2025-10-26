# 📚 FunFood API Endpoints - Complete Reference

## Base URL

```
http://localhost:3000/api
```

## 🔐 Authentication

All protected endpoints require:

```
Authorization: Bearer {JWT_TOKEN}
```

---

## 1. AUTH - `/api/auth`

### Public Endpoints

#### POST `/api/auth/register`

Đăng ký tài khoản mới

```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "address": "123 Đường ABC"
}
```

#### POST `/api/auth/login`

Đăng nhập

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### Protected Endpoints

#### GET `/api/auth/me`

Lấy thông tin user hiện tại

#### POST `/api/auth/logout`

Đăng xuất

#### PUT `/api/auth/change-password`

Đổi mật khẩu

```json
{
  "currentPassword": "123456",
  "newPassword": "newpass123"
}
```

---

## 2. USERS - `/api/users`

### Protected Endpoints

#### GET `/api/users/:id`

Lấy thông tin user theo ID (own profile hoặc admin)

#### PUT `/api/users/profile`

Cập nhật profile của mình

```json
{
  "name": "New Name",
  "phone": "0987654321",
  "address": "New Address",
  "avatar": "https://..."
}
```

#### GET `/api/users/:id/activity`

Xem hoạt động của user (statistics, orders, reviews)

### Admin Only

#### GET `/api/users`

Lấy danh sách users
**Query params:**

- `?_page=1&_limit=20`
- `?_sort=createdAt&_order=desc`
- `?role=customer`
- `?isActive=true`
- `?q=search_term`

#### GET `/api/users/stats/summary`

Thống kê tổng quan users

#### PUT `/api/users/:id`

Cập nhật user bất kỳ (admin)

#### PATCH `/api/users/:id/status`

Bật/tắt trạng thái active

#### DELETE `/api/users/:id`

Xóa user (soft delete - deactivate)

#### DELETE `/api/users/:id/permanent`

Xóa vĩnh viễn user và tất cả dữ liệu liên quan

---

## 3. CATEGORIES - `/api/categories`

### Public Endpoints

#### GET `/api/categories`

Lấy danh sách categories
**Query params:**

- `?_page=1&_limit=10`
- `?_sort=name&_order=asc`
- `?name_like=Pizza`

#### GET `/api/categories/:id`

Lấy category theo ID

### Admin Only

#### POST `/api/categories`

Tạo category mới

```json
{
  "name": "Món Việt",
  "icon": "🍜",
  "image": "https://..."
}
```

#### PUT `/api/categories/:id`

Cập nhật category

#### DELETE `/api/categories/:id`

Xóa category

---

## 4. RESTAURANTS - `/api/restaurants`

### Public Endpoints

#### GET `/api/restaurants`

Lấy danh sách nhà hàng
**Query params:**

- `?_page=1&_limit=10`
- `?_sort=rating&_order=desc`
- `?categoryId=1`
- `?isOpen=true`
- `?rating_gte=4.5`
- `?deliveryFee_lte=20000`
- `?q=pizza`
- `?_embed=products` - Kèm danh sách products

#### GET `/api/restaurants/search?q=...`

Tìm kiếm nhà hàng

#### GET `/api/restaurants/:id`

Chi tiết nhà hàng
**Query params:**

- `?_embed=products,reviews` - Nhúng products và reviews

#### GET `/api/restaurants/:id/products`

Lấy menu của nhà hàng (with pagination)

### Admin Only

#### POST `/api/restaurants`

Tạo nhà hàng mới

#### PUT `/api/restaurants/:id`

Cập nhật nhà hàng

#### DELETE `/api/restaurants/:id`

Xóa nhà hàng

---

## 5. PRODUCTS - `/api/products`

### Public Endpoints

#### GET `/api/products`

Lấy danh sách sản phẩm
**Query params:**

- `?_page=1&_limit=20`
- `?_sort=price&_order=asc`
- `?restaurantId=1`
- `?categoryId=2`
- `?available=true`
- `?price_gte=50000&price_lte=100000`
- `?discount_ne=0` - Có giảm giá
- `?name_like=pizza`
- `?_expand=restaurant` - Kèm thông tin restaurant

#### GET `/api/products/search?q=...`

Tìm kiếm sản phẩm

#### GET `/api/products/:id`

Chi tiết sản phẩm
**Query params:**

- `?_expand=restaurant,category`

### Admin Only

#### POST `/api/products`

Tạo sản phẩm mới

#### PUT `/api/products/:id`

Cập nhật sản phẩm

#### DELETE `/api/products/:id`

Xóa sản phẩm

---

## 6. CART - `/api/cart`

### Protected Endpoints (All require auth)

#### GET `/api/cart`

Lấy giỏ hàng
**Response includes:**

- Items with product details
- Grouped by restaurant
- Total calculation

#### POST `/api/cart`

Thêm vào giỏ (hoặc cập nhật nếu đã có)

```json
{
  "productId": 1,
  "quantity": 2
}
```

#### POST `/api/cart/sync`

Đồng bộ giỏ hàng từ client

```json
{
  "items": [
    {"productId": 1, "quantity": 2},
    {"productId": 5, "quantity": 1}
  ]
}
```

#### PUT `/api/cart/:id`

Cập nhật số lượng

```json
{
  "quantity": 3
}
```

#### DELETE `/api/cart/:id`

Xóa item khỏi giỏ

#### DELETE `/api/cart/restaurant/:restaurantId`

Xóa tất cả items của 1 restaurant

#### DELETE `/api/cart`

Xóa toàn bộ giỏ hàng

---

## 7. ORDERS - `/api/orders`

### Protected Endpoints

#### GET `/api/orders`

Lấy đơn hàng của mình
**Query params:**

- `?_page=1&_limit=10`
- `?_sort=createdAt&_order=desc`
- `?status=delivered`
- `?status_in=pending,confirmed`
- `?total_gte=100000`
- `?createdAt_gte=2024-10-01`

#### GET `/api/orders/:id`

Chi tiết đơn hàng

#### POST `/api/orders`

Tạo đơn hàng mới

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
  "paymentMethod": "cash",
  "note": "Không hành",
  "promotionCode": "FUNFOOD10"
}
```

#### PATCH `/api/orders/:id/status`

Cập nhật trạng thái đơn

```json
{
  "status": "confirmed"
}
```

**Status values:** pending, confirmed, preparing, delivering, delivered, cancelled

#### DELETE `/api/orders/:id`

Hủy đơn hàng (chỉ pending/confirmed)

### Admin Only

#### GET `/api/orders/all`

Lấy tất cả đơn hàng
**Query params:** Same as user orders + `?userId=2`

---

## 8. FAVORITES - `/api/favorites`

### Protected Endpoints (All require auth)

#### GET `/api/favorites`

Lấy danh sách yêu thích
**Query params:**

- `?_page=1&_limit=10`
- `?_sort=createdAt&_order=desc`

#### GET `/api/favorites/restaurants`

Lấy danh sách ID restaurants yêu thích (lightweight)

#### GET `/api/favorites/check/:restaurantId`

Kiểm tra đã yêu thích chưa

#### POST `/api/favorites/:restaurantId`

Thêm vào yêu thích

#### POST `/api/favorites/toggle/:restaurantId`

Toggle favorite (thêm hoặc xóa)

#### DELETE `/api/favorites/:restaurantId`

Xóa khỏi yêu thích

#### DELETE `/api/favorites`

Xóa tất cả yêu thích

---

## 9. REVIEWS - `/api/reviews`

### Public Endpoints

#### GET `/api/reviews/restaurant/:restaurantId`

Lấy đánh giá của nhà hàng
**Query params:**

- `?_page=1&_limit=10`
- `?_sort=createdAt&_order=desc`
- `?rating=5`
- `?rating_gte=4`

### Protected Endpoints

#### GET `/api/reviews/user/me`

Lấy đánh giá của mình

#### POST `/api/reviews`

Tạo đánh giá mới

```json
{
  "restaurantId": 1,
  "orderId": 5,
  "rating": 5,
  "comment": "Rất ngon!"
}
```

#### PUT `/api/reviews/:id`

Cập nhật đánh giá

```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

#### DELETE `/api/reviews/:id`

Xóa đánh giá

### Admin Only

#### GET `/api/reviews`

Lấy tất cả đánh giá với filter

---

## 10. PROMOTIONS - `/api/promotions`

### Public Endpoints

#### GET `/api/promotions`

Lấy danh sách khuyến mãi
**Query params:**

- `?_page=1&_limit=10`
- `?isActive=true`
- `?discountType=percentage`
- `?discountValue_gte=10`

#### GET `/api/promotions/active`

Lấy khuyến mãi đang hoạt động (valid dates)

#### GET `/api/promotions/code/:code`

Lấy khuyến mãi theo code

### Protected Endpoints

#### POST `/api/promotions/validate`

Validate mã khuyến mãi

```json
{
  "code": "FUNFOOD10",
  "orderValue": 150000,
  "deliveryFee": 15000
}
```

### Admin Only

#### POST `/api/promotions`

Tạo khuyến mãi mới

```json
{
  "code": "NEWCODE",
  "description": "Giảm 20%",
  "discountType": "percentage",
  "discountValue": 20,
  "minOrderValue": 100000,
  "maxDiscount": 50000,
  "validFrom": "2024-11-01T00:00:00Z",
  "validTo": "2024-12-31T23:59:59Z",
  "usageLimit": 1000,
  "perUserLimit": 1
}
```

**discountType:** percentage, fixed, delivery

#### PUT `/api/promotions/:id`

Cập nhật khuyến mãi

#### PATCH `/api/promotions/:id/toggle`

Bật/tắt khuyến mãi

#### DELETE `/api/promotions/:id`

Xóa khuyến mãi

---

## 11. ADDRESSES - `/api/addresses`

### Protected Endpoints (All require auth)

#### GET `/api/addresses`

Lấy danh sách địa chỉ
**Query params:**

- `?_page=1&_limit=10`
- `?isDefault=true`

#### GET `/api/addresses/default`

Lấy địa chỉ mặc định

#### GET `/api/addresses/:id`

Chi tiết địa chỉ

#### POST `/api/addresses`

Tạo địa chỉ mới

```json
{
  "label": "Nhà",
  "address": "123 ABC Street",
  "recipientName": "Nguyễn Văn A",
  "recipientPhone": "0912345678",
  "latitude": 10.7756,
  "longitude": 106.7019,
  "note": "Gọi trước 5 phút",
  "isDefault": true
}
```

#### PUT `/api/addresses/:id`

Cập nhật địa chỉ

#### PATCH `/api/addresses/:id/default`

Đặt làm địa chỉ mặc định

#### DELETE `/api/addresses/:id`

Xóa địa chỉ

#### DELETE `/api/addresses`

Xóa tất cả địa chỉ (trừ default)

---

## 📊 Query Parameters Reference

### Pagination

- `_page` hoặc `page` - Số trang (default: 1)
- `_limit` hoặc `limit` - Số items/trang (default: 10, max: 100)

### Sorting

- `_sort` hoặc `sort` - Trường sắp xếp
- `_order` hoặc `order` - Thứ tự: asc/desc (default: asc)

### Search

- `q` hoặc `_q` - Tìm kiếm full-text

### Filtering

- `field=value` - Exact match
- `field_gte=value` - Greater than or equal
- `field_lte=value` - Less than or equal
- `field_ne=value` - Not equal
- `field_like=pattern` - Contains (case-insensitive)
- `field_in=value1,value2` - In list

### Relationships

- `_embed=relation` - Nhúng dữ liệu con
- `_expand=foreignKey` - Mở rộng foreign key

---

## 🔑 Response Format

### Success (with pagination)

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

### Success (simple)

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
  "errors": [...]
}
```

---

## 🎯 Example Requests

### 1. Get top rated restaurants with products

```bash
GET /api/restaurants?_sort=rating&_order=desc&_limit=5&_embed=products
```

### 2. Search pizza products under 200k

```bash
GET /api/products?q=pizza&price_lte=200000&_sort=price&_order=asc
```

### 3. Get my completed orders

```bash
GET /api/orders?status=delivered&_sort=createdAt&_order=desc
```

### 4. Get active promotions with minimum 10% discount

```bash
GET /api/promotions/active?discountType=percentage&discountValue_gte=10
```

### 5. Get restaurants in specific category, open, high rating

```bash
GET /api/restaurants?categoryId=1&isOpen=true&rating_gte=4.5&_page=1&_limit=10
```
