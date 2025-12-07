
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../database/db.json');

// Mật khẩu đã băm cho "123456"
const hashedPassword = bcrypt.hashSync('123456', 10);

// ==================== SEED DATA TEMPLATE ====================
const seedData = {
  "users": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@funfood.com",
      "password": "$2a$10$AYuy44CrHLUH.O7x8wnzU.tbq285fOoq1i.GW7MGkyF/lb0ufjY32",
      "phone": "0912345678",
      "avatar": "https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff",
      "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "lastLogin": "2024-10-26T08:00:00Z",
      "updatedAt": "2024-10-26T08:00:00Z"
    },
    {
      "id": 2,
      "name": "Nguyễn Văn An",
      "email": "user@funfood.com",
      "password": "$2a$10$AYuy44CrHLUH.O7x8wnzU.tbq285fOoq1i.GW7MGkyF/lb0ufjY32",
      "phone": "0987654321",
      "avatar": "/uploads/avatars/user-2-1764531138705.jpeg",
      "address": "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      "role": "customer",
      "isActive": true,
      "createdAt": "2024-02-20T14:20:00Z",
      "lastLogin": "2025-12-01T04:15:12.118Z",
      "updatedAt": "2025-11-30T19:59:21.300Z"
    },
    {
      "id": 3,
      "name": "Trần Thị B",
      "email": "customer@funfood.com",
      "password": "$2a$10$AYuy44CrHLUH.O7x8wnzU.tbq285fOoq1i.GW7MGkyF/lb0ufjY32",
      "phone": "0901234567",
      "avatar": "https://ui-avatars.com/api/?name=Tran+Thi+B&background=F59E0B&color=fff",
      "address": "789 Đường Lý Thường Kiệt, Quận 10, TP.HCM",
      "role": "customer",
      "isActive": true,
      "createdAt": "2024-03-10T09:15:00Z",
      "lastLogin": "2024-10-25T18:45:00Z",
      "updatedAt": "2024-10-25T18:45:00Z"
    },
    {
      "id": 4,
      "name": "Lê Văn C",
      "email": "le.van.c@funfood.com",
      "password": "$2a$10$AYuy44CrHLUH.O7x8wnzU.tbq285fOoq1i.GW7MGkyF/lb0ufjY32",
      "phone": "0905123456",
      "avatar": "https://ui-avatars.com/api/?name=Le+Van+C&background=EF4444&color=fff",
      "address": "246 Sư Vạn Hạnh, Quận 10, TP.HCM",
      "role": "customer",
      "isActive": true,
      "createdAt": "2024-04-10T11:00:00Z",
      "lastLogin": "2024-10-26T10:15:00Z",
      "updatedAt": "2024-10-26T10:15:00Z"
    },
    {
      "id": 5,
      "name": "Phạm Thị D",
      "email": "pham.thi.d@funfood.com",
      "password": "$2a$10$AYuy44CrHLUH.O7x8wnzU.tbq285fOoq1i.GW7MGkyF/lb0ufjY32",
      "phone": "0906789012",
      "avatar": "https://ui-avatars.com/api/?name=Pham+Thi+D&background=8B5CF6&color=fff",
      "address": "12 Nguyễn Oanh, Quận Gò Vấp, TP.HCM",
      "role": "customer",
      "isActive": true,
      "createdAt": "2024-05-15T16:30:00Z",
      "lastLogin": "2024-10-25T20:00:00Z",
      "updatedAt": "2024-10-25T20:00:00Z"
    },
    {
      "id": 6,
      "name": "Hoàng Minh (Shipper)",
      "email": "shipper@funfood.com",
      "password": "$2a$10$AYuy44CrHLUH.O7x8wnzU.tbq285fOoq1i.GW7MGkyF/lb0ufjY32",
      "phone": "0909999888",
      "avatar": "https://ui-avatars.com/api/?name=Hoang+Minh&background=F97316&color=fff",
      "address": "459 Âu Cơ, Quận Tân Bình, TP.HCM",
      "role": "shipper",
      "isActive": true,
      "createdAt": "2024-01-20T08:00:00Z",
      "lastLogin": "2024-10-26T10:20:00Z",
      "updatedAt": "2024-10-26T10:20:00Z"
    },
    {
      "id": 7,
      "name": "Quản Lý (Nhà Hàng Chay)",
      "email": "manager.chay@funfood.com",
      "password": "$2a$10$AYuy44CrHLUH.O7x8wnzU.tbq285fOoq1i.GW7MGkyF/lb0ufjY32",
      "phone": "0918888777",
      "avatar": "https://ui-avatars.com/api/?name=Manager&background=22C55E&color=fff",
      "address": "111 Nguyễn Trãi, Quận 5, TP.HCM",
      "role": "manager",
      "isActive": true,
      "createdAt": "2024-03-01T09:00:00Z",
      "lastLogin": "2024-10-25T15:00:00Z",
      "updatedAt": "2024-10-25T15:00:00Z"
    },
    {
      "id": 8,
      "email": "tn@ff.com",
      "password": "$2a$10$95FDrr2ZDLnglPgoQeb1ru/ID4gKdwsCrS65znbo6wlBclqXhDkia",
      "name": "tuan",
      "phone": "0123456789",
      "address": "",
      "avatar": "https://ui-avatars.com/api/?name=tuan&background=random",
      "role": "customer",
      "isActive": true,
      "createdAt": "2025-11-30T18:57:52.573Z",
      "lastLogin": "2025-11-30T18:58:33.633Z"
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "Cơm",
      "icon": "🍚",
      "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400"
    },
    {
      "id": 2,
      "name": "Phở",
      "icon": "🍜",
      "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400"
    },
    {
      "id": 3,
      "name": "Bánh mì",
      "icon": "🥖",
      "image": "https://images.unsplash.com/photo-1558030006-450675393462?w=400"
    },
    {
      "id": 4,
      "name": "Pizza",
      "icon": "🍕",
      "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"
    },
    {
      "id": 5,
      "name": "Burger",
      "icon": "🍔",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
    },
    {
      "id": 6,
      "name": "Đồ uống",
      "icon": "🥤",
      "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400"
    },
    {
      "id": 7,
      "name": "Tráng miệng",
      "icon": "🍰",
      "image": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400"
    },
    {
      "id": 8,
      "name": "Lẩu",
      "icon": "🍲",
      "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400"
    },
    {
      "id": 9,
      "name": "Đồ chay",
      "icon": "🥗",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
    },
    {
      "id": 10,
      "name": "Hải sản",
      "icon": "🦞",
      "image": "https://images.unsplash.com/photo-1559737558-b103c62391b5?w=400"
    },
    {
      "id": 11,
      "name": "Mì",
      "icon": "🍝",
      "image": "https://images.unsplash.com/photo-1551183053-bf942103f628?w=400"
    },
    {
      "id": 12,
      "name": "Lẩu & Nướng",
      "icon": "🔥",
      "image": "https://images.unsplash.com/photo-1628292416042-83b54d6f1a8e?w=400"
    }
  ],
  "restaurants": [
    {
      "id": 1,
      "name": "Quán Cơm Tấm Sườn Bì Chả",
      "description": "Cơm tấm truyền thống Sài Gòn với sườn nướng thơm ngon, bì giòn tan và chả trứng đậm đà",
      "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600",
      "rating": 4.5,
      "totalReviews": 128,
      "deliveryTime": "20-30 phút",
      "deliveryFee": 15000,
      "address": "789 Đường Lê Văn Sỹ, Phường 1, Quận Tân Bình, TP.HCM",
      "latitude": 20.9808954,
      "longitude": 105.7806283,
      "phone": "0283 1234567",
      "openTime": "06:00",
      "closeTime": "22:00",
      "isOpen": true,
      "categoryId": 1
    },
    {
      "id": 2,
      "name": "Phở Hà Nội",
      "description": "Phở bò chính gốc Hà Nội, nước dùng ninh từ xương trong nhiều giờ, thơm ngon đậm đà",
      "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600",
      "rating": 4.7,
      "totalReviews": 256,
      "deliveryTime": "25-35 phút",
      "deliveryFee": 20000,
      "address": "123 Đường Pasteur, Phường Bến Nghé, Quận 1, TP.HCM",
      "latitude": 10.7756,
      "longitude": 106.7019,
      "phone": "0283 7654321",
      "openTime": "06:30",
      "closeTime": "23:00",
      "isOpen": true,
      "categoryId": 2
    },
    {
      "id": 3,
      "name": "Bánh Mì Huỳnh Hoa",
      "description": "Bánh mì thập cẩm đặc biệt nổi tiếng khắp Sài Gòn với nhân đầy ắp",
      "image": "https://images.unsplash.com/photo-1558030006-450675393462?w=600",
      "rating": 4.8,
      "totalReviews": 512,
      "deliveryTime": "15-25 phút",
      "deliveryFee": 10000,
      "address": "456 Đường Lê Thị Riêng, Phường Bến Thành, Quận 1, TP.HCM",
      "latitude": 10.7691,
      "longitude": 106.6978,
      "phone": "0283 2345678",
      "openTime": "05:00",
      "closeTime": "21:00",
      "isOpen": true,
      "categoryId": 3
    },
    {
      "id": 4,
      "name": "Pizza 4P's",
      "description": "Pizza phong cách Nhật Bản với nguyên liệu tươi ngon, phô mai mozzarella tự làm",
      "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
      "rating": 4.6,
      "totalReviews": 342,
      "deliveryTime": "30-40 phút",
      "deliveryFee": 25000,
      "address": "222 Đường Nguyễn Thị Minh Khai, Phường 5, Quận 3, TP.HCM",
      "latitude": 10.7817,
      "longitude": 106.6909,
      "phone": "0283 3456789",
      "openTime": "10:00",
      "closeTime": "22:30",
      "isOpen": true,
      "categoryId": 4
    },
    {
      "id": 5,
      "name": "The Burger House",
      "description": "Burger Mỹ cao cấp với thịt bò Úc 100% nhập khẩu, sốt tự làm đặc biệt",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
      "rating": 4.4,
      "totalReviews": 189,
      "deliveryTime": "25-35 phút",
      "deliveryFee": 20000,
      "address": "555 Đường Điện Biên Phủ, Phường 21, Quận Bình Thạnh, TP.HCM",
      "latitude": 10.8014,
      "longitude": 106.7108,
      "phone": "0283 4567890",
      "openTime": "10:00",
      "closeTime": "23:00",
      "isOpen": true,
      "categoryId": 5
    },
    {
      "id": 6,
      "name": "Trà Sữa Gong Cha",
      "description": "Trà sữa Đài Loan chính hiệu với trân châu dai ngon, đồ uống đa dạng",
      "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600",
      "rating": 4.3,
      "totalReviews": 421,
      "deliveryTime": "15-20 phút",
      "deliveryFee": 10000,
      "address": "88 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
      "latitude": 10.7742,
      "longitude": 106.7035,
      "phone": "0283 5678901",
      "openTime": "08:00",
      "closeTime": "23:00",
      "isOpen": true,
      "categoryId": 6
    },
    {
      "id": 7,
      "name": "Lẩu Thái Tomyum",
      "description": "Lẩu Thái chuẩn vị với nước lẩu chua cay đậm đà, hải sản tươi sống",
      "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600",
      "rating": 4.5,
      "totalReviews": 203,
      "deliveryTime": "35-45 phút",
      "deliveryFee": 30000,
      "address": "333 Đường Cách Mạng Tháng 8, Phường 11, Quận 3, TP.HCM",
      "latitude": 10.7844,
      "longitude": 106.6769,
      "phone": "0283 6789012",
      "openTime": "11:00",
      "closeTime": "23:00",
      "isOpen": false,
      "categoryId": 8
    },
    {
      "id": 8,
      "name": "Nhà Hàng Chay An Lạc",
      "description": "Ẩm thực chay thanh tịnh, tốt cho sức khỏe. Đa dạng món lẩu nấm, cơm chiên, gỏi cuốn.",
      "image": "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=600",
      "rating": 4.8,
      "totalReviews": 152,
      "deliveryTime": "25-35 phút",
      "deliveryFee": 18000,
      "address": "246 Sư Vạn Hạnh, Phường 2, Quận 10, TP.HCM",
      "latitude": 10.7729,
      "longitude": 106.6698,
      "phone": "0283 8889999",
      "openTime": "08:00",
      "closeTime": "21:00",
      "isOpen": true,
      "categoryId": 9
    },
    {
      "id": 9,
      "name": "Hải Sản Biển Đông",
      "description": "Hải sản tươi sống, bắt tại hồ. Chuyên tôm hùm, cua rang me, hàu nướng phô mai.",
      "image": "https://images.unsplash.com/photo-1569091722979-8b432f831f6f?w=600",
      "rating": 4.6,
      "totalReviews": 210,
      "deliveryTime": "30-45 phút",
      "deliveryFee": 25000,
      "address": "120 Hoàng Diệu, Phường 12, Quận 4, TP.HCM",
      "latitude": 10.7554,
      "longitude": 106.7032,
      "phone": "0283 7776666",
      "openTime": "10:00",
      "closeTime": "23:00",
      "isOpen": true,
      "categoryId": 10
    },
    {
      "id": 10,
      "name": "Mì Ý Pasta Mania",
      "description": "Thiên đường mì Ý với các loại sốt đặc trưng: Carbonara, Bolognese, Pesto.",
      "image": "https://images.unsplash.com/photo-1595295433158-e4b02e0e3b6e?w=600",
      "rating": 4.4,
      "totalReviews": 95,
      "deliveryTime": "20-30 phút",
      "deliveryFee": 15000,
      "address": "55 Thảo Điền, Phường Thảo Điền, Quận 2, TP.HCM",
      "latitude": 10.8016,
      "longitude": 106.7329,
      "phone": "0283 5554444",
      "openTime": "09:00",
      "closeTime": "22:00",
      "isOpen": true,
      "categoryId": 11
    },
    {
      "id": 11,
      "name": "Cơm Gà Xối Mỡ 99",
      "description": "Cơm gà da giòn, xối mỡ hành thơm lừng. Kèm theo canh rong biển và gỏi.",
      "image": "https://images.unsplash.com/photo-1625037687820-2c7b5818d0f1?w=600",
      "rating": 4.5,
      "totalReviews": 320,
      "deliveryTime": "15-25 phút",
      "deliveryFee": 12000,
      "address": "150 Nguyễn Trãi, Phường 3, Quận 5, TP.HCM",
      "latitude": 10.7562,
      "longitude": 106.6713,
      "phone": "0283 2223333",
      "openTime": "07:00",
      "closeTime": "21:00",
      "isOpen": true,
      "categoryId": 1
    },
    {
      "id": 12,
      "name": "Nhà Hàng Sushi Tokyo",
      "description": "Sushi tươi ngon chuẩn Nhật, sashimi hảo hạng",
      "image": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600",
      "rating": 4.7,
      "totalReviews": 210,
      "deliveryTime": "25-35 phút",
      "deliveryFee": 20000,
      "address": "10 Đường Lý Tự Trọng, Quận 1, TP.HCM",
      "latitude": 10.7751,
      "longitude": 106.699,
      "phone": "0283 9998888",
      "openTime": "10:00",
      "closeTime": "22:00",
      "isOpen": true,
      "categoryId": 10
    },
    {
      "id": 13,
      "name": "Nhà Hàng Nhật Bản Ramen",
      "description": "Ramen nước dùng chuẩn Nhật, topping đầy đặn",
      "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
      "rating": 4.5,
      "totalReviews": 150,
      "deliveryTime": "20-30 phút",
      "deliveryFee": 15000,
      "address": "30 Đường Võ Văn Kiệt, Quận 1, TP.HCM",
      "latitude": 10.776,
      "longitude": 106.7,
      "phone": "0283 8887777",
      "openTime": "11:00",
      "closeTime": "21:30",
      "isOpen": true,
      "categoryId": 11
    }
  ],
  "products": [
    {
      "id": 1,
      "name": "Cơm Tấm Sườn Bì Chả",
      "description": "Cơm tấm với sườn nướng thơm lừng, bì giòn, chả trứng, kèm theo dưa leo và cà chua",
      "price": 45000,
      "image": "https://images.unsplash.com/photo-1603052875702-0010ad6ec0db?w=600",
      "restaurantId": 1,
      "categoryId": 1,
      "available": true,
      "discount": 0
    },
    {
      "id": 2,
      "name": "Cơm Tấm Sườn Nướng",
      "description": "Cơm tấm với sườn nướng mật ong, thơm ngon",
      "price": 35000,
      "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
      "restaurantId": 1,
      "categoryId": 1,
      "available": true,
      "discount": 10
    },
    {
      "id": 3,
      "name": "Cơm Tấm Bì Chả",
      "description": "Cơm tấm với bì và chả trứng đặc biệt",
      "price": 30000,
      "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600",
      "restaurantId": 1,
      "categoryId": 1,
      "available": true,
      "discount": 0
    },
    {
      "id": 4,
      "name": "Phở Bò Tái",
      "description": "Phở bò với thịt tái mềm, nước dùng trong ngọt",
      "price": 55000,
      "image": "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=600",
      "restaurantId": 2,
      "categoryId": 2,
      "available": true,
      "discount": 0
    },
    {
      "id": 5,
      "name": "Phở Bò Chín",
      "description": "Phở bò với thịt chín đậm đà",
      "price": 50000,
      "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600",
      "restaurantId": 2,
      "categoryId": 2,
      "available": true,
      "discount": 0
    },
    {
      "id": 6,
      "name": "Phở Gà",
      "description": "Phở gà thơm ngon, thanh đạm",
      "price": 45000,
      "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600",
      "restaurantId": 2,
      "categoryId": 2,
      "available": true,
      "discount": 15
    },
    {
      "id": 7,
      "name": "Bánh Mì Thập Cẩm",
      "description": "Bánh mì với đầy đủ topping: chả lụa, pate, thịt nguội, dưa góp",
      "price": 25000,
      "image": "https://images.unsplash.com/photo-1558030006-450675393462?w=600",
      "restaurantId": 3,
      "categoryId": 3,
      "available": true,
      "discount": 15
    },
    {
      "id": 8,
      "name": "Bánh Mì Xíu Mại",
      "description": "Bánh mì với xíu mại sốt cà chua",
      "price": 20000,
      "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
      "restaurantId": 3,
      "categoryId": 3,
      "available": true,
      "discount": 0
    },
    {
      "id": 9,
      "name": "Bánh Mì Pate",
      "description": "Bánh mì pate truyền thống Sài Gòn",
      "price": 15000,
      "image": "https://images.unsplash.com/photo-1558030006-450675393462?w=600",
      "restaurantId": 3,
      "categoryId": 3,
      "available": true,
      "discount": 0
    },
    {
      "id": 10,
      "name": "Pizza Margherita",
      "description": "Pizza phô mai mozzarella, sốt cà chua, húng quế tươi",
      "price": 180000,
      "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
      "restaurantId": 4,
      "categoryId": 4,
      "available": true,
      "discount": 20
    },
    {
      "id": 11,
      "name": "Pizza Pepperoni",
      "description": "Pizza với xúc xích pepperoni nhập khẩu",
      "price": 220000,
      "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
      "restaurantId": 4,
      "categoryId": 4,
      "available": true,
      "discount": 0
    },
    {
      "id": 12,
      "name": "Pizza Hải Sản",
      "description": "Pizza với tôm, mực, nghêu tươi sống",
      "price": 250000,
      "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
      "restaurantId": 4,
      "categoryId": 4,
      "available": true,
      "discount": 10
    },
    {
      "id": 13,
      "name": "Classic Beef Burger",
      "description": "Burger bò Úc 200g với phô mai cheddar, sốt đặc biệt",
      "price": 89000,
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
      "restaurantId": 5,
      "categoryId": 5,
      "available": true,
      "discount": 0
    },
    {
      "id": 14,
      "name": "Cheese Burger Deluxe",
      "description": "Burger phô mai đặc biệt với 2 lớp thịt bò",
      "price": 99000,
      "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
      "restaurantId": 5,
      "categoryId": 5,
      "available": true,
      "discount": 15
    },
    {
      "id": 15,
      "name": "Chicken Burger",
      "description": "Burger gà giòn rán với sốt mayonnaise",
      "price": 79000,
      "image": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600",
      "restaurantId": 5,
      "categoryId": 5,
      "available": true,
      "discount": 0
    },
    {
      "id": 16,
      "name": "Trà Sữa Trân Châu Đường Đen",
      "description": "Trà sữa trân châu đường đen thơm ngon, béo ngậy",
      "price": 45000,
      "image": "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600",
      "restaurantId": 6,
      "categoryId": 6,
      "available": true,
      "discount": 0
    },
    {
      "id": 17,
      "name": "Trà Đào Cam Sả",
      "description": "Trà đào cam sả tươi mát, giải nhiệt",
      "price": 40000,
      "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600",
      "restaurantId": 6,
      "categoryId": 6,
      "available": true,
      "discount": 10
    },
    {
      "id": 18,
      "name": "Sinh Tố Bơ",
      "description": "Sinh tố bơ thơm béo, bổ dưỡng",
      "price": 35000,
      "image": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600",
      "restaurantId": 6,
      "categoryId": 6,
      "available": true,
      "discount": 0
    },
    {
      "id": 19,
      "name": "Lẩu Tomyum Hải Sản",
      "description": "Lẩu Thái chua cay với tôm, mực, cá tươi sống",
      "price": 350000,
      "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600",
      "restaurantId": 7,
      "categoryId": 8,
      "available": true,
      "discount": 0
    },
    {
      "id": 20,
      "name": "Lẩu Thái Gà",
      "description": "Lẩu Thái với gà tươi, nấm các loại",
      "price": 280000,
      "image": "https://images.unsplash.com/photo-1606768666853-403c90a981ad?w=600",
      "restaurantId": 7,
      "categoryId": 8,
      "available": false,
      "discount": 5
    },
    {
      "id": 21,
      "name": "Lẩu Nấm Chay",
      "description": "Lẩu nấm chay thanh đạm, nước dùng ngọt từ rau củ, kèm nhiều loại nấm tươi",
      "price": 180000,
      "image": "https://images.unsplash.com/photo-1541832676-9b7e3b28521a?w=600",
      "restaurantId": 8,
      "categoryId": 9,
      "available": true,
      "discount": 10
    },
    {
      "id": 22,
      "name": "Cơm Chiên Rau Củ Chay",
      "description": "Cơm chiên với đậu hũ, chả chay, và các loại rau củ tươi: cà rốt, đậu que, bắp",
      "price": 45000,
      "image": "https://images.unsplash.com/photo-1582578304443-39c4f739551c?w=600",
      "restaurantId": 8,
      "categoryId": 9,
      "available": true,
      "discount": 0
    },
    {
      "id": 23,
      "name": "Tôm Hùm Nướng Phô Mai",
      "description": "Tôm hùm Canada (nửa con) nướng phô mai mozzarella béo ngậy",
      "price": 450000,
      "image": "https://images.unsplash.com/photo-1625943555530-d55c7a4d5b27?w=600",
      "restaurantId": 9,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 24,
      "name": "Cua Rang Me",
      "description": "Cua thịt (1 con 500g) rang sốt me chua ngọt đậm đà, kèm bánh mì",
      "price": 320000,
      "image": "https://images.unsplash.com/photo-1601666680450-a8d6b38c1097?w=600",
      "restaurantId": 9,
      "categoryId": 10,
      "available": true,
      "discount": 15
    },
    {
      "id": 25,
      "name": "Mì Ý Carbonara",
      "description": "Mì Ý sốt kem trứng, thịt xông khói, phô mai parmesan",
      "price": 125000,
      "image": "https://images.unsplash.com/photo-1621996346565-e326e2c14213?w=600",
      "restaurantId": 10,
      "categoryId": 11,
      "available": true,
      "discount": 0
    },
    {
      "id": 26,
      "name": "Mì Ý Bò Bằm (Bolognese)",
      "description": "Mì Ý sốt cà chua bò bằm hầm chậm, lá húng quế thơm",
      "price": 115000,
      "image": "https://images.unsplash.com/photo-1598866594240-a31c3c9e9021?w=600",
      "restaurantId": 10,
      "categoryId": 11,
      "available": true,
      "discount": 0
    },
    {
      "id": 27,
      "name": "Cơm Gà Xối Mỡ (Đùi)",
      "description": "Đùi gà góc tư da giòn rụm, xối mỡ hành, cơm chiên trứng",
      "price": 55000,
      "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
      "restaurantId": 11,
      "categoryId": 1,
      "available": true,
      "discount": 10
    },
    {
      "id": 28,
      "name": "Cơm Gà Luộc (Má Đùi)",
      "description": "Má đùi gà ta luộc, cơm nấu nước luộc gà, kèm gỏi và nước mắm gừng",
      "price": 45000,
      "image": "https://images.unsplash.com/photo-1617013800250-5e8a04b1e5f1?w=600",
      "restaurantId": 11,
      "categoryId": 1,
      "available": true,
      "discount": 0
    },
    {
      "id": 29,
      "name": "Combo Lẩu Thái Tomyum (2 người)",
      "description": "Set lẩu tomyum chua cay, gồm 200g ba chỉ bò, 200g hải sản (tôm, mực), vắt mì và rau nấm",
      "price": 299000,
      "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600",
      "restaurantId": 7,
      "categoryId": 8,
      "available": true,
      "discount": 10
    },
    {
      "id": 30,
      "name": "Trà Chanh Giã Tay",
      "description": "Trà chanh pha thủ công, hương vị đậm đà, giải khát",
      "price": 25000,
      "image": "https://images.unsplash.com/photo-1587080292723-c0817266c108?w=600",
      "restaurantId": 6,
      "categoryId": 6,
      "available": true,
      "discount": 0
    },
    {
      "id": 33,
      "name": "Sushi Cá Hồi",
      "description": "Sushi cá hồi tươi ngon chuẩn Nhật",
      "price": 90000,
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 34,
      "name": "Sushi Cá Ngừ",
      "description": "Sushi cá ngừ tươi, dai mềm",
      "price": 95000,
      "image": "https://images.unsplash.com/photo-1603052875480-44b6f89a1f4f?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 5
    },
    {
      "id": 35,
      "name": "Sushi Tôm",
      "description": "Sushi tôm tươi ngon, dai vừa phải",
      "price": 90000,
      "image": "https://images.unsplash.com/photo-1589307001296-6a9dc2c1151d?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 36,
      "name": "Sashimi Cá Hồi",
      "description": "Sashimi cá hồi tươi nguyên miếng",
      "price": 120000,
      "image": "https://images.unsplash.com/photo-1562967916-eb82221dfb36?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 10
    },
    {
      "id": 37,
      "name": "Sashimi Cá Ngừ",
      "description": "Sashimi cá ngừ tươi, thơm ngậy",
      "price": 125000,
      "image": "https://images.unsplash.com/photo-1603052875513-71f1bbd0a8ad?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 38,
      "name": "Ramen Tonkotsu",
      "description": "Ramen nước dùng xương heo đậm đà, thịt heo mềm",
      "price": 120000,
      "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
      "restaurantId": 13,
      "categoryId": 11,
      "available": true,
      "discount": 0
    },
    {
      "id": 39,
      "name": "Ramen Shoyu",
      "description": "Ramen nước dùng xì dầu Nhật Bản",
      "price": 110000,
      "image": "https://images.unsplash.com/photo-1605479569830-2a04e5c1c3de?w=600",
      "restaurantId": 13,
      "categoryId": 11,
      "available": true,
      "discount": 0
    },
    {
      "id": 40,
      "name": "Ramen Miso",
      "description": "Ramen nước dùng miso thơm ngon",
      "price": 115000,
      "image": "https://images.unsplash.com/photo-1605479569830-2a04e5c1c3de?w=600",
      "restaurantId": 13,
      "categoryId": 11,
      "available": true,
      "discount": 5
    },
    {
      "id": 41,
      "name": "Tempura Tôm",
      "description": "Tôm chiên tempura giòn rụm",
      "price": 90000,
      "image": "https://images.unsplash.com/photo-1589307001296-6a9dc2c1151d?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 42,
      "name": "Tempura Rau Củ",
      "description": "Rau củ chiên tempura giòn ngon",
      "price": 70000,
      "image": "https://images.unsplash.com/photo-1603052875513-71f1bbd0a8ad?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 43,
      "name": "Onigiri Cá Hồi",
      "description": "Cơm nắm nhân cá hồi Nhật Bản",
      "price": 35000,
      "image": "https://images.unsplash.com/photo-1603052875513-71f1bbd0a8ad?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 44,
      "name": "Onigiri Tôm",
      "description": "Cơm nắm nhân tôm Nhật Bản",
      "price": 35000,
      "image": "https://images.unsplash.com/photo-1603052875480-44b6f89a1f4f?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 45,
      "name": "Takoyaki",
      "description": "Bánh bạch tuộc chiên giòn nóng hổi",
      "price": 45000,
      "image": "https://images.unsplash.com/photo-1603052875480-44b6f89a1f4f?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 46,
      "name": "Gyoza",
      "description": "Bánh xếp Nhật Gyoza chiên giòn",
      "price": 60000,
      "image": "https://images.unsplash.com/photo-1605479569830-2a04e5c1c3de?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 47,
      "name": "Udon Thịt Heo",
      "description": "Mì Udon nước dùng ngon, thịt heo mềm",
      "price": 100000,
      "image": "https://images.unsplash.com/photo-1605479569830-2a04e5c1c3de?w=600",
      "restaurantId": 13,
      "categoryId": 11,
      "available": true,
      "discount": 0
    },
    {
      "id": 48,
      "name": "Udon Hải Sản",
      "description": "Mì Udon nước dùng hải sản",
      "price": 110000,
      "image": "https://images.unsplash.com/photo-1603052875513-71f1bbd0a8ad?w=600",
      "restaurantId": 13,
      "categoryId": 11,
      "available": true,
      "discount": 5
    },
    {
      "id": 49,
      "name": "Cơm Cá Hồi",
      "description": "Cơm Nhật kèm cá hồi nướng",
      "price": 120000,
      "image": "https://images.unsplash.com/photo-1603052875480-44b6f89a1f4f?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 50,
      "name": "Cơm Gà Teriyaki",
      "description": "Cơm Nhật kèm gà sốt Teriyaki",
      "price": 100000,
      "image": "https://images.unsplash.com/photo-1603052875480-44b6f89a1f4f?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 51,
      "name": "Cơm Cá Ngừ",
      "description": "Cơm Nhật kèm cá ngừ nướng sốt Teriyaki",
      "price": 110000,
      "image": "https://images.unsplash.com/photo-1603052875480-44b6f89a1f4f?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 5
    },
    {
      "id": 52,
      "name": "Cơm Tôm Tempura",
      "description": "Cơm Nhật kèm tôm chiên tempura",
      "price": 115000,
      "image": "https://images.unsplash.com/photo-1603052875480-44b6f89a1f4f?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 53,
      "name": "Donburi Thịt Heo",
      "description": "Cơm Nhật donburi thịt heo sốt Teriyaki",
      "price": 105000,
      "image": "https://images.unsplash.com/photo-1605479569830-2a04e5c1c3de?w=600",
      "restaurantId": 13,
      "categoryId": 11,
      "available": true,
      "discount": 0
    },
    {
      "id": 54,
      "name": "Donburi Hải Sản",
      "description": "Cơm Nhật donburi hải sản sốt Nhật",
      "price": 120000,
      "image": "https://images.unsplash.com/photo-1603052875513-71f1bbd0a8ad?w=600",
      "restaurantId": 13,
      "categoryId": 11,
      "available": true,
      "discount": 0
    },
    {
      "id": 55,
      "name": "Mì Soba Nóng",
      "description": "Mì soba nóng thơm ngon, nước dùng đậm vị",
      "price": 95000,
      "image": "https://images.unsplash.com/photo-1605479569830-2a04e5c1c3de?w=600",
      "restaurantId": 13,
      "categoryId": 11,
      "available": true,
      "discount": 0
    },
    {
      "id": 56,
      "name": "Mì Soba Lạnh",
      "description": "Mì soba lạnh mát, ăn kèm sốt đặc biệt",
      "price": 95000,
      "image": "https://images.unsplash.com/photo-1603052875513-71f1bbd0a8ad?w=600",
      "restaurantId": 13,
      "categoryId": 11,
      "available": true,
      "discount": 0
    },
    {
      "id": 57,
      "name": "Miso Soup",
      "description": "Canh miso Nhật Bản thanh nhẹ",
      "price": 35000,
      "image": "https://images.unsplash.com/photo-1589307001296-6a9dc2c1151d?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 58,
      "name": "Edamame",
      "description": "Đậu nành Nhật Bản luộc muối",
      "price": 40000,
      "image": "https://images.unsplash.com/photo-1603052875480-44b6f89a1f4f?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 59,
      "name": "Salad Rong Biển",
      "description": "Salad rong biển tươi ngon",
      "price": 50000,
      "image": "https://images.unsplash.com/photo-1603052875513-71f1bbd0a8ad?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    },
    {
      "id": 60,
      "name": "Matcha Ice Cream",
      "description": "Kem trà xanh Nhật Bản thơm mát",
      "price": 45000,
      "image": "https://images.unsplash.com/photo-1603052875480-44b6f89a1f4f?w=600",
      "restaurantId": 12,
      "categoryId": 10,
      "available": true,
      "discount": 0
    }
  ],
  "orders": [
    {
      "id": 1,
      "userId": 2,
      "restaurantId": 1,
      "items": [
        {
          "productId": 1,
          "productName": "Cơm Tấm Sườn Bì Chả",
          "quantity": 2,
          "price": 45000,
          "discount": 0
        },
        {
          "productId": 2,
          "productName": "Cơm Tấm Sườn Nướng",
          "quantity": 1,
          "price": 35000,
          "discount": 10
        }
      ],
      "subtotal": 121500,
      "deliveryFee": 15000,
      "discount": 0,
      "total": 136500,
      "status": "delivered",
      "deliveryAddress": "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      "deliveryLatitude": 10.7756,
      "deliveryLongitude": 106.7019,
      "paymentMethod": "cash",
      "note": "Không hành",
      "promotionCode": null,
      "createdAt": "2024-10-20T12:30:00Z",
      "updatedAt": "2024-10-20T13:15:00Z"
    },
    {
      "id": 2,
      "userId": 2,
      "restaurantId": 2,
      "items": [
        {
          "productId": 4,
          "productName": "Phở Bò Tái",
          "quantity": 1,
          "price": 55000,
          "discount": 0
        },
        {
          "productId": 5,
          "productName": "Phở Bò Chín",
          "quantity": 1,
          "price": 50000,
          "discount": 0
        }
      ],
      "subtotal": 105000,
      "deliveryFee": 20000,
      "discount": 10500,
      "total": 114500,
      "status": "delivering",
      "deliveryAddress": "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      "deliveryLatitude": 10.7756,
      "deliveryLongitude": 106.7019,
      "paymentMethod": "momo",
      "note": "",
      "promotionCode": "FUNFOOD10",
      "createdAt": "2024-10-26T08:45:00Z",
      "updatedAt": "2024-10-26T09:00:00Z"
    },
    {
      "id": 4,
      "userId": 2,
      "restaurantId": 4,
      "items": [
        {
          "productId": 10,
          "productName": "Pizza Margherita",
          "quantity": 1,
          "price": 180000,
          "discount": 20
        }
      ],
      "subtotal": 144000,
      "deliveryFee": 25000,
      "discount": 0,
      "total": 169000,
      "status": "pending",
      "deliveryAddress": "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      "deliveryLatitude": 10.7756,
      "deliveryLongitude": 106.7019,
      "paymentMethod": "card",
      "note": "Pizza cắt nhỏ",
      "promotionCode": null,
      "createdAt": "2024-10-26T10:00:00Z",
      "updatedAt": "2025-11-30T10:51:19.442Z",
      "paymentStatus": "cancelled",
      "cancelledAt": "2025-11-30T10:51:19.442Z",
      "cancelledBy": 2,
      "cancelReason": ""
    },
    {
      "id": 5,
      "userId": 4,
      "restaurantId": 8,
      "items": [
        {
          "productId": 21,
          "productName": "Lẩu Nấm Chay",
          "quantity": 1,
          "price": 180000,
          "discount": 10
        },
        {
          "productId": 22,
          "productName": "Cơm Chiên Rau Củ Chay",
          "quantity": 2,
          "price": 45000,
          "discount": 0
        }
      ],
      "subtotal": 252000,
      "deliveryFee": 18000,
      "discount": 0,
      "total": 270000,
      "status": "delivered",
      "deliveryAddress": "246 Sư Vạn Hạnh, Quận 10, TP.HCM",
      "deliveryLatitude": 10.7729,
      "deliveryLongitude": 106.6698,
      "paymentMethod": "card",
      "note": "Giao nhanh giúp mình, đồ ăn chay xin để riêng",
      "promotionCode": null,
      "createdAt": "2024-10-25T11:30:00Z",
      "updatedAt": "2024-10-25T12:10:00Z"
    },
    {
      "id": 6,
      "userId": 5,
      "restaurantId": 9,
      "items": [
        {
          "productId": 23,
          "productName": "Tôm Hùm Nướng Phô Mai",
          "quantity": 1,
          "price": 450000,
          "discount": 0
        }
      ],
      "subtotal": 450000,
      "deliveryFee": 25000,
      "discount": 50000,
      "total": 425000,
      "status": "delivering",
      "deliveryAddress": "12 Nguyễn Oanh, Quận Gò Vấp, TP.HCM",
      "deliveryLatitude": 10.8354,
      "deliveryLongitude": 106.6784,
      "paymentMethod": "momo",
      "note": "Chúc shipper buổi tối vui vẻ!",
      "promotionCode": "WELCOME50",
      "createdAt": "2024-10-26T10:30:00Z",
      "updatedAt": "2024-10-26T10:45:00Z"
    },
    {
      "id": 7,
      "userId": 2,
      "restaurantId": 11,
      "items": [
        {
          "productId": 27,
          "productName": "Cơm Gà Xối Mỡ (Đùi)",
          "quantity": 2,
          "price": 55000,
          "discount": 10
        }
      ],
      "subtotal": 99000,
      "deliveryFee": 12000,
      "discount": 19800,
      "total": 91200,
      "status": "confirmed",
      "deliveryAddress": "100 Đường Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP.HCM",
      "deliveryLatitude": 10.7881,
      "deliveryLongitude": 106.6983,
      "paymentMethod": "cash",
      "note": "Giao lên lầu 5, phòng 501. Cảm ơn.",
      "promotionCode": "WEEKEND20",
      "createdAt": "2024-10-26T10:50:00Z",
      "updatedAt": "2024-10-26T10:55:00Z"
    }
  ],
  "cart": [
    {
      "id": 1,
      "userId": 2,
      "productId": 13,
      "quantity": 2,
      "createdAt": "2024-10-26T09:30:00Z",
      "updatedAt": "2024-10-26T09:35:00Z"
    },
    {
      "id": 2,
      "userId": 2,
      "productId": 16,
      "quantity": 1,
      "createdAt": "2024-10-26T09:32:00Z",
      "updatedAt": "2024-10-26T09:32:00Z"
    },
    {
      "id": 3,
      "userId": 3,
      "productId": 4,
      "quantity": 1,
      "createdAt": "2024-10-26T08:15:00Z",
      "updatedAt": "2024-10-26T08:15:00Z"
    },
    {
      "id": 4,
      "userId": 4,
      "productId": 25,
      "quantity": 1,
      "createdAt": "2024-10-26T10:18:00Z",
      "updatedAt": "2024-10-26T10:18:00Z"
    },
    {
      "id": 5,
      "userId": 5,
      "productId": 27,
      "quantity": 2,
      "createdAt": "2024-10-26T08:30:00Z",
      "updatedAt": "2024-10-26T08:32:00Z"
    }
  ],
  "favorites": [
    {
      "id": 2,
      "userId": 2,
      "type": "restaurant",
      "referenceId": 3,
      "createdAt": "2024-10-18T14:30:00Z"
    },
    {
      "id": 3,
      "userId": 2,
      "type": "restaurant",
      "referenceId": 4,
      "createdAt": "2024-10-20T16:20:00Z"
    },
    {
      "id": 4,
      "userId": 2,
      "type": "product",
      "referenceId": 10,
      "createdAt": "2024-10-21T09:00:00Z"
    },
    {
      "id": 5,
      "userId": 2,
      "type": "product",
      "referenceId": 13,
      "createdAt": "2024-10-22T15:30:00Z"
    },
    {
      "id": 14,
      "userId": 2,
      "type": "restaurant",
      "referenceId": 11,
      "createdAt": "2024-10-26T11:00:00Z"
    },
    {
      "id": 6,
      "userId": 3,
      "type": "restaurant",
      "referenceId": 1,
      "createdAt": "2024-10-22T11:45:00Z"
    },
    {
      "id": 7,
      "userId": 3,
      "type": "restaurant",
      "referenceId": 6,
      "createdAt": "2024-10-23T09:00:00Z"
    },
    {
      "id": 8,
      "userId": 3,
      "type": "product",
      "referenceId": 4,
      "createdAt": "2024-10-23T14:20:00Z"
    },
    {
      "id": 9,
      "userId": 4,
      "type": "restaurant",
      "referenceId": 8,
      "createdAt": "2024-10-25T13:00:00Z"
    },
    {
      "id": 10,
      "userId": 4,
      "type": "product",
      "referenceId": 21,
      "createdAt": "2024-10-25T16:00:00Z"
    },
    {
      "id": 16,
      "userId": 4,
      "type": "product",
      "referenceId": 22,
      "createdAt": "2024-10-25T16:30:00Z"
    },
    {
      "id": 11,
      "userId": 5,
      "type": "restaurant",
      "referenceId": 9,
      "createdAt": "2024-10-26T10:50:00Z"
    },
    {
      "id": 12,
      "userId": 5,
      "type": "restaurant",
      "referenceId": 11,
      "createdAt": "2024-10-26T08:35:00Z"
    },
    {
      "id": 13,
      "userId": 5,
      "type": "product",
      "referenceId": 23,
      "createdAt": "2024-10-26T11:15:00Z"
    },
    {
      "id": 17,
      "userId": 5,
      "type": "product",
      "referenceId": 24,
      "createdAt": "2024-10-26T11:20:00Z"
    },
    {
      "id": 18,
      "userId": 2,
      "type": "restaurant",
      "referenceId": 1,
      "createdAt": "2025-11-30T16:18:13.170Z"
    },
    {
      "id": 19,
      "userId": 2,
      "type": "product",
      "referenceId": 8,
      "createdAt": "2025-12-01T03:44:21.142Z"
    },
    {
      "id": 20,
      "userId": 2,
      "type": "product",
      "referenceId": 1,
      "createdAt": "2025-12-01T09:19:01.868Z"
    }
  ],
  "reviews": [
    {
      "id": 1,
      "userId": 2,
      "restaurantId": 1,
      "orderId": 1,
      "type": "restaurant",
      "rating": 5,
      "comment": "Cơm tấm ngon tuyệt vời! Sườn nướng thơm lừng, bì giòn tan. Sẽ quay lại ủng hộ.",
      "createdAt": "2024-10-20T14:00:00Z",
      "updatedAt": "2024-10-20T14:00:00Z"
    },
    {
      "id": 2,
      "userId": 3,
      "restaurantId": 3,
      "orderId": null,
      "type": "restaurant",
      "rating": 4,
      "comment": "Bánh mì ngon nhưng hơi đợi lâu. Giá cả phải chăng, nhân đầy đặn.",
      "createdAt": "2024-10-22T16:30:00Z",
      "updatedAt": "2024-10-22T16:30:00Z"
    },
    {
      "id": 3,
      "userId": 2,
      "restaurantId": 2,
      "orderId": 2,
      "type": "restaurant",
      "rating": 5,
      "comment": "Phở rất ngon, nước dùng trong ngọt. Thịt bò tươi. Giao hàng nhanh!",
      "createdAt": "2024-10-26T09:30:00Z",
      "updatedAt": "2024-10-26T09:30:00Z"
    },
    {
      "id": 4,
      "userId": 3,
      "restaurantId": 6,
      "orderId": null,
      "type": "restaurant",
      "rating": 4,
      "comment": "Trà sữa ngon, trân châu dai. Nhưng hơi ngọt với mình.",
      "createdAt": "2024-10-24T15:45:00Z",
      "updatedAt": "2024-10-24T15:45:00Z"
    },
    {
      "id": 5,
      "userId": 4,
      "restaurantId": 8,
      "orderId": 5,
      "type": "restaurant",
      "rating": 5,
      "comment": "Đồ chay nhà hàng làm rất ngon, vị thanh đạm, vừa miệng. Lẩu nấm nhiều nấm tươi, rất hài lòng. Giao hàng cũng nhanh nữa.",
      "createdAt": "2024-10-25T13:00:00Z",
      "updatedAt": "2024-10-25T13:00:00Z"
    },
    {
      "id": 6,
      "userId": 2,
      "restaurantId": 1,
      "orderId": 1,
      "type": "restaurant",
      "rating": 4,
      "comment": "Lần này quay lại ăn thấy cơm hơi khô, nhưng sườn nướng vẫn ngon như ngày nào. Ship nhanh.",
      "createdAt": "2024-10-26T10:00:00Z",
      "updatedAt": "2024-10-26T10:00:00Z"
    }
  ],
  "promotions": [
    {
      "id": 1,
      "code": "FUNFOOD10",
      "description": "Giảm 10% cho đơn hàng từ 100,000đ",
      "discountType": "percentage",
      "discountValue": 10,
      "minOrderValue": 100000,
      "maxDiscount": 50000,
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": "2024-12-31T23:59:59Z",
      "usageLimit": null,
      "perUserLimit": null,
      "usageCount": 15,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-10-26T09:00:00Z"
    },
    {
      "id": 2,
      "code": "FREESHIP",
      "description": "Miễn phí ship cho đơn hàng từ 200,000đ",
      "discountType": "delivery",
      "discountValue": 100,
      "minOrderValue": 200000,
      "maxDiscount": 30000,
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": "2024-12-31T23:59:59Z",
      "usageLimit": 1000,
      "perUserLimit": 5,
      "usageCount": 234,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-10-25T18:30:00Z"
    },
    {
      "id": 3,
      "code": "WELCOME50",
      "description": "Giảm 50,000đ cho đơn hàng đầu tiên",
      "discountType": "fixed",
      "discountValue": 50000,
      "minOrderValue": 150000,
      "maxDiscount": 50000,
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": "2024-12-31T23:59:59Z",
      "usageLimit": null,
      "perUserLimit": 1,
      "usageCount": 89,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-10-24T12:15:00Z"
    },
    {
      "id": 4,
      "code": "WEEKEND20",
      "description": "Giảm 20% cho đơn hàng cuối tuần",
      "discountType": "percentage",
      "discountValue": 20,
      "minOrderValue": 80000,
      "maxDiscount": 100000,
      "validFrom": "2024-10-01T00:00:00Z",
      "validTo": "2024-10-31T23:59:59Z",
      "usageLimit": 500,
      "perUserLimit": 2,
      "usageCount": 123,
      "isActive": true,
      "createdAt": "2024-10-01T00:00:00Z",
      "updatedAt": "2024-10-26T08:00:00Z"
    },
    {
      "id": 5,
      "code": "OLDCODE",
      "description": "Mã cũ đã hết hạn",
      "discountType": "percentage",
      "discountValue": 15,
      "minOrderValue": 100000,
      "maxDiscount": 50000,
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": "2024-09-30T23:59:59Z",
      "usageLimit": 100,
      "perUserLimit": 1,
      "usageCount": 87,
      "isActive": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-10-01T00:00:00Z"
    },
    {
      "id": 6,
      "code": "VEGGIEDAY",
      "description": "Giảm 15% cho các món chay (áp dụng cho danh mục Đồ chay)",
      "discountType": "percentage",
      "discountValue": 15,
      "minOrderValue": 150000,
      "maxDiscount": 40000,
      "validFrom": "2024-10-01T00:00:00Z",
      "validTo": "2024-10-31T23:59:59Z",
      "usageLimit": 200,
      "perUserLimit": 1,
      "usageCount": 12,
      "isActive": true,
      "createdAt": "2024-10-01T00:00:00Z",
      "updatedAt": "2024-10-25T11:30:00Z"
    },
    {
      "id": 7,
      "code": "SEAFOOD",
      "description": "Giảm 40,000đ cho đơn hàng Hải sản từ 300,000đ",
      "discountType": "fixed",
      "discountValue": 40000,
      "minOrderValue": 300000,
      "maxDiscount": 40000,
      "validFrom": "2024-10-15T00:00:00Z",
      "validTo": "2024-11-15T23:59:59Z",
      "usageLimit": null,
      "perUserLimit": 2,
      "usageCount": 35,
      "isActive": true,
      "createdAt": "2024-10-15T00:00:00Z",
      "updatedAt": "2024-10-26T10:30:00Z"
    },
    {
      "id": 8,
      "code": "LUNCHTIME",
      "description": "Giảm 15,000đ cho đơn hàng đặt từ 11:00 - 13:00",
      "discountType": "fixed",
      "discountValue": 15000,
      "minOrderValue": 70000,
      "maxDiscount": 15000,
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": "2024-12-31T23:59:59Z",
      "usageLimit": null,
      "perUserLimit": null,
      "usageCount": 550,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-10-26T11:00:00Z"
    }
  ],
  "addresses": [
    {
      "id": 1,
      "userId": 2,
      "label": "Nhà",
      "address": "456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
      "recipientName": "Nguyễn Văn A",
      "recipientPhone": "0987654321",
      "latitude": 10.7756,
      "longitude": 106.7019,
      "note": "Gọi trước 5 phút khi đến",
      "isDefault": false,
      "createdAt": "2024-02-20T14:30:00Z",
      "updatedAt": "2025-12-01T02:26:24.558Z"
    },
    {
      "id": 2,
      "userId": 2,
      "label": "Công ty",
      "address": "100 Đường Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP.HCM",
      "recipientName": "Nguyễn Văn A",
      "recipientPhone": "0987654321",
      "latitude": 10.7881,
      "longitude": 106.6983,
      "note": "Tầng 5, phòng 501. Để ở bảo vệ nếu không có người",
      "isDefault": true,
      "createdAt": "2024-02-25T10:00:00Z",
      "updatedAt": "2025-12-01T02:32:35.391Z"
    },
    {
      "id": 3,
      "userId": 2,
      "label": "Nhà bạn gái",
      "address": "789 Đường Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM",
      "recipientName": "Trần Thị C",
      "recipientPhone": "0901111222",
      "latitude": 10.7903,
      "longitude": 106.6892,
      "note": "Nhấn chuông căn số 5",
      "isDefault": false,
      "createdAt": "2024-03-15T18:00:00Z",
      "updatedAt": "2025-11-30T20:03:55.808Z"
    },
    {
      "id": 4,
      "userId": 3,
      "label": "Nhà",
      "address": "789 Đường Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM",
      "recipientName": "Trần Thị B",
      "recipientPhone": "0901234567",
      "latitude": 10.7714,
      "longitude": 106.665,
      "note": "Nhà màu vàng, cổng sắt đen",
      "isDefault": true,
      "createdAt": "2024-03-10T09:30:00Z",
      "updatedAt": "2024-03-10T09:30:00Z"
    },
    {
      "id": 5,
      "userId": 3,
      "label": "Cơ quan",
      "address": "55 Đường Trần Hưng Đạo, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM",
      "recipientName": "Trần Thị B",
      "recipientPhone": "0901234567",
      "latitude": 10.7635,
      "longitude": 106.6897,
      "note": "Tòa nhà C, lầu 3",
      "isDefault": false,
      "createdAt": "2024-04-05T08:15:00Z",
      "updatedAt": "2024-04-05T08:15:00Z"
    },
    {
      "id": 6,
      "userId": 4,
      "label": "Nhà",
      "address": "246 Sư Vạn Hạnh, Phường 2, Quận 10, TP.HCM",
      "recipientName": "Lê Văn C",
      "recipientPhone": "0905123456",
      "latitude": 10.7729,
      "longitude": 106.6698,
      "note": "Hẻm bên cạnh nhà hàng chay An Lạc",
      "isDefault": true,
      "createdAt": "2024-04-10T11:05:00Z",
      "updatedAt": "2024-04-10T11:05:00Z"
    },
    {
      "id": 7,
      "userId": 5,
      "label": "Nhà",
      "address": "12 Nguyễn Oanh, Phường 7, Quận Gò Vấp, TP.HCM",
      "recipientName": "Phạm Thị D",
      "recipientPhone": "0906789012",
      "latitude": 10.8354,
      "longitude": 106.6784,
      "note": "Cổng màu xanh lá",
      "isDefault": true,
      "createdAt": "2024-05-15T16:35:00Z",
      "updatedAt": "2024-05-15T16:35:00Z"
    },
    {
      "id": 8,
      "userId": 6,
      "label": "Nhà",
      "address": "459 Âu Cơ, Phường Phú Trung, Quận Tân Bình, TP.HCM",
      "recipientName": "Hoàng Minh",
      "recipientPhone": "0909999888",
      "latitude": 10.7854,
      "longitude": 106.6432,
      "note": "",
      "isDefault": true,
      "createdAt": "2024-01-20T08:05:00Z",
      "updatedAt": "2024-01-20T08:05:00Z"
    }
  ],
  "notifications": [
    {
      "id": 1,
      "userId": 2,
      "title": "Đơn hàng đã được giao",
      "message": "Đơn hàng #1 của bạn đã được giao thành công. Cảm ơn bạn đã sử dụng FunFood!",
      "type": "order",
      "refId": 1,
      "isRead": true,
      "createdAt": "2024-10-20T13:15:00Z"
    },
    {
      "id": 2,
      "userId": 2,
      "title": "Đơn hàng đang giao",
      "message": "Shipper đang trên đường giao đơn hàng #2. Dự kiến 15 phút nữa sẽ đến.",
      "type": "order",
      "refId": 2,
      "isRead": false,
      "createdAt": "2024-10-26T09:00:00Z"
    },
    {
      "id": 3,
      "userId": 2,
      "title": "Khuyến mãi mới",
      "message": "Giảm 20% cho đơn hàng cuối tuần với mã WEEKEND20. Áp dụng đến hết tháng 10!",
      "type": "promotion",
      "refId": 4,
      "isRead": false,
      "createdAt": "2024-10-26T08:00:00Z"
    },
    {
      "id": 4,
      "userId": 3,
      "title": "Đơn hàng đã xác nhận",
      "message": "Đơn hàng #3 đã được xác nhận. Thời gian chuẩn bị dự kiến 20 phút.",
      "type": "order",
      "refId": 3,
      "isRead": true,
      "createdAt": "2024-10-26T09:20:00Z"
    },
    {
      "id": 5,
      "userId": 2,
      "title": "Nhà hàng yêu thích đang có ưu đãi",
      "message": "Phở Hà Nội - nhà hàng yêu thích của bạn đang giảm giá 15% hôm nay!",
      "type": "favorite",
      "refId": 2,
      "isRead": false,
      "createdAt": "2024-10-26T07:00:00Z"
    },
    {
      "id": 6,
      "userId": 4,
      "title": "Đơn hàng đã được giao",
      "message": "Đơn hàng #5 của bạn (Nhà Hàng Chay An Lạc) đã được giao thành công. Hãy đánh giá trải nghiệm nhé!",
      "type": "order",
      "refId": 5,
      "isRead": false,
      "createdAt": "2024-10-25T12:10:00Z"
    },
    {
      "id": 7,
      "userId": 5,
      "title": "Đơn hàng đang giao",
      "message": "Shipper Hoàng Minh đang trên đường giao đơn hàng #6. Chúc bạn ngon miệng!",
      "type": "order",
      "refId": 6,
      "isRead": false,
      "createdAt": "2024-10-26T10:45:00Z"
    },
    {
      "id": 8,
      "userId": 2,
      "title": "Đơn hàng đã xác nhận",
      "message": "Cơm Gà Xối Mỡ 99 đã xác nhận đơn hàng #7 của bạn. Đang chuẩn bị...",
      "type": "order",
      "refId": 7,
      "isRead": false,
      "createdAt": "2024-10-26T10:55:00Z"
    },
    {
      "id": 9,
      "userId": 4,
      "title": "Ăn chay thanh đạm",
      "message": "Giảm ngay 15% cho các món chay với mã VEGGIEDAY. Đừng bỏ lỡ!",
      "type": "promotion",
      "refId": 6,
      "isRead": false,
      "createdAt": "2024-10-25T09:00:00Z"
    }
  ]
};

