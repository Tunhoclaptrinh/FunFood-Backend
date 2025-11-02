/**
 * Enhanced Base Service
 * Tích hợp: CRUD + Validation + Import/Export + Schema Definition
 * 
 * Cách dùng:
 * 1. Extend BaseService
 * 2. Định nghĩa schema trong constructor
 * 3. Tự động có đầy đủ: CRUD, validation, import/export
 */

const db = require('../config/database');
const XLSX = require('xlsx');
const { Parser } = require('json2csv');

class BaseService {
  constructor(collectionName, schema = null) {
    this.collection = collectionName;
    this.schema = schema || this.defineSchema();
    this.BATCH_SIZE = 100;
  }

  // ============= SCHEMA DEFINITION =============
  /**
   * Define entity schema - OVERRIDE trong child class
   * @returns {Object} Schema definition
   */
  defineSchema() {
    return {};
  }

  /**
   * Get validation rules from schema
   */
  getValidationRules() {
    const rules = {};
    for (const [field, config] of Object.entries(this.schema)) {
      rules[field] = {
        required: config.required || false,
        type: config.type || 'string',
        min: config.min,
        max: config.max,
        values: config.values,
        unique: config.unique || false,
        foreignKey: config.foreignKey,
        default: config.default,
        validate: config.validate // Custom validator function
      };
    }
    return rules;
  }

