# 🍔 FunFood Backend API - Enhanced with JSON-Server Features

Backend API hoàn chỉnh cho ứng dụng đặt đồ ăn FunFood với đầy đủ tính năng của json-server.

## ✨ Tính năng mới

### 🎯 JSON-Server Style Features

- ✅ **Pagination** - Phân trang với `_page` và `_limit`
- ✅ **Sorting** - Sắp xếp với `_sort` và `_order`
- ✅ **Full-text Search** - Tìm kiếm với `q`
- ✅ **Filtering** - Lọc theo field: `?field=value`
- ✅ **Operators** - `_gte`, `_lte`, `_ne`, `_like`, `_in`
- ✅ **Relationships** - `_embed` và `_expand`
- ✅ **Custom Headers** - `X-Total-Count`, `Link`, etc.

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu trúc file mới

Thêm file `middleware/query.middleware.js`:

```javascript
// middleware/query.middleware.js
const {parseQuery, formatResponse, validateQuery, logQuery} = require("./query.middleware");
```

### 3. Cập nhật controllers

Thay thế các controller hiện tại bằng enhanced versions:

- `controllers/restaurant.controller.js`
- `controllers/product.controller.js`
- `controllers/order.controller.js`

### 4. Chạy server

```bash
# Development
npm run dev

# Production
npm start
```

Server chạy tại: `http://localhost:3000`

## 📖 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Xem docs

```
GET http://localhost:3000/api
```

## 🎨 Sử dụng

### 1. Phân trang (Pagination)

```bash
# Trang 1, 10 items
GET /api/restaurants?_page=1&_limit=10

# Hoặc dùng cú pháp ngắn
GET /api/restaurants?page=1&limit=10
```

**Response headers:**

```
X-Total-Count: 50
X-Total-Pages: 5
X-Current-Page: 1
X-Per-Page: 10
Link: <...>; rel="first", <...>; rel="next", <...>; rel="last"
```

### 2. Sắp xếp (Sorting)

```bash
# Sắp xếp theo rating giảm dần
GET /api/restaurants?_sort=rating&_order=desc

# Sắp xếp theo giá tăng dần
GET /api/products?_sort=price&_order=asc

# Sắp xếp nhiều trường
GET /api/products?_sort=price,name
```

### 3. Tìm kiếm (Search)

```bash
# Tìm kiếm full-text
GET /api/restaurants?q=pizza

# Kết hợp với filter
GET /api/products?q=cơm&categoryId=1
```

### 4. Lọc (Filtering)

#### Lọc đơn giản

```bash
GET /api/restaurants?categoryId=1
GET /api/products?available=true
GET /api/orders?status=delivered
```

#### Toán tử (\_gte, \_lte, \_ne)

```bash
# Giá >= 50000
GET /api/products?price_gte=50000

# Giá <= 100000
GET /api/products?price_lte=100000

# Khác 0 (có discount)
GET /api/products?discount_ne=0

# Khoảng giá
GET /api/products?price_gte=50000&price_lte=100000
```

#### Tìm kiếm gần đúng (\_like)

```bash
# Tên chứa "pizza"
GET /api/products?name_like=pizza
```

#### Tìm trong danh sách (\_in)

```bash
# Category 1, 2 hoặc 3
GET /api/products?categoryId_in=1,2,3

# Status pending hoặc confirmed
GET /api/orders?status_in=pending,confirmed
```

### 5. Quan hệ (Relationships)

#### Embed (Nhúng dữ liệu con)

```bash
# Restaurant với products
GET /api/restaurants/1?_embed=products

# Restaurant với products và reviews
GET /api/restaurants/1?_embed=products,reviews
```

#### Expand (Mở rộng foreign key)

```bash
# Product với restaurant info
GET /api/products/1?_expand=restaurant

# Product với restaurant và category
GET /api/products/1?_expand=restaurant,category
```

### 6. Kết hợp nhiều tính năng

```bash
# Tìm pizza, giá 100k-200k, sắp xếp, phân trang
GET /api/products?q=pizza&price_gte=100000&price_lte=200000&_sort=price&_order=asc&_page=1&_limit=10

# Restaurants đang mở, rating cao, kèm products
GET /api/restaurants?isOpen=true&rating_gte=4.5&_embed=products&_page=1&_limit=5

# Orders delivered, mới nhất trước
GET /api/orders?status=delivered&_sort=createdAt&_order=desc&_page=1&_limit=20
```

## 📋 Ví dụ thực tế

### Restaurants

```bash
# Top restaurants theo rating
curl "http://localhost:3000/api/restaurants?_sort=rating&_order=desc&_limit=10"

# Restaurants mở cửa, giao dưới 20k
curl "http://localhost:3000/api/restaurants?isOpen=true&deliveryFee_lte=20000"

# Tìm "phở" kèm menu
curl "http://localhost:3000/api/restaurants?q=phở&_embed=products"

# Category Cơm, rating >= 4.0, phân trang
curl "http://localhost:3000/api/restaurants?categoryId=1&rating_gte=4.0&_page=1&_limit=10"
```

### Products

