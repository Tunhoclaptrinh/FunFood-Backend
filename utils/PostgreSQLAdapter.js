const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class PostgreSQLAdapter {
  constructor() {
    this.pool = null;
    this.schemas = {};
    this.relations = {
      restaurants: {
        products: { table: 'products', localField: 'id', foreignField: 'restaurant_id' },
        reviews: { table: 'reviews', localField: 'id', foreignField: 'restaurant_id' }
      },
      users: {
        orders: { table: 'orders', localField: 'id', foreignField: 'user_id' }
      },
      products: {
        restaurant: { table: 'restaurants', localField: 'restaurant_id', foreignField: 'id', justOne: true },
        category: { table: 'categories', localField: 'category_id', foreignField: 'id', justOne: true }
      },
      orders: {
        user: { table: 'users', localField: 'user_id', foreignField: 'id', justOne: true },
        restaurant: { table: 'restaurants', localField: 'restaurant_id', foreignField: 'id', justOne: true }
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

      const client = await this.pool.connect();
      console.log('🔌 PostgreSQL Adapter Connected');
      client.release();

      await this.createTables();
    } catch (error) {
      console.error('❌ PostgreSQL Connection Error:', error);
    }
  }

  loadSchemas() {
    const schemasDir = path.join(__dirname, '../schemas');
    const files = fs.readdirSync(schemasDir);

    files.forEach(file => {
      if (file === 'index.js') return;
      const entityName = file.replace('.schema.js', 's');
      this.schemas[entityName] = require(path.join(schemasDir, file));
    });
  }

  /**
   * Convert camelCase to snake_case
   */
  toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert snake_case to camelCase
   */
  toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Convert object keys from camelCase to snake_case
   */
  keysToSnakeCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.keysToSnakeCase(item));

    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = this.toSnakeCase(key);
      converted[snakeKey] = typeof value === 'object' && value !== null && !Array.isArray(value)
        ? this.keysToSnakeCase(value)
        : value;
    }
    return converted;
  }

  /**
   * Convert object keys from snake_case to camelCase
   */
  keysToCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.keysToCamelCase(item));

    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = this.toCamelCase(key);
      converted[camelKey] = typeof value === 'object' && value !== null && !Array.isArray(value)
        ? this.keysToCamelCase(value)
        : value;
    }
    return converted;
  }

  /**
   * Get PostgreSQL data type from schema
   */
  getPgType(schemaType) {
    const typeMap = {
      string: 'TEXT',
      number: 'INTEGER',
      boolean: 'BOOLEAN',
      date: 'TIMESTAMP',
      email: 'TEXT',
      enum: 'TEXT',
      array: 'JSONB'
    };
    return typeMap[schemaType] || 'TEXT';
  }

  /**
   * Create tables from schemas
   */
  async createTables() {
    const client = await this.pool.connect();

    try {
      for (const [tableName, schema] of Object.entries(this.schemas)) {
        const columns = ['id SERIAL PRIMARY KEY'];
        const indexes = [];

        for (const [field, rules] of Object.entries(schema)) {
          if (field === 'custom') continue;

          const snakeField = this.toSnakeCase(field);
          let columnDef = `${snakeField} ${this.getPgType(rules.type)}`;

          if (rules.required) columnDef += ' NOT NULL';
          if (rules.default !== undefined) {
            const defaultVal = typeof rules.default === 'string'
              ? `'${rules.default}'`
              : rules.default;
            columnDef += ` DEFAULT ${defaultVal}`;
          }

          columns.push(columnDef);

          // Create index for foreign keys
          if (rules.foreignKey) {
            indexes.push(`CREATE INDEX IF NOT EXISTS idx_${tableName}_${snakeField} ON ${tableName}(${snakeField})`);
          }

          // Create unique index
          if (rules.unique) {
            indexes.push(`CREATE UNIQUE INDEX IF NOT EXISTS idx_${tableName}_${snakeField}_unique ON ${tableName}(${snakeField})`);
          }
        }

        // Add timestamps
        columns.push('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        columns.push('updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS ${tableName} (
            ${columns.join(',\n            ')}
          )
        `;

        await client.query(createTableSQL);

        // Create indexes
        for (const indexSQL of indexes) {
          await client.query(indexSQL);
        }

        console.log(`✅ Table ${tableName} created/verified`);
      }
    } catch (error) {
      console.error('Error creating tables:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Build WHERE clause from filters
   */
  buildWhereClause(filters, paramIndex = 1) {
    if (!filters || Object.keys(filters).length === 0) {
      return { whereClause: '', params: [], paramIndex };
    }

    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(filters)) {
      const snakeKey = this.toSnakeCase(key);

      if (key.endsWith('_gte')) {
        const field = snakeKey.replace('_gte', '');
        conditions.push(`${field} >= $${paramIndex}`);
        params.push(value);
        paramIndex++;
      } else if (key.endsWith('_lte')) {
        const field = snakeKey.replace('_lte', '');
        conditions.push(`${field} <= $${paramIndex}`);
        params.push(value);
        paramIndex++;
      } else if (key.endsWith('_ne')) {
        const field = snakeKey.replace('_ne', '');
        conditions.push(`${field} != $${paramIndex}`);
        params.push(value);
        paramIndex++;
      } else if (key.endsWith('_like')) {
        const field = snakeKey.replace('_like', '');
        conditions.push(`${field} ILIKE $${paramIndex}`);
        params.push(`%${value}%`);
        paramIndex++;
      } else if (key.endsWith('_in')) {
        const field = snakeKey.replace('_in', '');
        const values = typeof value === 'string' ? value.split(',') : value;
        const placeholders = values.map((_, i) => `$${paramIndex + i}`).join(',');
        conditions.push(`${field} IN (${placeholders})`);
        params.push(...values);
        paramIndex += values.length;
      } else {
        conditions.push(`${snakeKey} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params, paramIndex };
  }

  /**
   * Find all with advanced filtering
   */
  async findAllAdvanced(collection, options = {}) {
    const client = await this.pool.connect();

    try {
      // Convert filter keys to snake_case
      const snakeFilter = options.filter ? this.keysToSnakeCase(options.filter) : {};
      const { whereClause, params, paramIndex } = this.buildWhereClause(snakeFilter);

      // Build ORDER BY
      let orderBy = 'ORDER BY created_at DESC';
      if (options.sort) {
        const sortFields = options.sort.split(',').map(f => this.toSnakeCase(f));
        const orders = options.order ? options.order.split(',') : [];
        const orderClauses = sortFields.map((field, i) => {
          const order = orders[i] === 'desc' ? 'DESC' : 'ASC';
          return `${field} ${order}`;
        });
        orderBy = `ORDER BY ${orderClauses.join(', ')}`;
      }

      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 10;
      const offset = (page - 1) * limit;

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM ${collection} ${whereClause}`;
      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get data
      const dataQuery = `
        SELECT * FROM ${collection} 
        ${whereClause} 
        ${orderBy} 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      const dataResult = await client.query(dataQuery, [...params, limit, offset]);

      // Convert keys to camelCase
      const data = dataResult.rows.map(row => this.keysToCamelCase(row));

      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error in findAllAdvanced:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find all
   */
  async findAll(collection) {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`SELECT * FROM ${collection} ORDER BY created_at DESC`);
      return result.rows.map(row => this.keysToCamelCase(row));
    } catch (error) {
      console.error('Error in findAll:', error);
      return [];
    } finally {
      client.release();
    }
  }

  /**
   * Find by ID
   */
  async findById(collection, id) {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `SELECT * FROM ${collection} WHERE id = $1`,
        [parseInt(id)]
      );

      if (result.rows.length === 0) return null;
      return this.keysToCamelCase(result.rows[0]);
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Find one
   */
  async findOne(collection, query) {
    const client = await this.pool.connect();

    try {
      const snakeQuery = this.keysToSnakeCase(query);
      const { whereClause, params } = this.buildWhereClause(snakeQuery);

      const result = await client.query(
        `SELECT * FROM ${collection} ${whereClause} LIMIT 1`,
        params
      );

      if (result.rows.length === 0) return null;
      return this.keysToCamelCase(result.rows[0]);
    } catch (error) {
      console.error('Error in findOne:', error);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Find many
   */
  async findMany(collection, query) {
    const client = await this.pool.connect();

    try {
      const snakeQuery = this.keysToSnakeCase(query);
      const { whereClause, params } = this.buildWhereClause(snakeQuery);

      const result = await client.query(
        `SELECT * FROM ${collection} ${whereClause}`,
        params
      );

      return result.rows.map(row => this.keysToCamelCase(row));
    } catch (error) {
      console.error('Error in findMany:', error);
      return [];
    } finally {
      client.release();
    }
  }

  /**
   * Create
   */
  async create(collection, data) {
    const client = await this.pool.connect();

    try {
      const snakeData = this.keysToSnakeCase(data);
      delete snakeData.id; // Let PostgreSQL generate ID

      const fields = Object.keys(snakeData);
      const values = Object.values(snakeData);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const query = `
        INSERT INTO ${collection} (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await client.query(query, values);
      return this.keysToCamelCase(result.rows[0]);
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update
   */
  async update(collection, id, data) {
    const client = await this.pool.connect();

    try {
      const snakeData = this.keysToSnakeCase(data);
      delete snakeData.id; // Don't update ID
      snakeData.updated_at = new Date();

      const fields = Object.keys(snakeData);
      const values = Object.values(snakeData);
      const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

      const query = `
        UPDATE ${collection}
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *
      `;

      const result = await client.query(query, [...values, parseInt(id)]);

      if (result.rows.length === 0) return null;
      return this.keysToCamelCase(result.rows[0]);
    } catch (error) {
      console.error('Error in update:', error);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Delete
   */
  async delete(collection, id) {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `DELETE FROM ${collection} WHERE id = $1 RETURNING id`,
        [parseInt(id)]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Get next ID (not needed for PostgreSQL with SERIAL)
   */
  async getNextId(collection) {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `SELECT MAX(id) as max_id FROM ${collection}`
      );
      return (parseInt(result.rows[0].max_id) || 0) + 1;
    } catch (error) {
      return 1;
    } finally {
      client.release();
    }
  }

  /**
   * Apply relations (populate)
   */
  async applyRelations(items, collection, options) {
    if (!items || items.length === 0) return items;

    const enrichedItems = [...items];

    // Embed relations
    if (options.embed) {
      const relations = options.embed.split(',');

      for (const relation of relations) {
        const relConfig = this.relations[collection]?.[relation];
        if (!relConfig) continue;

        const ids = items.map(item => item[this.toCamelCase(relConfig.localField)]).filter(Boolean);
        if (ids.length === 0) continue;

        const relatedQuery = {};
        relatedQuery[this.toCamelCase(relConfig.foreignField) + '_in'] = ids;

        const relatedItems = await this.findMany(relConfig.table, relatedQuery);

        enrichedItems.forEach(item => {
          const localVal = item[this.toCamelCase(relConfig.localField)];
          item[relation] = relatedItems.filter(
            rel => rel[this.toCamelCase(relConfig.foreignField)] === localVal
          );
        });
      }
    }

    // Expand relations
    if (options.expand) {
      const relations = options.expand.split(',');

      for (const relation of relations) {
        const relConfig = this.relations[collection]?.[relation];
        if (!relConfig) continue;

        for (const item of enrichedItems) {
          const foreignId = item[this.toCamelCase(relConfig.localField)];
          if (foreignId) {
            item[relation] = await this.findById(relConfig.table, foreignId);
          }
        }
      }
    }

    return enrichedItems;
  }

  /**
   * Apply filters (for compatibility)
   */
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

  /**
   * Apply pagination (for compatibility)
   */
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

  /**
   * Save data (compatibility method)
   */
  saveData() {
    return true;
  }

  /**
   * Close connection
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('PostgreSQL connection closed');
    }
  }
}

module.exports = new PostgreSQLAdapter();