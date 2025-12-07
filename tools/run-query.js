require('dotenv').config();
const db = require('../config/database');

/**
 * 🛠️ Tool chạy Raw SQL Query cho MySQL/PostgreSQL
 * * Cách dùng:
 * 1. Chạy mặc định (SELECT * FROM users LIMIT 5):
 * node run-query.js
 * * 2. Chạy câu query tùy chỉnh:
 * node run-query.js "SELECT * FROM orders WHERE total > 50000"
 */

const run = async () => {
  // Lấy câu query từ tham số dòng lệnh (nếu có), mặc định lấy 5 user
  const query = process.argv[2] || 'SELECT * FROM users LIMIT 5';
  const dbType = process.env.DB_CONNECTION || 'json';

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║             🚀 SQL QUERY RUNNER                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Database Type: ${dbType.toUpperCase()}`);
  console.log(`🔍 Query: "${query}"`);

  // Kiểm tra loại database
  if (dbType === 'json') {
    console.log('\n❌ Lỗi: Script này chỉ hỗ trợ MySQL hoặc PostgreSQL.');
    console.log('   Vui lòng cấu hình DB_CONNECTION trong file .env');
    process.exit(1);
  }

  try {
    // Đợi một chút để kết nối DB được thiết lập (nếu cần)
    if (!db.pool) {
      console.log('⏳ Waiting for database connection...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!db.pool) {
      throw new Error('Không thể kết nối tới Database Pool. Kiểm tra cấu hình .env');
    }

    let result;
    console.log('\n⚡ Executing...');

    // Thực thi query tùy theo loại DB
    const start = Date.now();

    if (dbType === 'mysql') {
      // MySQL trả về [rows, fields]
      const [rows] = await db.pool.query(query);
      result = rows;
    } else if (dbType === 'postgresql') {
      // PostgreSQL trả về object có thuộc tính rows
      const res = await db.pool.query(query);
      result = res.rows;
    }

    const time = Date.now() - start;

    // Hiển thị kết quả
    console.log(`✅ Success in ${time}ms`);
    console.log(`📊 Rows returned: ${result.length}\n`);

    if (result.length > 0) {
      console.table(result);
    } else {
      console.log('(No data returned)');
    }

  } catch (error) {
    console.error('\n❌ Query Error:', error.message);
    if (error.code) console.error('   Code:', error.code);
    if (error.position) console.error('   Position:', error.position);
  } finally {
    // Đóng kết nối để thoát script
    if (db.pool) {
      await db.pool.end();
      console.log('\n🔌 Connection closed.');
    }
    process.exit(0);
  }
};

run();