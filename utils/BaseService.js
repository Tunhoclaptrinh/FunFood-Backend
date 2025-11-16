/**
 * Base Service - Enhanced with Schema Integration
 * All services extend this class and inherit CRUD + Import/Export + Schema-based Validation
 */
const db = require('../config/database');
const schemas = require('../schemas');

class BaseService {
  constructor(collectionName) {
    this.collection = collectionName;
    this.schema = schemas[collectionName] || null;
  }

  // ==================== SCHEMA METHODS ====================

  /**
   * Get schema for this entity
   */
  getSchema() {
    return this.schema;
  }

  /**
   * Get schema fields
   */
  getSchemaFields() {
    if (!this.schema) return [];
    return Object.keys(this.schema);
  }

  /**
   * Get required fields từ schema
   */
  getRequiredFields() {
    if (!this.schema) return [];
    return Object.entries(this.schema)
      .filter(([_, rule]) => rule.required)
      .map(([field, _]) => field);
  }

  /**
   * Validate type theo schema
   */
  validateType(field, value, rule) {
    switch (rule.type) {
      case 'string':
        return typeof value !== 'string' ? `${field} must be a string` : null;
      case 'number':
        return isNaN(Number(value)) ? `${field} must be a number` : null;
      case 'boolean':
        return typeof value !== 'boolean' &&
          !['true', 'false', '1', '0'].includes(String(value).toLowerCase())
          ? `${field} must be true/false` : null;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? `${field} must be a valid email` : null;
      case 'date':
        return isNaN(new Date(value).getTime()) ? `${field} must be a valid date` : null;
      case 'enum':
        return !rule.enum.includes(value) ? `${field} must be one of: ${rule.enum.join(', ')}` : null;
      default:
        return null;
    }
  }

  /**
   * Convert value theo schema type
   */
  convertValue(field, value, rule) {
    if (value === undefined || value === null) {
      return rule.default !== undefined ? rule.default : null;
    }

    switch (rule.type) {
      case 'number':
        return Number(value);
      case 'boolean':
        const boolStr = String(value).toLowerCase();
        return ['true', '1', 'yes'].includes(boolStr);
      case 'date':
        return new Date(value).toISOString();
      case 'email':
        return String(value).toLowerCase();
      case 'enum':
        return String(value).toUpperCase ? String(value).toUpperCase() : String(value);
      default:
        return value;
    }
  }

  /**
   * Transform object theo schema types
   */
  transformBySchema(data) {
    if (!this.schema) return data;

    const transformed = {};
    for (const [field, rule] of Object.entries(this.schema)) {
      if (field in data) {
        transformed[field] = this.convertValue(field, data[field], rule);
      }
    }
    return transformed;
  }

  /**
   * Validate data theo schema
   */
  validateBySchema(data) {
    if (!this.schema) return { success: true };

    const errors = {};

    for (const [field, rule] of Object.entries(this.schema)) {
      const value = data[field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      // Skip if optional and empty
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      const typeError = this.validateType(field, value, rule);
      if (typeError) {
        errors[field] = typeError;
        continue;
      }

      // Range validation
      if (rule.min !== undefined && Number(value) < rule.min) {
        errors[field] = `${field} must be >= ${rule.min}`;
      }
      if (rule.max !== undefined && Number(value) > rule.max) {
        errors[field] = `${field} must be <= ${rule.max}`;
      }

      // Length validation
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${field} must be at most ${rule.maxLength} characters`;
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${rule.enum.join(', ')}`;
      }

      // Unique validation
      if (rule.unique) {
        const existing = db.findOne(this.collection, { [field]: value });
        if (existing) {
          errors[field] = `${field} '${value}' already exists`;
        }
      }

      // Foreign key validation
      if (rule.foreignKey) {
        const relatedEntity = db.findById(rule.foreignKey, value);
        if (!relatedEntity) {
          errors[field] = `${field} references non-existent ${rule.foreignKey} (ID: ${value})`;
        }
      }
    }

    // ✅ NEW: Custom validation
    if (rule.custom && typeof rule.custom === 'function') {
      try {
        const customError = rule.custom(value, data);  // Pass all data for cross-field
        if (customError) {
          errors[field] = customError;
        }
      } catch (err) {
        errors[field] = `Custom validation failed: ${err.message}`;
      }
    }

    return Object.keys(errors).length === 0
      ? { success: true }
      : { success: false, errors };
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
      // Schema validation
      const schemaValidation = this.validateBySchema(data);
      if (!schemaValidation.success) {
        return {
          success: false,
          message: 'Validation failed',
          statusCode: 400,
          errors: schemaValidation.errors
        };
      }

      // Custom validation (có thể override)
      const customValidation = await this.validateCreate(data);
      if (!customValidation.success) {
        return customValidation;
      }

      // Transform data before save
      const transformedData = await this.beforeCreate(data);

      const item = db.create(this.collection, transformedData);

      // Hook after create
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

      // Schema validation
      const schemaValidation = this.validateBySchema(data);
      if (!schemaValidation.success) {
        return {
          success: false,
          message: 'Validation failed',
          statusCode: 400,
          errors: schemaValidation.errors
        };
      }

      // Custom validation
      const customValidation = await this.validateUpdate(id, data);
      if (!customValidation.success) {
        return customValidation;
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

      // Custom validation
      const customValidation = await this.validateDelete(id);
      if (!customValidation.success) {
        return customValidation;
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
   * Validate import data
   */
  async validateImportData(data, rowIndex) {
    if (!this.schema) return [];

    const errors = [];

    for (const [field, rule] of Object.entries(this.schema)) {
      const value = data[field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip if optional and empty
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      const typeError = this.validateType(field, value, rule);
      if (typeError) {
        errors.push(typeError);
        continue;
      }

      // Range validation
      if (rule.min !== undefined && Number(value) < rule.min) {
        errors.push(`${field} must be >= ${rule.min}`);
      }
      if (rule.max !== undefined && Number(value) > rule.max) {
        errors.push(`${field} must be <= ${rule.max}`);
      }

      // Length validation
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }

      // Foreign key validation
      if (rule.foreignKey) {
        const relatedEntity = db.findById(rule.foreignKey, value);
        if (!relatedEntity) {
          errors.push(`${field} references non-existent ${rule.foreignKey} (ID: ${value})`);
        }
      }

      // Unique validation
      if (rule.unique) {
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
    if (!this.schema) return data;

    const transformed = {};
    for (const [field, rule] of Object.entries(this.schema)) {
      if (field in data) {
        transformed[field] = this.convertValue(field, data[field], rule);
      }
    }

    // Add metadata
    transformed.createdAt = new Date().toISOString();
    transformed.updatedAt = new Date().toISOString();

    return transformed;
  }

  /**
   * Import data from records
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

        // Additional validation
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

    if (options.includeRelations && this.schema) {
      data = data.map(item => {
        const enriched = { ...item };

        // Expand foreign keys
        for (const [field, rule] of Object.entries(this.schema)) {
          if (rule.foreignKey && item[field]) {
            const related = db.findById(rule.foreignKey, item[field]);
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
    const transformed = this.transformBySchema(data);
    return {
      ...transformed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Transform data before update
   */
  async beforeUpdate(id, data) {
    const transformed = this.transformBySchema(data);
    return {
      ...transformed,
      updatedAt: new Date().toISOString()
    };
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
    return this.collection.slice(0, -1);
  }
}

module.exports = BaseService;