```bash
# Products của restaurant 1
curl "http://localhost:3000/api/products?restaurantId=1"

# Món có giảm giá, sắp xếp theo % giảm
curl "http://localhost:3000/api/products?discount_ne=0&_sort=discount&_order=desc"

# Món ăn từ 30k-60k
curl "http://localhost:3000/api/products?price_gte=30000&price_lte=60000"

# Tìm "bánh mì" đang available với restaurant info
curl "http://localhost:3000/api/products?q=bánh mì&available=true&_expand=restaurant"

# Top 10 món đắt nhất
curl "http://localhost:3000/api/products?_sort=price&_order=desc&_limit=10"
```

### Orders

```bash
# Đơn hàng của tôi (cần auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/orders?_page=1&_limit=10"

# Đơn đang giao
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/orders?status=delivering"

# Đơn đã hoàn thành, mới nhất trước
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/orders?status=delivered&_sort=createdAt&_order=desc"

# Đơn >= 100k
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/orders?total_gte=100000"

# Admin: Tất cả đơn pending
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:3000/api/orders/all?status=pending&_page=1&_limit=50"
```

### Categories

```bash
# Tất cả categories
curl "http://localhost:3000/api/categories"

# Tìm category
curl "http://localhost:3000/api/categories?name_like=Pizza"
```

### Reviews

```bash
# Reviews của restaurant
curl "http://localhost:3000/api/reviews/restaurant/1"

# Reviews 5 sao
curl "http://localhost:3000/api/reviews?rating=5&_sort=createdAt&_order=desc"
```

## 🔐 Authentication

Các endpoint được bảo vệ cần JWT token:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Login và sử dụng token

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456"
  }'

# Response: { "token": "eyJhbGc..." }

# 2. Sử dụng token
curl http://localhost:3000/api/orders?_page=1 \
  -H "Authorization: Bearer eyJhbGc..."
```

## 📊 Response Format

### Thành công với pagination

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

### Headers

```
X-Total-Count: 50
X-Total-Pages: 5
X-Current-Page: 1
X-Per-Page: 10
Link: <http://...?_page=1>; rel="first", <http://...?_page=2>; rel="next", <http://...?_page=5>; rel="last"
```

### Thành công đơn giản

```json
{
  "success": true,
  "data": {...}
}
```

### Lỗi

```json
{
  "success": false,
  "message": "Error message",
  "errors": [...]
}
```

## 🎯 Query Parameters Reference

| Parameter          | Description                  | Example                        |
| ------------------ | ---------------------------- | ------------------------------ |
| `_page` / `page`   | Số trang (bắt đầu từ 1)      | `?_page=2`                     |
| `_limit` / `limit` | Số items mỗi trang (max 100) | `?_limit=20`                   |
| `_sort` / `sort`   | Trường sắp xếp               | `?_sort=price`                 |
| `_order` / `order` | Thứ tự: asc/desc             | `?_order=desc`                 |
| `q` / `_q`         | Tìm kiếm full-text           | `?q=pizza`                     |
| `_embed`           | Nhúng dữ liệu con            | `?_embed=products`             |
| `_expand`          | Mở rộng foreign key          | `?_expand=restaurant`          |
| `field`            | Lọc exact match              | `?categoryId=1`                |
| `field_gte`        | Greater than or equal        | `?price_gte=50000`             |
| `field_lte`        | Less than or equal           | `?price_lte=100000`            |
| `field_ne`         | Not equal                    | `?discount_ne=0`               |
| `field_like`       | Tìm kiếm gần đúng            | `?name_like=pizza`             |
| `field_in`         | Trong danh sách              | `?status_in=pending,confirmed` |

## 📱 Tích hợp Client

### Android (Kotlin + Retrofit)

```kotlin
interface ApiService {
    @GET("api/restaurants")
    suspend fun getRestaurants(
        @Query("_page") page: Int = 1,
        @Query("_limit") limit: Int = 10,
        @Query("_sort") sort: String? = "rating",
        @Query("_order") order: String? = "desc",
        @Query("categoryId") categoryId: Int? = null,
        @Query("isOpen") isOpen: Boolean? = null,
        @Query("rating_gte") minRating: Float? = null,
        @Query("q") search: String? = null,
        @Query("_embed") embed: String? = null
    ): RestaurantResponse

    @GET("api/products")
    suspend fun getProducts(
        @Query("restaurantId") restaurantId: Int? = null,
        @Query("categoryId") categoryId: Int? = null,
        @Query("price_gte") minPrice: Int? = null,
        @Query("price_lte") maxPrice: Int? = null,
        @Query("available") available: Boolean? = true,
        @Query("discount_ne") hasDiscount: Int? = null,
        @Query("_page") page: Int = 1,
        @Query("_limit") limit: Int = 20,
        @Query("_sort") sort: String? = "name",
        @Query("_expand") expand: String? = "restaurant"
    ): ProductResponse
}