  // ============= VALIDATION =============
  /**
   * Validate data against schema
   */
  async validate(data, mode = 'create') {
    const rules = this.getValidationRules();
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      // Skip validation for update if field not provided
      if (mode === 'update' && value === undefined) continue;

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip if optional and empty
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      const typeError = this.validateType(field, value, rule);
      if (typeError) errors.push(typeError);

      // Range validation
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${field} must be >= ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${field} must be <= ${rule.max}`);
      }

      // Enum validation
      if (rule.values && !rule.values.includes(value)) {
        errors.push(`${field} must be one of: ${rule.values.join(', ')}`);
      }

      // Foreign key validation
      if (rule.foreignKey) {
        const related = db.findById(rule.foreignKey, value);
        if (!related) {
          errors.push(`${field} references non-existent ${rule.foreignKey}`);
        }
      }

      // Unique validation (for create)
      if (mode === 'create' && rule.unique && value) {
        const existing = db.findOne(this.collection, { [field]: value });
        if (existing) {
          errors.push(`${field} '${value}' already exists`);
        }
      }

      // Custom validation
      if (rule.validate) {
        const customError = rule.validate(value, data);
        if (customError) errors.push(customError);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate field type
   */
  validateType(field, value, rule) {
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') return `${field} must be a string`;
        break;
      case 'number':
        if (isNaN(Number(value))) return `${field} must be a number`;
        break;
      case 'boolean':
        const boolVal = String(value).toLowerCase();
        if (!['true', 'false', '1', '0', 'yes', 'no'].includes(boolVal)) {
          return `${field} must be true/false`;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return `${field} must be a valid email`;
        break;
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) return `${field} must be a valid date`;
        break;
      case 'url':
        try {
          new URL(value);
        } catch {
          return `${field} must be a valid URL`;
        }
        break;
    }
    return null;
  }

  /**
   * Transform data based on schema
   */
  transformData(data) {
    const transformed = {};
    const rules = this.getValidationRules();

    for (const [field, rule] of Object.entries(rules)) {
      let value = data[field];

      // Use default if not provided
      if ((value === undefined || value === null || value === '') && rule.default !== undefined) {
        value = typeof rule.default === 'function' ? rule.default() : rule.default;
      }

      // Type conversion
      if (value !== undefined && value !== null && value !== '') {
        switch (rule.type) {
          case 'number':
            transformed[field] = Number(value);
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
    }

    return transformed;
  }

  // ============= CRUD WITH AUTO-VALIDATION =============
  /**
   * Find all with advanced filtering
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
   * Find by ID
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
      return { success: true, data: item };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create with auto-validation
   */
  async create(data) {
    try {
      // Auto validate
      const validation = await this.validate(data, 'create');
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
          statusCode: 400
        };
      }

      // Custom validation hook
      const customValidation = await this.validateCreate(data);
      if (!customValidation.success) {
        return customValidation;
      }

      // Transform & add timestamps
      const transformed = this.transformData(data);
      const enriched = await this.beforeCreate({
        ...transformed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Create
      const item = db.create(this.collection, enriched);

      // Hook
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
   * Update with auto-validation
   */
  async update(id, data) {
    try {
      // Check exists
      const existCheck = await this.findById(id);
      if (!existCheck.success) return existCheck;

      // Auto validate
      const validation = await this.validate(data, 'update');
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
          statusCode: 400
        };
      }

      // Custom validation hook
      const customValidation = await this.validateUpdate(id, data);
      if (!customValidation.success) {
        return customValidation;
      }

      // Transform & update timestamp
      const transformed = this.transformData(data);
      const enriched = await this.beforeUpdate(id, {
        ...transformed,
        updatedAt: new Date().toISOString()
      });

      // Update
      const updated = db.update(this.collection, id, enriched);

      // Hook
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
   * Delete
   */
  async delete(id) {
    try {
      const existCheck = await this.findById(id);
      if (!existCheck.success) return existCheck;

      const validation = await this.validateDelete(id);
      if (!validation.success) return validation;

      await this.beforeDelete(id);
      db.delete(this.collection, id);
      await this.afterDelete(id);

      return {
        success: true,
        message: `${this.getModelName()} deleted successfully`
      };
    } catch (error) {
      throw error;
    }
  }

  // ============= IMPORT/EXPORT =============
  /**
   * Import data from file buffer
   */
  async import(fileBuffer, filename, options = {}) {
    try {
      // Parse file
      const rawData = this.parseFile(fileBuffer, filename);

      // Validate headers
      const headerValidation = this.validateHeaders(rawData);
      if (!headerValidation.valid) {
        return {
          success: false,
          message: 'Invalid file headers',
          errors: headerValidation.errors
        };
      }

      const results = {
        total: rawData.length,
        success: 0,
        failed: 0,
        errors: [],
        inserted: []
      };

      // Process in batches
      for (let i = 0; i < rawData.length; i += this.BATCH_SIZE) {
        const batch = rawData.slice(i, i + this.BATCH_SIZE);

        for (let j = 0; j < batch.length; j++) {
          const rowIndex = i + j + 2; // Excel row number
          const row = batch[j];

          try {
            // Validate row
            const validation = await this.validate(row, 'create');
            if (!validation.isValid) {
              results.failed++;
              results.errors.push({
                row: rowIndex,
                data: row,
                errors: validation.errors
              });
              continue;
            }

            // Create
            const result = await this.create(row);
            if (result.success) {
              results.success++;
              results.inserted.push(result.data);
            } else {
              results.failed++;
              results.errors.push({
                row: rowIndex,
                data: row,
                errors: [result.message]
              });
            }
          } catch (error) {
            results.failed++;
            results.errors.push({
              row: rowIndex,
              data: row,
              errors: [error.message]
            });
          }
        }
      }

      return {
        success: true,
        message: `Import completed: ${results.success} succeeded, ${results.failed} failed`,
        data: results
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export data to Excel/CSV
   */
  async export(format = 'xlsx', options = {}) {
    try {
      // Get data
      const result = await this.findAll(options);
      let data = result.data;

      // Select columns
      const columns = options.columns || Object.keys(this.schema);
      const exportData = data.map(item => {
        const row = {};
        columns.forEach(col => {
          row[col] = item[col];
        });
        return row;
      });

      // Generate file
      if (format === 'csv') {
        return this.generateCSV(exportData);
      } else {
        return this.generateExcel(exportData);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate import template
   */
  generateTemplate(format = 'xlsx') {
    const templateRow = {};
    const instructionRow = {};

    for (const [field, config] of Object.entries(this.schema)) {
      templateRow[field] = '';

      let instruction = config.type;
      if (config.required) instruction += ', required';
      if (config.foreignKey) instruction += `, FK: ${config.foreignKey}`;
      if (config.min !== undefined) instruction += `, min: ${config.min}`;
      if (config.max !== undefined) instruction += `, max: ${config.max}`;
      if (config.values) instruction += `, values: ${config.values.join('|')}`;

      instructionRow[field] = instruction;
    }

    const data = [instructionRow, templateRow];

    if (format === 'csv') {
      return this.generateCSV(data);
    } else {
      return this.generateExcel(data);
    }
  }

  // ============= FILE PROCESSING HELPERS =============
  parseFile(fileBuffer, filename) {
    const extension = filename.split('.').pop().toLowerCase();

    if (extension === 'csv') {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (['xlsx', 'xls'].includes(extension)) {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      throw new Error('Unsupported file format');
    }
  }

  validateHeaders(data) {
    if (!data || data.length === 0) {
      return { valid: false, errors: ['File is empty'] };
    }

    const fileHeaders = Object.keys(data[0]);
    const requiredHeaders = Object.keys(this.schema).filter(
      key => this.schema[key].required
    );
    const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));

    if (missingHeaders.length > 0) {
      return {
        valid: false,
        errors: [`Missing required columns: ${missingHeaders.join(', ')}`]
      };
    }

    return { valid: true, errors: [] };
  }

  generateExcel(data, sheetName = 'Sheet1') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  generateCSV(data) {
    if (data.length === 0) return Buffer.from('');
    const parser = new Parser();
    const csv = parser.parse(data);
    return Buffer.from(csv);
  }

  // ============= HOOKS - Override in child class =============
  async validateCreate(data) { return { success: true }; }
  async validateUpdate(id, data) { return { success: true }; }
  async validateDelete(id) { return { success: true }; }
  async beforeCreate(data) { return data; }
  async beforeUpdate(id, data) { return data; }
  async afterCreate(item) { }
  async afterUpdate(item) { }
  async beforeDelete(id) { }
  async afterDelete(id) { }

  // ============= UTILITIES =============
  getModelName() {
    return this.collection.slice(0, -1);
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
}

module.exports = BaseService;