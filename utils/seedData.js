const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../database/db.json');

// Hashed password for "123456"
const hashedPassword = bcrypt.hashSync('123456', 10);

const seedData = {
  users: [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "admin@funfood.com",
      password: hashedPassword,
      phone: "0912345678",
      avatar: "https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      role: "admin",
      isActive: true,
      createdAt: "2024-01-15T10:30:00Z",
      lastLogin: new Date().toISOString()
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "user@funfood.com",
      password: hashedPassword,
      phone: "0987654321",
      avatar: "https://ui-avatars.com/api/?name=User&background=10B981&color=fff",
      address: "456 Đường XYZ, Quận 3, TP.HCM",
      role: "customer",
      isActive: true,
      createdAt: "2024-02-20T14:20:00Z",
      lastLogin: new Date().toISOString()
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "customer@funfood.com",
      password: hashedPassword,
      phone: "0901234567",
      avatar: "https://ui-avatars.com/api/?name=Customer&background=F59E0B&color=fff",
      address: "789 Đường DEF, Quận 5, TP.HCM",
      role: "customer",
      isActive: true,
      createdAt: "2024-03-10T09:15:00Z",
      lastLogin: new Date().toISOString()
    }
  ],

  categories: [
    { id: 1, name: "Cơm", icon: "🍚", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400" },
    { id: 2, name: "Phở", icon: "🍜", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400" },
    { id: 3, name: "Bánh mì", icon: "🥖", image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400" },
    { id: 4, name: "Pizza", icon: "🍕", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" },
    { id: 5, name: "Burger", icon: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { id: 6, name: "Đồ uống", icon: "🥤", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400" },
    { id: 7, name: "Tráng miệng", icon: "🍰", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400" },
    { id: 8, name: "Lẩu", icon: "🍲", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400" }
  ],

  restaurants: [
    {
      id: 1,
      name: "Quán Cơm Tấm Sườn Bì Chả",
      description: "Cơm tấm truyền thống Sài Gòn, nổi tiếng với sườn nướng thơm ngon",
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600",
      rating: 4.5,
      totalReviews: 128,
      deliveryTime: "20-30 phút",
      deliveryFee: 15000,
      address: "789 Đường Lê Văn Sỹ, Quận 3, TP.HCM",
      isOpen: true,
      categoryId: 1
    },
    {
      id: 2,
      name: "Phở Hà Nội",
      description: "Phở bò chính gốc Hà Nội, nước dùng ninh từ xương hàng giờ",
      image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600",
      rating: 4.7,
      totalReviews: 256,
      deliveryTime: "25-35 phút",
      deliveryFee: 20000,
      address: "123 Đường Pasteur, Quận 1, TP.HCM",
      isOpen: true,
      categoryId: 2
    },
    {
      id: 3,
      name: "Bánh Mì Huỳnh Hoa",
      description: "Bánh mì thập cẩm đặc biệt, nổi tiếng khắp Sài Gòn",
      image: "https://images.unsplash.com/photo-1558030006-450675393462?w=600",
      rating: 4.8,
      totalReviews: 512,
      deliveryTime: "15-25 phút",
      deliveryFee: 10000,
      address: "456 Đường Lê Thị Riêng, Quận 1, TP.HCM",
      isOpen: true,
      categoryId: 3
    },
    {
      id: 4,
      name: "Pizza 4P's",
      description: "Pizza phong cách Nhật Bản với nguyên liệu tươi ngon",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
      rating: 4.6,
      totalReviews: 342,
      deliveryTime: "30-40 phút",
      deliveryFee: 25000,
      address: "222 Đường Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
      isOpen: true,
      categoryId: 4
    },
    {
      id: 5,
      name: "The Burger House",
      description: "Burger Mỹ cao cấp với thịt bò Úc nhập khẩu",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
      rating: 4.4,
      totalReviews: 189,
      deliveryTime: "25-35 phút",
      deliveryFee: 20000,
      address: "555 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
      isOpen: true,
      categoryId: 5
    },
    {
      id: 6,
      name: "Trà Sữa Gong Cha",
      description: "Trà sữa Đài Loan chính hiệu, đồ uống đa dạng",
      image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600",
      rating: 4.3,
      totalReviews: 421,
      deliveryTime: "15-20 phút",
      deliveryFee: 10000,
      address: "88 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      isOpen: true,
      categoryId: 6
    }
  ],

  products: [
    // Cơm tấm
    { id: 1, name: "Cơm Tấm Sườn Bì Chả", description: "Cơm tấm với sườn nướng, bì, chả trứng", price: 45000, image: "https://images.unsplash.com/photo-1603052875702-0010ad6ec0db?w=600", restaurantId: 1, categoryId: 1, available: true, discount: 0 },
    { id: 2, name: "Cơm Tấm Sườn Nướng", description: "Cơm tấm với sườn nướng", price: 35000, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600", restaurantId: 1, categoryId: 1, available: true, discount: 10 },
    { id: 3, name: "Cơm Tấm Bì Chả", description: "Cơm tấm với bì và chả", price: 30000, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600", restaurantId: 1, categoryId: 1, available: true, discount: 0 },

    // Phở
    { id: 4, name: "Phở Bò Tái", description: "Phở bò với thịt tái", price: 55000, image: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=600", restaurantId: 2, categoryId: 2, available: true, discount: 0 },
    { id: 5, name: "Phở Bò Chín", description: "Phở bò với thịt chín", price: 50000, image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600", restaurantId: 2, categoryId: 2, available: true, discount: 0 },
    { id: 6, name: "Phở Gà", description: "Phở gà thơm ngon", price: 45000, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600", restaurantId: 2, categoryId: 2, available: true, discount: 15 },

    // Bánh mì
    { id: 7, name: "Bánh Mì Thập Cẩm", description: "Bánh mì với đầy đủ topping", price: 25000, image: "https://images.unsplash.com/photo-1558030006-450675393462?w=600", restaurantId: 3, categoryId: 3, available: true, discount: 15 },
    { id: 8, name: "Bánh Mì Xíu Mại", description: "Bánh mì với xíu mại", price: 20000, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", restaurantId: 3, categoryId: 3, available: true, discount: 0 },
    { id: 9, name: "Bánh Mì Pate", description: "Bánh mì pate truyền thống", price: 15000, image: "https://images.unsplash.com/photo-1558030006-450675393462?w=600", restaurantId: 3, categoryId: 3, available: true, discount: 0 },

    // Pizza
    { id: 10, name: "Pizza Margherita", description: "Pizza phô mai cà chua", price: 180000, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600", restaurantId: 4, categoryId: 4, available: true, discount: 20 },
    { id: 11, name: "Pizza Pepperoni", description: "Pizza xúc xích pepperoni", price: 220000, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600", restaurantId: 4, categoryId: 4, available: true, discount: 0 },
    { id: 12, name: "Pizza Hải Sản", description: "Pizza với tôm, mực, nghêu", price: 250000, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600", restaurantId: 4, categoryId: 4, available: true, discount: 10 },

    // Burger
    { id: 13, name: "Classic Beef Burger", description: "Burger bò cổ điển", price: 89000, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600", restaurantId: 5, categoryId: 5, available: true, discount: 0 },
    { id: 14, name: "Cheese Burger Deluxe", description: "Burger phô mai đặc biệt", price: 99000, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600", restaurantId: 5, categoryId: 5, available: true, discount: 15 },
    { id: 15, name: "Chicken Burger", description: "Burger gà giòn", price: 79000, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600", restaurantId: 5, categoryId: 5, available: true, discount: 0 },

    // Đồ uống
    { id: 16, name: "Trà Sữa Trân Châu", description: "Trà sữa trân châu đường đen", price: 45000, image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600", restaurantId: 6, categoryId: 6, available: true, discount: 0 },
    { id: 17, name: "Trà Đào Cam Sả", description: "Trà đào cam sả tươi mát", price: 40000, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600", restaurantId: 6, categoryId: 6, available: true, discount: 10 },
    { id: 18, name: "Sinh Tố Bơ", description: "Sinh tố bơ thơm béo", price: 35000, image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600", restaurantId: 6, categoryId: 6, available: true, discount: 0 }
  ],

  orders: [],
  cart: [],
  favorites: [],
  reviews: [],

  promotions: [
    {
      id: 1,
      code: "FUNFOOD10",
      description: "Giảm 10% cho đơn từ 100k",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 100000,
      maxDiscount: 50000,
      validFrom: "2024-01-01T00:00:00Z",
      validTo: "2025-12-31T23:59:59Z",
      usageLimit: null,
      perUserLimit: null,
      usageCount: 0,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      code: "FREESHIP",
      description: "Miễn phí ship cho đơn từ 200k",
      discountType: "delivery",
      discountValue: 100,
      minOrderValue: 200000,
      maxDiscount: 30000,
      validFrom: "2024-01-01T00:00:00Z",
      validTo: "2025-12-31T23:59:59Z",
      usageLimit: null,
      perUserLimit: 5,
      usageCount: 0,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z"
    },
    {
      id: 3,
      code: "WELCOME50",
      description: "Giảm 50k cho đơn đầu tiên",
      discountType: "fixed",
      discountValue: 50000,
      minOrderValue: 150000,
      maxDiscount: 50000,
      validFrom: "2024-01-01T00:00:00Z",
      validTo: "2025-12-31T23:59:59Z",
      usageLimit: null,
      perUserLimit: 1,
      usageCount: 0,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z"
    }
  ],

  addresses: [
    {
      id: 1,
      userId: 2,
      label: "Nhà",
      address: "456 Đường XYZ, Quận 3, TP.HCM",
      recipientName: "Trần Thị B",
      recipientPhone: "0987654321",
      latitude: 10.7769,
      longitude: 106.7009,
      note: "Gọi trước 5 phút",
      isDefault: true,
      createdAt: "2024-02-20T14:30:00Z"
    },
    {
      id: 2,
      userId: 2,
      label: "Công ty",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      recipientName: "Trần Thị B",
      recipientPhone: "0987654321",
      latitude: 10.7756,
      longitude: 106.7019,
      note: "Tầng 5, phòng 501",
      isDefault: false,
      createdAt: "2024-02-25T10:00:00Z"
    },
    {
      id: 3,
      userId: 3,
      label: "Nhà",
      address: "789 Đường DEF, Quận 5, TP.HCM",
      recipientName: "Lê Văn C",
      recipientPhone: "0901234567",
      latitude: 10.7544,
      longitude: 106.6648,
      note: "",
      isDefault: true,
      createdAt: "2024-03-10T09:30:00Z"
    }
  ],

  notifications: []
};

// Function to seed database
function seedDatabase() {
  try {
    // Create database directory if not exists
    const dbDir = path.join(__dirname, '../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Write seed data to db.json
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2));

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Seeded data:');
    console.log(`   - Users: ${seedData.users.length}`);
    console.log(`   - Categories: ${seedData.categories.length}`);
    console.log(`   - Restaurants: ${seedData.restaurants.length}`);
    console.log(`   - Products: ${seedData.products.length}`);
    console.log(`   - Promotions: ${seedData.promotions.length}`);
    console.log(`   - Addresses: ${seedData.addresses.length}`);
    console.log('\n🔑 Test accounts:');
    console.log('   Admin: admin@funfood.com / 123456');
    console.log('   User: user@funfood.com / 123456');
    console.log('   Customer: customer@funfood.com / 123456');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedData };