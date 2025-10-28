/**
 * Base Service - Chứa logic CRUD cơ bản
 * Các service khác sẽ extend class này
 */
const db = require('../config/database');

class BaseService {
  constructor(collectionName) {
    this.collection = collectionName;
  }

  /**
   * Get all records với advanced filtering
   */
  async findAll(options = {}) {
    try {
      const result = db.findAllAdvanced(this.collection, options);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get one record by ID
   */
  async findById(id) {
    try {
      const item = db.findById(this.collection, id);
      if (!item) {
        return {
          success: false,
          message: `${this.getModelName()} not found`,
          statusCode: 404
        };
      }
      return {
        success: true,
        data: item
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find one by query
   */
  async findOne(query) {
    try {
      const item = db.findOne(this.collection, query);
      return {
        success: !!item,
        data: item
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find many by query
   */
  async findMany(query) {
    try {
      const items = db.findMany(this.collection, query);
      return {
        success: true,
        data: items
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new record
   */
  async create(data) {
    try {
      // Validate before create (có thể override)
      const validation = await this.validateCreate(data);
      if (!validation.success) {
        return validation;
      }

      // Transform data before save (có thể override)
      const transformedData = await this.beforeCreate(data);

      const item = db.create(this.collection, transformedData);

      // Hook after create (có thể override)
      await this.afterCreate(item);

      return {
        success: true,
        message: `${this.getModelName()} created successfully`,
        data: item
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update record
   */
  async update(id, data) {
    try {
      // Check exists
      const existCheck = await this.findById(id);
      if (!existCheck.success) {
        return existCheck;
      }

      // Validate before update
      const validation = await this.validateUpdate(id, data);
      if (!validation.success) {
        return validation;
      }

      // Transform data
      const transformedData = await this.beforeUpdate(id, data);

      const updated = db.update(this.collection, id, transformedData);

      // Hook after update
      await this.afterUpdate(updated);

      return {
        success: true,
        message: `${this.getModelName()} updated successfully`,
        data: updated
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete record
   */
  async delete(id) {
    try {
      // Check exists
      const existCheck = await this.findById(id);
      if (!existCheck.success) {
        return existCheck;
      }

      // Validate before delete
      const validation = await this.validateDelete(id);
      if (!validation.success) {
        return validation;
      }

      // Hook before delete
      await this.beforeDelete(id);

      const result = db.delete(this.collection, id);

      // Hook after delete
      await this.afterDelete(id);

      return {
        success: true,
        message: `${this.getModelName()} deleted successfully`
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search with full-text
   */
  async search(query, options = {}) {
    try {
      const result = db.findAllAdvanced(this.collection, {
        q: query,
        ...options
      });
      return {
        success: true,
        data: result.data,
        pagination: result.pagination
      };
    } catch (error) {
      throw error;
    }
  }

  // ============= HOOKS - Override trong child class =============

  /**
   * Validate before create
   */
  async validateCreate(data) {
    return { success: true };
  }

  /**
   * Validate before update
   */
  async validateUpdate(id, data) {
    return { success: true };
  }

  /**
   * Validate before delete
   */
  async validateDelete(id) {
    return { success: true };
  }

  /**
   * Transform data before create
   */
  async beforeCreate(data) {
    return data;
  }

  /**
   * Transform data before update
   */
  async beforeUpdate(id, data) {
    return data;
  }

  /**
   * Hook after create
   */
  async afterCreate(item) {
    // Do nothing by default
  }

  /**
   * Hook after update
   */
  async afterUpdate(item) {
    // Do nothing by default
  }

  /**
   * Hook before delete
   */
  async beforeDelete(id) {
    // Do nothing by default
  }

  /**
   * Hook after delete
   */
  async afterDelete(id) {
    // Do nothing by default
  }

  // ============= HELPERS =============

  /**
   * Get model name for messages
   */
  getModelName() {
    return this.collection.slice(0, -1); // Remove 's' at the end
  }
}

module.exports = BaseService;