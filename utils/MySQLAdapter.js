const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

class MySQLAdapter {
  constructor() {
    this.pool = null;
    this.schemas = {};

    // JSONB fields that should NOT be converted (keep as-is)
    this.jsonFields = ['items', 'paymentData', 'refundData'];

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
      // Parse DATABASE_URL if provided (format: mysql://user:pass@host:port/db)
      let config;

      if (process.env.DATABASE_URL) {
        const url = new URL(process.env.DATABASE_URL);
        config = {
          host: url.hostname,
          port: url.port || 3306,
          user: url.username,
          password: url.password,
          database: url.pathname.slice(1),
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          timezone: '+00:00',
          dateStrings: false // IMPORTANT: Keep dates as Date objects
        };
      } else {
        config = {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'funfood',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          timezone: '+00:00',
          dateStrings: false
        };
      }

      this.pool = mysql.createPool(config);

      // Test connection
      const connection = await this.pool.getConnection();
      console.log('🐬 MySQL Adapter Connected');
      connection.release();

      // Create tables if not exist
      await this.createTables();
    } catch (error) {
      console.error('❌ MySQL Connection Error:', error);
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
    const connection = await this.pool.getConnection();

    try {
      // Users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(15),
          avatar TEXT,
          address TEXT,
          role VARCHAR(20) DEFAULT 'customer',
          is_active BOOLEAN DEFAULT true,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          last_login DATETIME NULL,
          INDEX idx_email (email),
          INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Categories table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          icon VARCHAR(10),
          image TEXT,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Restaurants table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS restaurants (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          category_id INT,
          address VARCHAR(200),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          phone VARCHAR(15),
          image TEXT,
          rating DECIMAL(2, 1) DEFAULT 0,
          total_reviews INT DEFAULT 0,
          delivery_fee INT DEFAULT 15000,
          delivery_time VARCHAR(50),
          open_time TIME,
          close_time TIME,
          is_open BOOLEAN DEFAULT true,
          manager_id INT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id),
          FOREIGN KEY (manager_id) REFERENCES users(id),
          INDEX idx_category (category_id),
          INDEX idx_location (latitude, longitude),
          INDEX idx_rating (rating)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Products table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          restaurant_id INT,
          category_id INT,
          price INT NOT NULL,
          image TEXT,
          available BOOLEAN DEFAULT true,
          discount INT DEFAULT 0,
          rating DECIMAL(2, 1) DEFAULT 0,
          total_reviews INT DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id),
          INDEX idx_restaurant (restaurant_id),
          INDEX idx_category (category_id),
          INDEX idx_available (available),
          INDEX idx_price (price)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Orders table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          restaurant_id INT,
          items JSON NOT NULL,
          subtotal INT NOT NULL,
          delivery_fee INT NOT NULL,
          discount INT DEFAULT 0,
          total INT NOT NULL,
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
          promotion_id INT,
          shipper_id INT,
          assigned_at DATETIME NULL,
          confirmed_at DATETIME NULL,
          preparing_at DATETIME NULL,
          delivering_at DATETIME NULL,
          delivered_at DATETIME NULL,
          cancelled_at DATETIME NULL,
          cancelled_by INT,
          cancel_reason TEXT,
          payment_data JSON,
          refund_data JSON,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
          FOREIGN KEY (shipper_id) REFERENCES users(id),
          INDEX idx_user (user_id),
          INDEX idx_restaurant (restaurant_id),
          INDEX idx_status (status),
          INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Cart, Favorites, Reviews, Promotions, Addresses, Notifications tables
      await connection.query(`
        CREATE TABLE IF NOT EXISTS cart (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          product_id INT,
          quantity INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          UNIQUE KEY unique_cart_item (user_id, product_id),
          INDEX idx_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Favorites table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS favorites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          type VARCHAR(20) NOT NULL,
          reference_id INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_favorite (user_id, type, reference_id),
          INDEX idx_user (user_id),
          INDEX idx_type (type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Reviews table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          restaurant_id INT,
          product_id INT,
          order_id INT,
          type VARCHAR(20) NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          INDEX idx_user (user_id),
          INDEX idx_restaurant (restaurant_id),
          INDEX idx_product (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Promotions table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS promotions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(20) UNIQUE NOT NULL,
          description TEXT,
          discount_type VARCHAR(20) NOT NULL,
          discount_value INT NOT NULL,
          min_order_value INT DEFAULT 0,
          max_discount INT,
          valid_from DATETIME NOT NULL,
          valid_to DATETIME NOT NULL,
          usage_limit INT,
          per_user_limit INT,
          usage_count INT DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_code (code),
          INDEX idx_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Addresses table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS addresses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          label VARCHAR(50),
          address VARCHAR(200) NOT NULL,
          recipient_name VARCHAR(100) NOT NULL,
          recipient_phone VARCHAR(15) NOT NULL,
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          note TEXT,
          is_default BOOLEAN DEFAULT false,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user (user_id),
          INDEX idx_default (is_default)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Notifications table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          title VARCHAR(100) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(20) NOT NULL,
          ref_id INT,
          is_read BOOLEAN DEFAULT false,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user (user_id),
          INDEX idx_read (is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log('✅ MySQL tables created/verified');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // ==================== DATETIME & JSON CONVERSION ====================

  /**
   * Convert JavaScript Date or ISO string to MySQL DATETIME format
   * MySQL format: 'YYYY-MM-DD HH:MM:SS'
   */
  toMySQLDateTime(value) {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);

    // Check if valid date
    if (isNaN(date.getTime())) return null;

    // Format: YYYY-MM-DD HH:MM:SS
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Convert MySQL DATETIME to ISO string for frontend
   */
  fromMySQLDateTime(value) {
    if (!value) return null;

    // MySQL returns datetime as string 'YYYY-MM-DD HH:MM:SS'
    // Convert to ISO format for frontend
    const date = new Date(value);
    return date.toISOString();
  }

  // ==================== CASE CONVERSION WITH JSON HANDLING ====================

  /**
   * Check if a field is a JSON field
   */
  isJsonField(key) {
    return this.jsonFields.includes(key);
  }

  /**
   * Convert snake_case to camelCase (with JSON field handling)
   */
  toCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.toCamelCase(item));

    const camelObj = {};
    for (const [key, value] of Object.entries(obj)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

      // Handle datetime fields
      if ((key.endsWith('_at') || key === 'created_at' || key === 'updated_at' || key === 'last_login') && value) {
        camelObj[camelKey] = this.fromMySQLDateTime(value);
      }
      // JSON fields - parse if string
      else if (this.isJsonField(camelKey) && typeof value === 'string') {
        try {
          camelObj[camelKey] = JSON.parse(value);
        } catch (e) {
          camelObj[camelKey] = value; // Keep as-is if parse fails
        }
      }
      // Nested objects (but not JSON fields or Dates)
      else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        camelObj[camelKey] = this.toCamelCase(value);
      }
      else {
        camelObj[camelKey] = value;
      }
    }
    return camelObj;
  }


  /**
     * Convert camelCase to snake_case (with JSON field handling)
     */
  toSnakeCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.toSnakeCase(item));

    const snakeObj = {};
    for (const [key, value] of Object.entries(obj)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

      // Handle Date objects
      if (value instanceof Date) {
        snakeObj[snakeKey] = this.toMySQLDateTime(value);
      }
      // Handle datetime string fields
      else if ((key.endsWith('At') || key === 'createdAt' || key === 'updatedAt' || key === 'lastLogin') && value) {
        snakeObj[snakeKey] = this.toMySQLDateTime(value);
      }
      // JSON fields - keep as object (MySQL will handle JSON.stringify)
      else if (this.isJsonField(key)) {
        snakeObj[snakeKey] = value; // Keep as-is, MySQL will handle
      }
      // Nested objects (but not JSON fields, Date, or Buffer)
      else if (value && typeof value === 'object' && !Array.isArray(value) && !this.isJsonField(key)) {
        snakeObj[snakeKey] = this.toSnakeCase(value);
      }
      else {
        snakeObj[snakeKey] = value;
      }
    }
    return snakeObj;
  }

  /**
   * Convert camelCase to snake_case (with JSON field handling)
   */
  toCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.toCamelCase(item));

    const camelObj = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

      // Handle datetime
      if ((key.endsWith('_at') || key === 'created_at' || key === 'updated_at' || key === 'last_login') && value) {
        camelObj[camelKey] = this.fromMySQLDateTime(value);
      }
      // JSON fields: MySQL driver có thể trả về string hoặc object tùy cấu hình
      else if (this.isJsonField(camelKey)) {
        if (typeof value === 'string') {
          try {
            camelObj[camelKey] = JSON.parse(value);
          } catch (e) {
            camelObj[camelKey] = []; // Fallback empty array/obj
          }
        } else {
          camelObj[camelKey] = value;
        }
      }
      else {
        camelObj[camelKey] = value;
      }
    }
    return camelObj;
  }

  /**
   * Convert single field from camelCase to snake_case
   */
  camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  // ==================== CRUD METHODS ====================

  async findAllAdvanced(collection, options = {}) {
    const connection = await this.pool.getConnection();

    try {
      const { filter = {}, page = 1, limit = 10, sort, order = 'asc', q } = options;

      let query = `SELECT * FROM ${collection} WHERE 1=1`;
      const params = [];

      // Apply filters (FIXED: Added check for filter)
      if (filter) {
        for (const [key, value] of Object.entries(filter)) {
          // Handle operators
          if (key.endsWith('_gte')) {
            const field = this.camelToSnake(key.replace('_gte', ''));
            query += ` AND ${field} >= ?`;
            params.push(value);
          } else if (key.endsWith('_lte')) {
            const field = this.camelToSnake(key.replace('_lte', ''));
            query += ` AND ${field} <= ?`;
            params.push(value);
          } else if (key.endsWith('_ne')) {
            const field = this.camelToSnake(key.replace('_ne', ''));
            query += ` AND ${field} != ?`;
            params.push(value);
          } else if (key.endsWith('_like')) {
            const field = this.camelToSnake(key.replace('_like', ''));
            query += ` AND ${field} LIKE ?`;
            params.push(`%${value}%`);
          } else if (key.endsWith('_in')) {
            const field = this.camelToSnake(key.replace('_in', ''));
            const values = typeof value === 'string' ? value.split(',') : value;
            query += ` AND ${field} IN (${values.map(() => '?').join(',')})`;
            params.push(...values);
          } else {
            // Regular filter - convert camelCase to snake_case
            const snakeKey = this.camelToSnake(key);
            query += ` AND ${snakeKey} = ?`;
            params.push(value);
          }
        }
      }

      // Full-text search
      if (q) {
        query += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${q}%`, `%${q}%`);
      }

