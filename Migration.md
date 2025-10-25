# 🚀 Migration Guide - Nâng cấp lên JSON-Server Style API

## 📋 Checklist

- [ ] Tạo file `middleware/query.middleware.js`
- [ ] Cập nhật `config/database.js`
- [ ] Cập nhật `server.js`
- [ ] Cập nhật controllers (restaurant, product, order)
- [ ] Test các endpoints mới
- [ ] Cập nhật client code

## 1️⃣ Tạo middleware mới

### File: `middleware/query.middleware.js`

Tạo file mới với nội dung từ artifact `complete_query_middleware`.

```bash
# Tạo file
touch middleware/query.middleware.js
```

Copy code từ artifact và paste vào file.

## 2️⃣ Cập nhật Database

### File: `config/database.js`

**Backup file cũ:**

```bash
cp config/database.js config/database.js.backup
```

**Thay thế với code mới:**
Copy toàn bộ code từ artifact `enhanced_database` vào `config/database.js`.

### Các thay đổi chính:

✅ Thêm method `findAllAdvanced(collection, options)`
✅ Thêm method `applyFilters(items, filters)`
✅ Thêm method `applyFullTextSearch(items, query)`
✅ Thêm method `applyRelations(items, collection, options)`
✅ Thêm method `applySorting(items, sortField, order)`
✅ Thêm method `applyPagination(items, page, limit)`
✅ Giữ nguyên các CRUD methods cũ

## 3️⃣ Cập nhật Server

### File: `server.js`

**Thêm import middleware:**

```javascript
// Thêm sau dòng app.use(express.urlencoded({ extended: true }));

const {parseQuery, formatResponse, validateQuery, logQuery} = require("./middleware/query.middleware");

// Apply query parsing to all routes
app.use(parseQuery);
app.use(formatResponse);
app.use(validateQuery); // Optional
app.use(logQuery); // Optional for debugging
```

**Thêm API docs endpoint:**

```javascript
// Thêm trước health check
app.get("/api", (req, res) => {
  res.json({
    message: "FunFood API - JSON Server Style",
    version: "1.0.0",
    features: [
      "Pagination: ?_page=1&_limit=10",
      "Sorting: ?_sort=field&_order=asc|desc",
      "Full-text search: ?q=search_term",
      "Filtering: ?field=value",
      "Operators: ?field_gte=value, ?field_lte=value, ?field_ne=value",
      "Relationships: ?_embed=related or ?_expand=foreign_key",
    ],
    endpoints: {
      /* ... */
    },
  });
});
```

## 4️⃣ Cập nhật Controllers

### A. Restaurant Controller

**File: `controllers/restaurant.controller.js`**

Thay thế toàn bộ với code từ artifact `enhanced_restaurant_controller`.

**Các thay đổi:**

- `getRestaurants()` - Dùng `findAllAdvanced()` với `req.parsedQuery`
- `searchRestaurants()` - Tích hợp với query parser
- `getRestaurant()` - Hỗ trợ `_embed`
- `getRestaurantProducts()` - Dùng `findAllAdvanced()` với filter

### B. Product Controller

**File: `controllers/product.controller.js`**

Thay thế với code từ artifact `enhanced_product_controller`.

**Các thay đổi:**

- `getProducts()` - Dùng `findAllAdvanced()`
- `searchProducts()` - Tích hợp query parser
- `getProduct()` - Hỗ trợ `_expand`

### C. Order Controller

**File: `controllers/order.controller.js`**

Thay thế với code từ artifact `enhanced_order_controller`.

**Các thay đổi:**

- `getMyOrders()` - Dùng `findAllAdvanced()` với userId filter
- `getAllOrders()` - Dùng `findAllAdvanced()` cho admin

### D. Các controllers khác (Optional)

Áp dụng tương tự cho:

- `controllers/category.controller.js`
- `controllers/review.controller.js`
- `controllers/promotion.controller.js`
- `controllers/user.controller.js`

**Pattern chung:**

```javascript
exports.getItems = async (req, res, next) => {
  try {
    const result = db.findAllAdvanced("collection_name", req.parsedQuery);

    res.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
```

## 5️⃣ Testing

### Test cơ bản

```bash
# 1. Start server
npm run dev

# 2. Test pagination
curl "http://localhost:3000/api/restaurants?_page=1&_limit=5"

# 3. Test sorting
curl "http://localhost:3000/api/products?_sort=price&_order=desc"

# 4. Test filtering
curl "http://localhost:3000/api/restaurants?isOpen=true&rating_gte=4.5"

# 5. Test search
curl "http://localhost:3000/api/products?q=pizza"

# 6. Test operators
curl "http://localhost:3000/api/products?price_gte=50000&price_lte=100000"

# 7. Test relationships
curl "http://localhost:3000/api/restaurants/1?_embed=products"

# 8. Test complex query
curl "http://localhost:3000/api/products?categoryId=1&available=true&discount_ne=0&_sort=discount&_order=desc&_page=1&_limit=10"
```

