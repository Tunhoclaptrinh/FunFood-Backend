const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class PostgreSQLAdapter {
  constructor() {
    this.pool = null;
    this.schemas = {};

    // Relation mapping (giống MongoAdapter)
    this.relations = {
      restaurants: {
        products: { ref: 'products', localField: 'id', foreignField: 'restaurant_id' },
        reviews: { ref: 'reviews', localField: 'id', foreignField: 'restaurant_id' }
      },
      users: {
        orders: { ref: 'orders', localField: 'id', foreignField: 'user_id' }
      },
      products: {
        restaurant: { ref: 'restaurants', localField: 'restaurant_id', foreignField: 'id', justOne: true },
        category: { ref: 'categories', localField: 'category_id', foreignField: 'id', justOne: true }
      },
      orders: {
        user: { ref: 'users', localField: 'user_id', foreignField: 'id', justOne: true },
        restaurant: { ref: 'restaurants', localField: 'restaurant_id', foreignField: 'id', justOne: true }
      }
    };

    this.initConnection();
    this.loadSchemas();
  }

  async initConnection() {
    try {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Test connection
      const client = await this.pool.connect();
      console.log('🐘 PostgreSQL Adapter Connected');
      client.release();

      // Create tables if not exist
      await this.createTables();
    } catch (error) {
      console.error('❌ PostgreSQL Connection Error:', error);
      throw error;
    }
  }

  loadSchemas() {
    const schemasDir = path.join(__dirname, '../schemas');
    if (!fs.existsSync(schemasDir)) return;

    const files = fs.readdirSync(schemasDir);
    files.forEach(file => {
      if (file === 'index.js') return;

      const entityName = file.replace('.schema.js', 's');
      const schemaDef = require(path.join(schemasDir, file));
      this.schemas[entityName] = schemaDef;
    });
  }

  async createTables() {
    const client = await this.pool.connect();

    try {
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(15),
          avatar TEXT,
          address TEXT,
          role VARCHAR(20) DEFAULT 'customer',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        )
      `);

      // Categories table
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          icon VARCHAR(10),
          image TEXT,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Restaurants table
      await client.query(`
        CREATE TABLE IF NOT EXISTS restaurants (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          category_id INTEGER REFERENCES categories(id),
          address VARCHAR(200),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          phone VARCHAR(15),
          image TEXT,
          rating DECIMAL(2, 1) DEFAULT 0,
          total_reviews INTEGER DEFAULT 0,
          delivery_fee INTEGER DEFAULT 15000,
          delivery_time VARCHAR(50),
          open_time TIME,
          close_time TIME,
          is_open BOOLEAN DEFAULT true,
          manager_id INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Products table
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
          category_id INTEGER REFERENCES categories(id),
          price INTEGER NOT NULL,
          image TEXT,
          available BOOLEAN DEFAULT true,
          discount INTEGER DEFAULT 0,
          rating DECIMAL(2, 1) DEFAULT 0,
          total_reviews INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Orders table
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          restaurant_id INTEGER REFERENCES restaurants(id),
          items JSONB NOT NULL,
          subtotal INTEGER NOT NULL,
          delivery_fee INTEGER NOT NULL,
          discount INTEGER DEFAULT 0,
          total INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          payment_status VARCHAR(20) DEFAULT 'pending',
          payment_method VARCHAR(20),
          delivery_address TEXT NOT NULL,
          delivery_latitude DECIMAL(10, 8),
          delivery_longitude DECIMAL(11, 8),
          estimated_distance DECIMAL(10, 2),
          estimated_delivery_time VARCHAR(50),
          note TEXT,
          promotion_code VARCHAR(20),
          promotion_id INTEGER,
          shipper_id INTEGER REFERENCES users(id),
          assigned_at TIMESTAMP,
          confirmed_at TIMESTAMP,
          preparing_at TIMESTAMP,
          delivering_at TIMESTAMP,
          delivered_at TIMESTAMP,
          cancelled_at TIMESTAMP,
          cancelled_by INTEGER,
          cancel_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Cart table
      await client.query(`
        CREATE TABLE IF NOT EXISTS cart (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, product_id)
        )
      `);

      // Favorites table
      await client.query(`
        CREATE TABLE IF NOT EXISTS favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(20) NOT NULL,
          reference_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, type, reference_id)
        )
      `);

      // Reviews table
      await client.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          order_id INTEGER REFERENCES orders(id),
          type VARCHAR(20) NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Promotions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS promotions (
          id SERIAL PRIMARY KEY,
          code VARCHAR(20) UNIQUE NOT NULL,
          description TEXT,
          discount_type VARCHAR(20) NOT NULL,
          discount_value INTEGER NOT NULL,
          min_order_value INTEGER DEFAULT 0,
          max_discount INTEGER,
          valid_from TIMESTAMP NOT NULL,
          valid_to TIMESTAMP NOT NULL,
          usage_limit INTEGER,
          per_user_limit INTEGER,
          usage_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Addresses table
      await client.query(`
        CREATE TABLE IF NOT EXISTS addresses (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          label VARCHAR(50),
          address VARCHAR(200) NOT NULL,
          recipient_name VARCHAR(100) NOT NULL,
          recipient_phone VARCHAR(15) NOT NULL,
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          note TEXT,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Notifications table
      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(20) NOT NULL,
          ref_id INTEGER,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      try {
        await client.query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_products_restaurant_id ON products(restaurant_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');

        console.log('✅ PostgreSQL indexes created');
      } catch (indexError) {
        console.warn('⚠️  Some indexes already exist or could not be created');
      }

      console.log('✅ PostgreSQL tables created/verified');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== CASE CONVERSION ====================

  /**
   * Convert snake_case to camelCase
   */
  toCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.toCamelCase(item));

    const camelObj = {};
    for (const [key, value] of Object.entries(obj)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

      // Recursively convert nested objects, but not JSONB fields
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        camelObj[camelKey] = this.toCamelCase(value);
      } else {
        camelObj[camelKey] = value;
      }
    }
    return camelObj;
  }

  /**
   * Convert camelCase to snake_case (FIXED)
   */
  toSnakeCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.toSnakeCase(item));

    const snakeObj = {};
    for (const [key, value] of Object.entries(obj)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

      // Don't convert JSONB fields (items, payment_data, etc.)
      if (key === 'items' || key === 'paymentData' || value instanceof Date) {
        snakeObj[snakeKey] = value;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Only convert if it's a plain object, not Date or Buffer
        snakeObj[snakeKey] = this.toSnakeCase(value);
      } else {
        snakeObj[snakeKey] = value;
      }
    }
    return snakeObj;
  }

  // ==================== FIND ALL ADVANCED ====================

  async findAllAdvanced(collection, options = {}) {
    const client = await this.pool.connect();

    try {
      const { filter = {}, page = 1, limit = 10, sort, order = 'asc', q } = options;

      let query = `SELECT * FROM ${collection} WHERE 1=1`;
      const params = [];
      let paramCount = 1;

      // Apply filters (FIXED: Better handling for null filter)
      if (filter) {
        for (const [key, value] of Object.entries(filter)) {
          // Handle operators
          if (key.endsWith('_gte')) {
            const field = this.camelToSnake(key.replace('_gte', ''));
            query += ` AND ${field} >= $${paramCount}`;
            params.push(value);
            paramCount++;
          } else if (key.endsWith('_lte')) {
            const field = this.camelToSnake(key.replace('_lte', ''));
            query += ` AND ${field} <= $${paramCount}`;
            params.push(value);
            paramCount++;
          } else if (key.endsWith('_ne')) {
            const field = this.camelToSnake(key.replace('_ne', ''));
            query += ` AND ${field} != $${paramCount}`;
            params.push(value);
            paramCount++;
          } else if (key.endsWith('_like')) {
            const field = this.camelToSnake(key.replace('_like', ''));
            query += ` AND ${field} ILIKE $${paramCount}`;
            params.push(`%${value}%`);
            paramCount++;
          } else if (key.endsWith('_in')) {
            const field = this.camelToSnake(key.replace('_in', ''));
            const values = typeof value === 'string' ? value.split(',') : value;
            query += ` AND ${field} = ANY($${paramCount})`;
            params.push(values);
            paramCount++;
          } else {
            // Regular filter - convert camelCase to snake_case
            const snakeKey = this.camelToSnake(key);
            query += ` AND ${snakeKey} = $${paramCount}`;
            params.push(value);
            paramCount++;
          }
        }
      }

      // Full-text search
      if (q) {
        query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        params.push(`%${q}%`);
        paramCount++;
      }

      // Count total (before pagination)
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Sorting (FIXED: Convert field names)
      if (sort) {
        const sortFields = sort.split(',');
        const orders = order.split(',');
        const sortClauses = sortFields.map((field, idx) => {
          const snakeField = this.camelToSnake(field);
          return `${snakeField} ${(orders[idx] || 'asc').toUpperCase()}`;
        });
        query += ` ORDER BY ${sortClauses.join(', ')}`;
      } else {
        query += ` ORDER BY created_at DESC`;
      }

      // Pagination
      const offset = (page - 1) * limit;
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      const result = await client.query(query, params);
      const data = result.rows.map(row => this.toCamelCase(row));

      return {
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('❌ findAllAdvanced error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== CRUD METHODS ====================

  async findAll(collection) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`SELECT * FROM ${collection} ORDER BY id`);
      return result.rows.map(row => this.toCamelCase(row));
    } catch (error) {
      console.error('❌ findAll error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== FIND BY ID ====================
  async findById(collection, id) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`SELECT * FROM ${collection} WHERE id = $1`, [id]);
      return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
    } catch (error) {
      console.error('❌ findById error:', error);
      return null;
    } finally {
      client.release();
    }
  }

  // ==================== FIND ONE ====================
  async findOne(collection, query) {
    const client = await this.pool.connect();
    try {
      const snakeQuery = this.toSnakeCase(query);
      const conditions = Object.keys(snakeQuery).map((key, idx) => `${key} = $${idx + 1}`);
      const values = Object.values(snakeQuery);

      const sql = `SELECT * FROM ${collection} WHERE ${conditions.join(' AND ')} LIMIT 1`;
      const result = await client.query(sql, values);

      return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
    } catch (error) {
      console.error('❌ findOne error:', error);
      return null;
    } finally {
      client.release();
    }
  }

  async findMany(collection, query) {
    const client = await this.pool.connect();
    try {
      const snakeQuery = this.toSnakeCase(query);

      if (Object.keys(snakeQuery).length === 0) {
        const result = await client.query(`SELECT * FROM ${collection}`);
        return result.rows.map(row => this.toCamelCase(row));
      }

      const conditions = Object.keys(snakeQuery).map((key, idx) => `${key} = $${idx + 1}`);
      const values = Object.values(snakeQuery);

      const sql = `SELECT * FROM ${collection} WHERE ${conditions.join(' AND ')}`;
      const result = await client.query(sql, values);

      return result.rows.map(row => this.toCamelCase(row));
    } catch (error) {
      console.error('❌ findMany error:', error);
      return [];
    } finally {
      client.release();
    }
  }

  async create(collection, data) {
    const client = await this.pool.connect();
    try {
      const snakeData = this.toSnakeCase(data);
      delete snakeData.id; // Let PostgreSQL auto-generate

      const keys = Object.keys(snakeData);
      const values = Object.values(snakeData);
      const placeholders = keys.map((_, idx) => `$${idx + 1}`);

      const sql = `
        INSERT INTO ${collection} (${keys.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      const result = await client.query(sql, values);
      return this.toCamelCase(result.rows[0]);
    } catch (error) {
      console.error('❌ create error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async update(collection, id, data) {
    const client = await this.pool.connect();
    try {
      const snakeData = this.toSnakeCase(data);
      delete snakeData.id; // Don't update ID
      snakeData.updated_at = new Date();

      const keys = Object.keys(snakeData);
      const values = Object.values(snakeData);
      const setClauses = keys.map((key, idx) => `${key} = $${idx + 1}`);

      const sql = `
        UPDATE ${collection}
        SET ${setClauses.join(', ')}
        WHERE id = $${keys.length + 1}
        RETURNING *
      `;

      const result = await client.query(sql, [...values, id]);
      return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
    } catch (error) {
      console.error('❌ update error:', error);
      return null;
    } finally {
      client.release();
    }
  }

  async delete(collection, id) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`DELETE FROM ${collection} WHERE id = $1`, [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('❌ delete error:', error);
      return false;
    } finally {
      client.release();
    }
  }

  async getNextId(collection) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`SELECT MAX(id) as max_id FROM ${collection}`);
      return (result.rows[0].max_id || 0) + 1;
    } catch (error) {
      console.error('❌ getNextId error:', error);
      return Date.now();
    } finally {
      client.release();
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convert single field from camelCase to snake_case
   */
  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert single field from snake_case to camelCase
   */
  snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  async applyRelations(items, collection, options) {
    if (!items || items.length === 0) return items;
    const resultItems = items.map(i => ({ ...i }));
    const client = await this.pool.connect();

    try {
      // 1. Expand
      if (options.expand) {
        const relations = options.expand.split(',');
        for (const relation of relations) {
          const foreignKey = `${relation}Id`;
          const idsToFetch = [...new Set(resultItems.map(item => item[foreignKey]).filter(id => id))];

          if (idsToFetch.length > 0) {
            const targetTable = relation + 's';
            // Postgres dùng $1, $2...
            const placeholders = idsToFetch.map((_, i) => `$${i + 1}`).join(',');
            const res = await client.query(`SELECT * FROM ${targetTable} WHERE id IN (${placeholders})`, idsToFetch);

            const map = {};
            res.rows.forEach(r => map[r.id] = this.toCamelCase(r));

            resultItems.forEach(item => {
              if (item[foreignKey]) item[relation] = map[item[foreignKey]] || null;
            });
          }
        }
      }

      // 2. Embed
      if (options.embed) {
        const relations = options.embed.split(',');
        for (const relation of relations) {
          let targetTable = relation;
          let foreignKey = collection.slice(0, -1) + 'Id';
          if (collection === 'orders' && relation === 'items') continue;

          const parentIds = resultItems.map(i => i.id);
          if (parentIds.length > 0) {
            const snakeFK = this.camelToSnake(foreignKey);
            const placeholders = parentIds.map((_, i) => `$${i + 1}`).join(',');

            const res = await client.query(
              `SELECT * FROM ${targetTable} WHERE ${snakeFK} IN (${placeholders})`,
              parentIds
            );

            const map = {};
            res.rows.forEach(r => {
              const converted = this.toCamelCase(r);
              const pId = converted[foreignKey];
              if (!map[pId]) map[pId] = [];
              map[pId].push(converted);
            });

            resultItems.forEach(item => {
              item[relation] = map[item.id] || [];
            });
          }
        }
      }
    } catch (e) {
      console.error("Apply relations error:", e);
    } finally {
      client.release();
    }

    return resultItems;
  }

  applyFilters(items, filters) {
    return items.filter(item => {
      return Object.keys(filters).every(key => {
        if (key.endsWith('_gte')) {
          const field = key.replace('_gte', '');
          return item[field] >= filters[key];
        }
        if (key.endsWith('_lte')) {
          const field = key.replace('_lte', '');
          return item[field] <= filters[key];
        }
        if (key.endsWith('_ne')) {
          const field = key.replace('_ne', '');
          return item[field] !== filters[key];
        }
        if (key.endsWith('_like')) {
          const field = key.replace('_like', '');
          const regex = new RegExp(filters[key], 'i');
          return regex.test(item[field]);
        }
        return item[key] == filters[key];
      });
    });
  }

  applyPagination(items, page = 1, limit = 10) {
    const total = items.length;
    const currentPage = Math.max(1, parseInt(page));
    const itemsPerPage = Math.max(1, parseInt(limit));
    const totalPages = Math.ceil(total / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      data: items.slice(startIndex, endIndex),
      page: currentPage,
      limit: itemsPerPage,
      total,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    };
  }

  saveData() {
    return true; // No-op for PostgreSQL
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new PostgreSQLAdapter();