      // Count total (before pagination)
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
      const [countResult] = await connection.query(countQuery, params);
      const total = countResult[0].count;

      // Sorting
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
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [rows] = await connection.query(query, params);
      const data = rows.map(row => this.toCamelCase(row));

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
      connection.release();
    }
  }

  // ==================== CRUD METHODS ====================

  async findAll(collection) {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM ${collection} ORDER BY id`);
      return rows.map(row => this.toCamelCase(row));
    } catch (error) {
      console.error('❌ findAll error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async findById(collection, id) {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query(`SELECT * FROM ${collection} WHERE id = ?`, [id]);
      return rows[0] ? this.toCamelCase(rows[0]) : null;
    } catch (error) {
      console.error('❌ findById error:', error);
      return null;
    } finally {
      connection.release();
    }
  }

  async findOne(collection, query) {
    const connection = await this.pool.getConnection();
    try {
      const snakeQuery = this.toSnakeCase(query);
      const conditions = Object.keys(snakeQuery).map(key => `${key} = ?`);
      const values = Object.values(snakeQuery);

      const sql = `SELECT * FROM ${collection} WHERE ${conditions.join(' AND ')} LIMIT 1`;
      const [rows] = await connection.query(sql, values);

      return rows[0] ? this.toCamelCase(rows[0]) : null;
    } catch (error) {
      console.error('❌ findOne error:', error);
      return null;
    } finally {
      connection.release();
    }
  }

  async findMany(collection, query) {
    const connection = await this.pool.getConnection();
    try {
      const snakeQuery = this.toSnakeCase(query);

      if (Object.keys(snakeQuery).length === 0) {
        const [rows] = await connection.query(`SELECT * FROM ${collection}`);
        return rows.map(row => this.toCamelCase(row));
      }

      const conditions = Object.keys(snakeQuery).map(key => `${key} = ?`);
      const values = Object.values(snakeQuery);

      const sql = `SELECT * FROM ${collection} WHERE ${conditions.join(' AND ')}`;
      const [rows] = await connection.query(sql, values);

      return rows.map(row => this.toCamelCase(row));
    } catch (error) {
      console.error('❌ findMany error:', error);
      return [];
    } finally {
      connection.release();
    }
  }

  async create(collection, data) {
    const connection = await this.pool.getConnection();
    try {
      const snakeData = this.toSnakeCase(data);
      delete snakeData.id; // Let MySQL auto-generate

      const keys = Object.keys(snakeData);
      const values = Object.values(snakeData).map(val => {
        // Handle JSON fields
        if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
          return JSON.stringify(val);
        }
        return val;
      });
      const placeholders = keys.map(() => '?');

      const sql = `INSERT INTO ${collection} (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`;
      const [result] = await connection.query(sql, values);

      // Get the inserted record
      const [rows] = await connection.query(
        `SELECT * FROM ${collection} WHERE id = ?`,
        [result.insertId]
      );

      return this.toCamelCase(rows[0]);
    } catch (error) {
      console.error('❌ create error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(collection, id, data) {
    const connection = await this.pool.getConnection();
    try {
      const snakeData = this.toSnakeCase(data);
      delete snakeData.id;
      snakeData.updated_at = this.toMySQLDateTime(new Date());

      const keys = Object.keys(snakeData);
      const values = Object.values(snakeData).map(val => {
        // Handle JSON fields
        if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
          return JSON.stringify(val);
        }
        return val;
      });
      const setClauses = keys.map(key => `${key} = ?`);

      const sql = `UPDATE ${collection} SET ${setClauses.join(', ')} WHERE id = ?`;
      await connection.query(sql, [...values, id]);

      const [rows] = await connection.query(`SELECT * FROM ${collection} WHERE id = ?`, [id]);
      return rows[0] ? this.toCamelCase(rows[0]) : null;
    } catch (error) {
      console.error('❌ update error:', error);
      return null;
    } finally {
      connection.release();
    }
  }

  async delete(collection, id) {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.query(`DELETE FROM ${collection} WHERE id = ?`, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ delete error:', error);
      return false;
    } finally {
      connection.release();
    }
  }

  async getNextId(collection) {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query(`SELECT MAX(id) as max_id FROM ${collection}`);
      return (rows[0].max_id || 0) + 1;
    } catch (error) {
      console.error('❌ getNextId error:', error);
      return Date.now();
    } finally {
      connection.release();
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Implement Relations thủ công (Simulation)
   * Vì cấu trúc JSON Server cho phép embed linh động mà không cần join cứng SQL
   */
  async applyRelations(items, collection, options) {
    if (!items || items.length === 0) return items;

    // Deep copy để tránh mutation
    const resultItems = items.map(i => ({ ...i }));

    // 1. Expand (Many-to-One): VD Order -> User, Product -> Restaurant
    if (options.expand) {
      const relations = options.expand.split(',');
      for (const relation of relations) {
        const foreignKey = `${relation}Id`; // vd: userId, restaurantId

        // Lấy danh sách ID cần query
        const idsToFetch = [...new Set(resultItems.map(item => item[foreignKey]).filter(id => id))];

        if (idsToFetch.length > 0) {
          // Determine table name (basic pluralization)
          const targetTable = relation + 's';

          // Query batch
          const placeholders = idsToFetch.map(() => '?').join(',');
          const connection = await this.pool.getConnection();
          try {
            const [rows] = await connection.query(`SELECT * FROM ${targetTable} WHERE id IN (${placeholders})`, idsToFetch);
            const map = {};
            rows.forEach(r => map[r.id] = this.toCamelCase(r));

            // Map back to items
            resultItems.forEach(item => {
              if (item[foreignKey]) {
                item[relation] = map[item[foreignKey]] || null;
              }
            });
          } finally {
            connection.release();
          }
        }
      }
    }

    // 2. Embed (One-to-Many): VD Restaurant -> Products
    if (options.embed) {
      const relations = options.embed.split(',');
      for (const relation of relations) {
        // Map relation name to table name
        // VD: embed=products -> table products, embed=items -> table products (special case for orders?)
        let targetTable = relation;

        // Xác định Foreign Key ngược
        // VD: Embed products vào restaurants thì FK ở bảng products là restaurantId
        let foreignKey = collection.slice(0, -1) + 'Id'; // restaurants -> restaurantId

        // Special mapping logic (giống JsonAdapter)
        if (collection === 'orders' && relation === 'items') continue; // Items đã có sẵn trong JSON order

        const parentIds = resultItems.map(i => i.id);

        if (parentIds.length > 0) {
          const connection = await this.pool.getConnection();
          try {
            // Chuyển camelCase FK sang snake_case cho SQL query
            const snakeFK = this.camelToSnake(foreignKey);
            const placeholders = parentIds.map(() => '?').join(',');

            const [rows] = await connection.query(
              `SELECT * FROM ${targetTable} WHERE ${snakeFK} IN (${placeholders})`,
              parentIds
            );

            // Group by parent ID
            const map = {};
            rows.forEach(r => {
              const converted = this.toCamelCase(r);
              const pId = converted[foreignKey];
              if (!map[pId]) map[pId] = [];
              map[pId].push(converted);
            });

            resultItems.forEach(item => {
              item[relation] = map[item.id] || [];
            });
          } catch (e) {
            console.warn(`⚠️ Embed failed for ${relation}: ${e.message}`);
          } finally {
            connection.release();
          }
        }
      }
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
    return true; // No-op for MySQL
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new MySQLAdapter();