### Verify Response Headers

```bash
curl -i "http://localhost:3000/api/restaurants?_page=1&_limit=5"

# Kiểm tra headers:
# X-Total-Count: 4
# X-Total-Pages: 1
# X-Current-Page: 1
# X-Per-Page: 5
# Link: <...>; rel="first", <...>; rel="next", ...
```

## 6️⃣ Backward Compatibility

API cũ vẫn hoạt động bình thường:

✅ `/api/restaurants` - Vẫn trả về tất cả (có pagination mặc định)
✅ `/api/products?restaurantId=1` - Vẫn filter như cũ
✅ `/api/orders?status=delivered` - Vẫn hoạt động

**Thêm tính năng mới:**

- Pagination headers
- Advanced filtering
- Sorting
- Search
- Relationships

## 7️⃣ Update Client Code

### Android Example

**Trước:**

```kotlin
@GET("api/restaurants")
suspend fun getRestaurants(
    @Query("categoryId") categoryId: Int?
): RestaurantResponse
```

**Sau (Enhanced):**

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
    @Query("q") search: String? = null,
    @Query("_embed") embed: String? = null
): RestaurantResponse
```

**Response Model:**

```kotlin
data class RestaurantResponse(
    val success: Boolean,
    val count: Int,
    val data: List<Restaurant>,
    val pagination: Pagination
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

### iOS Example

```swift
struct RestaurantResponse: Codable {
    let success: Bool
    let count: Int
    let data: [Restaurant]
    let pagination: Pagination
}

struct Pagination: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
    let hasNext: Bool
    let hasPrev: Bool
}
```

## 8️⃣ Performance Tips

### Database Optimization

**1. Index quan trọng** (Nếu chuyển sang SQL sau này):

```sql
CREATE INDEX idx_restaurant_category ON restaurants(categoryId);
CREATE INDEX idx_restaurant_rating ON restaurants(rating);
CREATE INDEX idx_product_restaurant ON products(restaurantId);
CREATE INDEX idx_product_price ON products(price);
CREATE INDEX idx_order_user ON orders(userId);
CREATE INDEX idx_order_status ON orders(status);
```

**2. Cache strategy:**

- Cache danh sách categories (ít thay đổi)
- Cache top restaurants (TTL 5 phút)
- Không cache orders (realtime data)

**3. Query optimization:**

- Limit default = 10 (không quá lớn)
- Max limit = 100
- Use pagination cho lists
- Avoid \_embed cho large datasets

## 9️⃣ Common Issues

### Issue 1: Headers không hiển thị

**Nguyên nhân:** CORS không expose headers

**Fix:** Thêm vào `server.js`

```javascript
app.use(
  cors({
    exposedHeaders: ["X-Total-Count", "X-Total-Pages", "X-Current-Page", "X-Per-Page", "Link"],
  })
);
```

### Issue 2: Pagination không chính xác

**Nguyên nhân:** Filter áp dụng sau pagination

**Fix:** Đã fix trong `database.js` - filter trước, pagination sau

### Issue 3: Type conversion

**Nguyên nhân:** Query params là string

**Fix:** Đã xử lý trong `query.middleware.js`:

```javascript
// Auto convert
"123" -> 123 (number)
"true" -> true (boolean)
```

## 🔟 Rollback Plan

Nếu có vấn đề, rollback bằng cách:

```bash
# 1. Restore database.js
cp config/database.js.backup config/database.js

# 2. Restore controllers
git checkout controllers/

# 3. Remove middleware
rm middleware/query.middleware.js

# 4. Restore server.js
git checkout server.js

# 5. Restart
npm run dev
```

## ✅ Verification Checklist

Sau khi migrate, verify:

- [ ] Server khởi động không lỗi
- [ ] Pagination headers hiển thị đúng
- [ ] Filter operators hoạt động (\_gte, \_lte, \_ne, \_like)
- [ ] Sorting đúng (asc/desc)
- [ ] Full-text search hoạt động
- [ ] Relationships (\_embed, \_expand) đúng
- [ ] Authentication vẫn hoạt động
- [ ] Backward compatibility OK
- [ ] Performance acceptable
- [ ] Client code updated và test OK

## 📞 Support

Nếu gặp vấn đề:

1. Check logs: `npm run dev` (xem console)
2. Test với cURL trước
3. Verify middleware order trong server.js
4. Check database.js methods

---

**Estimated Migration Time:** 30-60 phút

**Difficulty:** Medium

**Risk:** Low (backward compatible)