// Hàm để seed database
function seedDatabase() {
  try {
    // Tạo thư mục database nếu chưa tồn tại
    const dbDir = path.join(__dirname, '../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Ghi dữ liệu seed vào db.json
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2));
    console.log('✅ JSON Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding JSON database:', error);
    throw error;
  }
}

// ==================== SEEDING FUNCTIONS ====================

/**
 * 1. Seed JSON Database (Ghi file db.json)
 */
function seedJSON() {
  try {
    const dbDir = path.join(__dirname, '../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Ghi đè file db.json với dữ liệu mới
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2));
    console.log('✅ JSON Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding JSON database:', error);
    throw error;
  }
}

/**
 * 2. Seed MongoDB Database
 */
async function seedMongoDB() {
  try {
    const db = require('../config/database');

    console.log('🔄 Clearing existing MongoDB data...');

    // Clear existing collections
    const collections = Object.keys(seedData);
    for (const collection of collections) {
      try {
        const Model = db.getModel(collection);
        if (Model) {
          await Model.deleteMany({});
          console.log(`   ✓ Cleared ${collection}`);
        }
      } catch (err) {
        console.log(`   ⚠️  Skip ${collection}: ${err.message}`);
      }
    }

    console.log('\n🔄 Inserting seed data...');

    // Insert seed data
    for (const [collection, items] of Object.entries(seedData)) {
      if (items.length === 0) continue;

      try {
        const Model = db.getModel(collection);
        if (!Model) {
          console.log(`   ⚠️  Model not found: ${collection}`);
          continue;
        }

        // Convert id to _id for MongoDB
        const mongoItems = items.map(item => {
          const { id, ...rest } = item;
          return { _id: id, ...rest };
        });

        await Model.insertMany(mongoItems);
        console.log(`   ✓ Inserted ${items.length} items into ${collection}`);
      } catch (err) {
        console.error(`   ❌ Error inserting ${collection}:`, err.message);
      }
    }

    console.log('\n✅ MongoDB seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding MongoDB:', error);
    throw error;
  }
}

