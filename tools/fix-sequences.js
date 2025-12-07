require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixSequences() {
  const client = await pool.connect();
  try {
    const tables = [
      'users', 'categories', 'restaurants', 'products', 'orders',
      'cart', 'favorites', 'reviews', 'promotions', 'addresses', 'notifications'
    ];

    console.log('🔧 Fixing PostgreSQL sequences...');

    for (const table of tables) {
      try {
        // Query reset sequence về giá trị MAX(id) + 1
        await client.query(`
          SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM ${table};
        `);
        console.log(`✅ Fixed sequence for table: ${table}`);
      } catch (err) {
        console.log(`⚠️  Could not fix ${table} (might not have serial id or empty): ${err.message}`);
      }
    }
    console.log('🎉 All sequences fixed!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

fixSequences();