const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../database/db.json');

class Database {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const rawData = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      console.error('Error loading database:', error);
      return this.getDefaultData();
    }
  }

  saveData() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving database:', error);
      return false;
    }
  }

  getDefaultData() {
    return {
      users: [],
      categories: [],
      restaurants: [],
      products: [],
      orders: [],
      cart: [],
      favorites: [],
      reviews: [],
      promotions: [],
      addresses: []
    };
  }

  // ==================== ENHANCED QUERY METHODS ====================

  /**
   * Find all with advanced filtering, pagination, sorting
   * @param {string} collection - Collection name
   * @param {object} options - Query options
   * @returns {object} - { data, pagination }
   */
  findAllAdvanced(collection, options = {}) {
    let items = [...(this.data[collection] || [])];

    // 1. FILTERING
    if (options.filter) {
      items = this.applyFilters(items, options.filter);
    }

    // 2. FULL-TEXT SEARCH
    if (options.q) {
      items = this.applyFullTextSearch(items, options.q);
    }

    // 3. RELATIONS (embed & expand)
    if (options.embed || options.expand) {
      items = this.applyRelations(items, collection, options);
    }

    // 4. SORTING
    if (options.sort) {
      items = this.applySorting(items, options.sort, options.order);
    }

    // 5. PAGINATION
    const pagination = this.applyPagination(items, options.page, options.limit);

    return {
      data: pagination.data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNext: pagination.hasNext,
        hasPrev: pagination.hasPrev
      }
    };
  }

  /**
   * Apply filters (operators: _gte, _lte, _ne, _like, etc.)
   */
  applyFilters(items, filters) {
    return items.filter(item => {
      return Object.keys(filters).every(key => {
        // Operator filters
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
        if (key.endsWith('_in')) {
          const field = key.replace('_in', '');
          const values = Array.isArray(filters[key]) ? filters[key] : filters[key].split(',');
          return values.includes(String(item[field]));
        }

        // Exact match
        return item[key] == filters[key];
      });
    });
  }

  /**
   * Full-text search across all fields
   */
  applyFullTextSearch(items, query) {
    const searchTerm = query.toLowerCase();
    return items.filter(item => {
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm);
        }
        return false;
      });
    });
  }

  /**
   * Apply relations (embed nested resources)
   */
  applyRelations(items, collection, options) {
    return items.map(item => {
      const enriched = { ...item };

      // Embed relations
      if (options.embed) {
        const relations = options.embed.split(',');
        relations.forEach(relation => {
          const relatedCollection = this.getRelatedCollection(collection, relation);
          if (relatedCollection) {
            const foreignKey = this.getForeignKey(collection, relation);
            enriched[relation] = this.data[relatedCollection]?.filter(
              r => r[foreignKey] === item.id
            ) || [];
          }
        });
      }

      // Expand relations (populate foreign keys)
      if (options.expand) {
        const relations = options.expand.split(',');
        relations.forEach(relation => {
          const foreignKey = `${relation}Id`;
          if (item[foreignKey]) {
            enriched[relation] = this.findById(relation + 's', item[foreignKey]);
          }
        });
      }

      return enriched;
    });
  }

  /**
   * Apply sorting
   */
  applySorting(items, sortField, order = 'asc') {
    const fields = sortField.split(',');

    return items.sort((a, b) => {
      for (const field of fields) {
        const aVal = a[field];
        const bVal = b[field];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Apply pagination
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
   * Get slice of data (for pagination)
   */
  getSlice(collection, start, end) {
    const items = this.data[collection] || [];
    return {
      data: items.slice(start, end),
      total: items.length
    };
  }

  // ==================== HELPER METHODS ====================

  getRelatedCollection(collection, relation) {
    const relationMap = {
      restaurants: { products: 'products', reviews: 'reviews' },
      users: { orders: 'orders', reviews: 'reviews', addresses: 'addresses' },
      orders: { items: 'products' }
    };
    return relationMap[collection]?.[relation];
  }

  getForeignKey(collection, relation) {
    const keyMap = {
      restaurants: { products: 'restaurantId', reviews: 'restaurantId' },
      users: { orders: 'userId', reviews: 'userId', addresses: 'userId' }
    };
    return keyMap[collection]?.[relation];
  }

  // ==================== ORIGINAL CRUD METHODS ====================

  findAll(collection) {
    return this.data[collection] || [];
  }

  findById(collection, id) {
    return this.data[collection]?.find(item => item.id === parseInt(id));
  }

  findOne(collection, query) {
    return this.data[collection]?.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  findMany(collection, query) {
    if (!query || Object.keys(query).length === 0) {
      return this.data[collection] || [];
    }
    return this.data[collection]?.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    }) || [];
  }

  create(collection, data) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    const id = this.getNextId(collection);
    const newItem = { id, ...data };
    this.data[collection].push(newItem);
    this.saveData();
    return newItem;
  }

  update(collection, id, data) {
    const index = this.data[collection]?.findIndex(item => item.id === parseInt(id));
    if (index === -1) return null;

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...data,
      id: parseInt(id)
    };
    this.saveData();
    return this.data[collection][index];
  }

  delete(collection, id) {
    const index = this.data[collection]?.findIndex(item => item.id === parseInt(id));
    if (index === -1) return false;

    this.data[collection].splice(index, 1);
    this.saveData();
    return true;
  }

  getNextId(collection) {
    const items = this.data[collection] || [];
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
  }
}

module.exports = new Database();