/**
 * 3. Seed SQL Database (MySQL / PostgreSQL)
 */
/**
 * 3. Seed SQL Database (MySQL / PostgreSQL)
 */
/**
 * 3. Seed SQL Database (MySQL / PostgreSQL)
 */
async function seedSQL() {
  try {
    const db = require('../config/database');

    console.log('🔄 Clearing existing SQL data...');

    // 1. Xóa dữ liệu cũ
    const clearOrder = [
      'notifications', 'addresses', 'reviews', 'favorites', 'cart',
      'orders', 'products', 'restaurants', 'promotions', 'categories', 'users'
    ];

    for (const collection of clearOrder) {
      try {
        // Dùng DELETE FROM để xóa dữ liệu
        if (process.env.DB_CONNECTION === 'mysql') {
          await db.pool.query(`DELETE FROM ${collection}`);
          // Reset Auto Increment về 1 (quan trọng cho MySQL)
          try {
            await db.pool.query(`ALTER TABLE ${collection} AUTO_INCREMENT = 1`);
          } catch (e) { }
        } else {
          await db.pool.query(`TRUNCATE TABLE ${collection} CASCADE`);
        }
        console.log(`   ✓ Cleared ${collection}`);
      } catch (err) {
        console.log(`   ⚠️  Skip clearing ${collection}: ${err.message}`);
      }
    }

    console.log('\n🔄 Inserting seed data...');

    // Hàm insert thủ công để GIỮ NGUYÊN ID
    const insertRaw = async (collection, item) => {
      const snakeData = db.toSnakeCase(item); // Convert camelCase -> snake_case

      // Chuyển đổi dữ liệu đặc biệt
      const keys = Object.keys(snakeData);
      const values = Object.values(snakeData).map(val => {
        // Stringify JSON nếu cần
        if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
          return JSON.stringify(val);
        }
        return val;
      });

      if (process.env.DB_CONNECTION === 'mysql') {
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${collection} (${keys.join(', ')}) VALUES (${placeholders})`;
        await db.pool.execute(sql, values);
      } else {
        // PostgreSQL ($1, $2...)
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${collection} (${keys.join(', ')}) VALUES (${placeholders})`;
        await db.pool.query(sql, values);
      }
    };

    // 2. Insert dữ liệu mới
    const insertOrder = [
      'users', 'categories', 'promotions', 'restaurants', 'products',
      'orders', 'cart', 'favorites', 'reviews', 'addresses', 'notifications'
    ];

    for (const collection of insertOrder) {
      const items = seedData[collection];
      if (!items || items.length === 0) continue;

      try {
        let successCount = 0;
        for (const item of items) {
          try {
            // Clone item để không ảnh hưởng dữ liệu gốc
            const itemData = { ...item };

            // --- FIX DATE FORMAT (ISO String -> Date Object) ---
            if (collection === 'promotions') {
              if (itemData.validFrom) itemData.validFrom = new Date(itemData.validFrom);
              if (itemData.validTo) itemData.validTo = new Date(itemData.validTo);
            }
            if (collection === 'users' && itemData.lastLogin) {
              itemData.lastLogin = new Date(itemData.lastLogin);
            }
            if (collection === 'orders') {
              if (itemData.assignedAt) itemData.assignedAt = new Date(itemData.assignedAt);
              if (itemData.confirmedAt) itemData.confirmedAt = new Date(itemData.confirmedAt);
              if (itemData.preparingAt) itemData.preparingAt = new Date(itemData.preparingAt);
              if (itemData.deliveringAt) itemData.deliveringAt = new Date(itemData.deliveringAt);
              if (itemData.deliveredAt) itemData.deliveredAt = new Date(itemData.deliveredAt);
              if (itemData.cancelledAt) itemData.cancelledAt = new Date(itemData.cancelledAt);
            }
            // ---------------------------------------------------

            // Gọi hàm insert thủ công (bao gồm cả ID)
            await insertRaw(collection, itemData);
            successCount++;
          } catch (err) {
            console.error(`   ⚠️  Failed to insert item ${item.id} in ${collection}:`, err.message);
          }
        }
        console.log(`   ✓ Inserted ${successCount}/${items.length} items into ${collection}`);
      } catch (err) {
        console.error(`   ❌ Error inserting ${collection}:`, err.message);
      }
    }

    console.log('\n✅ SQL Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding SQL database:', error);
    throw error;
  }
}

