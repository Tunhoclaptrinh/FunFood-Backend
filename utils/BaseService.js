/**
 * Base Service - Enhanced with Import/Export Support
 * All services extend this class and inherit CRUD + Import/Export
 */
const db = require('../config/database');

class BaseService {
  constructor(collectionName) {
    this.collection = collectionName;
  }

  // ==================== CRUD METHODS ====================

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

      db.delete(this.collection, id);

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

  // ==================== IMPORT/EXPORT METHODS ====================

  /**
   * Get schema for this entity - MUST be overridden in child class
   */
  getSchema() {
    throw new Error(`getSchema() must be implemented in ${this.collection} service`);
  }

  /**
   * Get import/export fields mapping
   */
  getImportExportFields() {
    const schema = this.getSchema();
    return Object.keys(schema);
  }

  /**
   * Validate import data
   */
  async validateImportData(data, rowIndex) {
    const schema = this.getSchema();
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip if optional and empty
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      switch (rules.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
          }
          break;

        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${field} must be a number`);
          } else {
            const num = Number(value);
            if (rules.min !== undefined && num < rules.min) {
              errors.push(`${field} must be >= ${rules.min}`);
            }
            if (rules.max !== undefined && num > rules.max) {
              errors.push(`${field} must be <= ${rules.max}`);
            }
          }
          break;

        case 'boolean':
          const boolValue = String(value).toLowerCase();
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(boolValue)) {
            errors.push(`${field} must be true/false`);
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${field} must be a valid email`);
          }
          break;

        case 'date':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push(`${field} must be a valid date`);
          }
          break;

        case 'enum':
          if (!rules.values.includes(value)) {
            errors.push(`${field} must be one of: ${rules.values.join(', ')}`);
          }
          break;
      }

      // Foreign key validation
      if (rules.foreignKey) {
        const relatedEntity = db.findById(rules.foreignKey, value);
        if (!relatedEntity) {
          errors.push(`${field} references non-existent ${rules.foreignKey} (ID: ${value})`);
        }
      }

      // Unique validation
      if (rules.unique) {
        const existing = db.findOne(this.collection, { [field]: value });
        if (existing) {
          errors.push(`${field} '${value}' already exists`);
        }
      }
    }

    return errors;
  }

  /**
   * Transform import data
   */
  async transformImportData(data) {
    const schema = this.getSchema();
    const transformed = {};

    for (const [field, rules] of Object.entries(schema)) {
      let value = data[field];

      // Use default if not provided
      if ((value === undefined || value === null || value === '') && rules.default !== undefined) {
        value = rules.default;
      }

      // Type conversion
      switch (rules.type) {
        case 'number':
          transformed[field] = value !== '' ? Number(value) : null;
          break;

        case 'boolean':
          const boolStr = String(value).toLowerCase();
          transformed[field] = ['true', '1', 'yes'].includes(boolStr);
          break;

        case 'date':
          transformed[field] = new Date(value).toISOString();
          break;

        default:
          transformed[field] = value;
      }
    }

    // Add metadata
    transformed.createdAt = new Date().toISOString();
    transformed.updatedAt = new Date().toISOString();

    return transformed;
  }

  /**
   * Import data - use this instead of external importExport service
   */
  async importData(records) {
    const results = {
      total: records.length,
      success: 0,
      failed: 0,
      errors: [],
      inserted: []
    };

    for (let i = 0; i < records.length; i++) {
      const rowIndex = i + 2; // Excel row (1-indexed + header)
      const record = records[i];

      try {
        // Validate
        const errors = await this.validateImportData(record, rowIndex);
        if (errors.length > 0) {
          results.failed++;
          results.errors.push({
            row: rowIndex,
            data: record,
            errors
          });
          continue;
        }

        // Transform
        const transformed = await this.transformImportData(record);

        // Additional validation from child class
        const validation = await this.validateCreate(transformed);
        if (!validation.success) {
          results.failed++;
          results.errors.push({
            row: rowIndex,
            data: record,
            errors: [validation.message]
          });
          continue;
        }

        // Create
        const item = db.create(this.collection, transformed);
        results.success++;
        results.inserted.push(item);

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowIndex,
          data: record,
          errors: [error.message]
        });
      }
    }

    return {
      success: true,
      message: `Import completed: ${results.success} succeeded, ${results.failed} failed`,
      data: results
    };
  }

  /**
   * Prepare data for export
   */
  async prepareExportData(options = {}) {
    const result = await this.findAll(options);
    let data = result.data;

    // Include relations if specified
    if (options.includeRelations) {
      const schema = this.getSchema();

      data = data.map(item => {
        const enriched = { ...item };

        // Expand foreign keys
        for (const [field, rules] of Object.entries(schema)) {
          if (rules.foreignKey && item[field]) {
            const related = db.findById(rules.foreignKey, item[field]);
            if (related) {
              enriched[`${field}_name`] = related.name || related.email || related.code;
            }
          }
        }

        return enriched;
      });
    }

    // Select columns if specified
    if (options.columns && Array.isArray(options.columns)) {
      data = data.map(item => {
        const selected = {};
        options.columns.forEach(col => {
          selected[col] = item[col];
          // Include relation names if available
          if (item[`${col}_name`]) {
            selected[`${col}_name`] = item[`${col}_name`];
          }
        });
        return selected;
      });
    }

    return data;
  }

  // ==================== VALIDATION HOOKS ====================

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

  // ==================== TRANSFORM HOOKS ====================


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

  async beforeDelete(id) {
    // Do nothing by default
  }

  // ==================== POST-ACTION HOOKS ====================



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

  // ==================== HELPERS ====================

  /**
   * Get model name for messages
   */
  getModelName() {
    return this.collection.slice(0, -1); // Remove 's' at the end
  }
}

module.exports = BaseService;