// Usage
val restaurants = apiService.getRestaurants(
    page = 1,
    limit = 10,
    categoryId = 1,
    isOpen = true,
    minRating = 4.5f,
    embed = "products"
)
```

### iOS (Swift + Alamofire)

```swift
struct RestaurantAPI {
    static func getRestaurants(
        page: Int = 1,
        limit: Int = 10,
        categoryId: Int? = nil,
        isOpen: Bool? = nil,
        minRating: Double? = nil,
        search: String? = nil,
        embed: String? = nil,
        completion: @escaping (Result<RestaurantResponse, Error>) -> Void
    ) {
        var parameters: Parameters = [
            "_page": page,
            "_limit": limit,
            "_sort": "rating",
            "_order": "desc"
        ]

        if let categoryId = categoryId {
            parameters["categoryId"] = categoryId
        }
        if let isOpen = isOpen {
            parameters["isOpen"] = isOpen
        }
        if let minRating = minRating {
            parameters["rating_gte"] = minRating
        }
        if let search = search {
            parameters["q"] = search
        }
        if let embed = embed {
            parameters["_embed"] = embed
        }

        AF.request("http://localhost:3000/api/restaurants", parameters: parameters)
            .validate()
            .responseDecodable(of: RestaurantResponse.self) { response in
                completion(response.result)
            }
    }
}

// Usage
RestaurantAPI.getRestaurants(
    page: 1,
    limit: 10,
    categoryId: 1,
    isOpen: true,
    minRating: 4.5,
    embed: "products"
) { result in
    switch result {
    case .success(let response):
        print("Total: \(response.pagination.total)")
        print("Restaurants: \(response.data)")
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

### JavaScript (Fetch API)

```javascript
// Helper function
async function fetchAPI(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `http://localhost:3000/api/${endpoint}?${queryString}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  // Get pagination from headers
  const pagination = {
    total: response.headers.get("X-Total-Count"),
    totalPages: response.headers.get("X-Total-Pages"),
    currentPage: response.headers.get("X-Current-Page"),
    perPage: response.headers.get("X-Per-Page"),
  };

  return {...data, headers: pagination};
}

// Usage
const restaurants = await fetchAPI("restaurants", {
  _page: 1,
  _limit: 10,
  categoryId: 1,
  isOpen: true,
  rating_gte: 4.5,
  _embed: "products",
  _sort: "rating",
  _order: "desc",
});

console.log("Total restaurants:", restaurants.headers.total);
console.log("Data:", restaurants.data);
```

### React Hook Example

```javascript
import {useState, useEffect} from "react";

function useRestaurants(filters = {}) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetchAPI("restaurants", {
          _page: filters.page || 1,
          _limit: filters.limit || 10,
          ...filters,
        });
        setData(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters]);

  return {data, pagination, loading, error};
}

// Component usage
function RestaurantList() {
  const [page, setPage] = useState(1);
  const {data, pagination, loading} = useRestaurants({
    page,
    limit: 10,
    isOpen: true,
    _sort: "rating",
    _order: "desc",
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {data.map((restaurant) => (
        <RestaurantCard key={restaurant.id} {...restaurant} />
      ))}
      <Pagination current={pagination.page} total={pagination.totalPages} onChange={setPage} />
    </div>
  );
}
```

## 🧪 Testing

### Test với cURL

```bash
# Test pagination
curl -i "http://localhost:3000/api/restaurants?_page=1&_limit=5"

# Test filtering
curl "http://localhost:3000/api/products?price_gte=50000&price_lte=100000"

# Test search
curl "http://localhost:3000/api/restaurants?q=pizza"

# Test sorting
curl "http://localhost:3000/api/products?_sort=price&_order=desc&_limit=10"

# Test relationships
curl "http://localhost:3000/api/restaurants/1?_embed=products,reviews"

# Test complex query
curl "http://localhost:3000/api/products?restaurantId=1&available=true&discount_ne=0&_sort=discount&_order=desc&_page=1&_limit=20"
```

### Test với Postman

Import collection từ file `postman_collection.json` (tạo collection với các requests trên).

## 🎓 Best Practices

1. **Luôn sử dụng phân trang** cho danh sách
2. **Set limit hợp lý** (10-50 items)
3. **Kết hợp filter + search** cho kết quả chính xác
4. **Sử dụng \_expand** thay vì gọi nhiều API
5. **Cache results** khi có thể
6. **Đọc pagination headers** để hiển thị UI
7. **Handle errors** gracefully
8. **Use appropriate sort** cho user experience tốt hơn

## 🔧 Troubleshooting

### Lỗi thường gặp

**1. Pagination không hoạt động**

- Kiểm tra `_page` và `_limit` có đúng format số không
- Verify middleware được apply đúng thứ tự

**2. Filter không có kết quả**

- Check type của value (number vs string)
- Verify field name đúng với database schema

**3. Relationships không load**

- Kiểm tra `_embed` / `_expand` syntax
- Verify foreign key relationships trong database.js

**4. Headers không có pagination info**

- Ensure `formatResponse` middleware được apply
- Check CORS settings cho `Access-Control-Expose-Headers`

## 📚 Tài liệu tham khảo

- [JSON Server Documentation](https://github.com/typicode/json-server)
- [Express.js Guide](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

---

Made with ❤️ for FunFood App