/**
 * Main seed function
 */
async function seedDatabase() {
  try {
    const dbType = process.env.DB_CONNECTION || 'json';

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║          🌱 FunFood Database Seeder                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`📊 Database Type: ${dbType.toUpperCase()}\n`);

    let success = false;

    switch (dbType.toLowerCase()) {
      case 'json':
        // FIX: Gọi hàm seedJSON thay vì gọi đệ quy seedDatabase
        success = seedJSON();
        break;

      case 'mongodb':
        success = await seedMongoDB();
        setTimeout(() => process.exit(0), 1000);
        break;

      case 'mysql':
      case 'postgresql':
        success = await seedSQL();
        setTimeout(() => process.exit(0), 1000);
        break;

      default:
        console.error(`❌ Unknown database type: ${dbType}`);
        console.log('   Supported types: json, mongodb, mysql, postgresql');
        process.exit(1);
    }

    if (success) {
      console.log('\n📊 Seeded data summary:');
      console.log(`   - Users: ${seedData.users.length}`);
      console.log(`   - Categories: ${seedData.categories.length}`);
      console.log(`   - Restaurants: ${seedData.restaurants.length}`);
      console.log(`   - Products: ${seedData.products.length}`);

      console.log('\n🔑 Test accounts (Password: 123456):');
      console.log(`   Admin:    admin@funfood.com`);
      console.log(`   Customer: user@funfood.com`);
      console.log(`   Shipper:  shipper@funfood.com`);
      console.log(`   Manager:  manager.chay@funfood.com`);

      console.log('\n✨ Seeding completed successfully!\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

// ==================== CLI EXECUTION ====================

if (require.main === module) {
  // Load environment variables
  require('dotenv').config();

  seedDatabase().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase, seedData };