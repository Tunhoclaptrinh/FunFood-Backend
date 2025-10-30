/**
 * Generic Import/Export Service
 * Supports Excel (.xlsx) and CSV formats
 * Features: Validation, Batch Processing, Error Reporting, Template Generation
 */

const XLSX = require('xlsx');
const { Parser } = require('json2csv');
const db = require('../config/database');

class ImportExportService {
  constructor() {
    this.BATCH_SIZE = 100; // Process 100 rows at a time
  }

  /**
   * Define schema for each entity
   * This maps entity properties to validation rules
   */
  getEntitySchema(entityName) {
    const schemas = {
      products: {
        name: { type: 'string', required: true },
        description: { type: 'string', required: false },
        price: { type: 'number', required: true, min: 0 },
        restaurantId: { type: 'number', required: true, foreignKey: 'restaurants' },
        categoryId: { type: 'number', required: false, foreignKey: 'categories' },
        discount: { type: 'number', required: false, min: 0, max: 100, default: 0 },
        available: { type: 'boolean', required: false, default: true },
        image: { type: 'string', required: false }
      },
      restaurants: {
        name: { type: 'string', required: true, unique: true },
        description: { type: 'string', required: false },
        categoryId: { type: 'number', required: true, foreignKey: 'categories' },
        address: { type: 'string', required: true },
        phone: { type: 'string', required: false },
        deliveryFee: { type: 'number', required: false, min: 0, default: 15000 },
        deliveryTime: { type: 'string', required: false },
        openTime: { type: 'string', required: false },
        closeTime: { type: 'string', required: false },
        latitude: { type: 'number', required: false },
        longitude: { type: 'number', required: false },
        isOpen: { type: 'boolean', required: false, default: true },
        image: { type: 'string', required: false }
      },
      categories: {
        name: { type: 'string', required: true, unique: true },
        icon: { type: 'string', required: false },
        image: { type: 'string', required: false }
      },
      promotions: {
        code: { type: 'string', required: true, unique: true },
        description: { type: 'string', required: true },
        discountType: { type: 'enum', required: true, values: ['percentage', 'fixed', 'delivery'] },
        discountValue: { type: 'number', required: true, min: 0 },
        minOrderValue: { type: 'number', required: false, min: 0, default: 0 },
        maxDiscount: { type: 'number', required: false },
        validFrom: { type: 'date', required: true },
        validTo: { type: 'date', required: true },
        usageLimit: { type: 'number', required: false },
        perUserLimit: { type: 'number', required: false },
        isActive: { type: 'boolean', required: false, default: true }
      },
      users: {
        email: { type: 'email', required: true, unique: true },
        name: { type: 'string', required: true },
        phone: { type: 'string', required: true },
        address: { type: 'string', required: false },
        role: { type: 'enum', required: false, values: ['customer', 'admin'], default: 'customer' },
        isActive: { type: 'boolean', required: false, default: true }
      }
    };

    return schemas[entityName] || null;
  }

  /**
   * Parse uploaded file (Excel or CSV)
   */
  parseFile(fileBuffer, filename) {
    try {
      const extension = filename.split('.').pop().toLowerCase();

      if (extension === 'csv') {
        return this.parseCSV(fileBuffer);
      } else if (['xlsx', 'xls'].includes(extension)) {
        return this.parseExcel(fileBuffer);
      } else {
        throw new Error('Unsupported file format. Use .xlsx, .xls, or .csv');
      }
    } catch (error) {
      throw new Error(`File parsing error: ${error.message}`);
    }
  }

  /**
   * Parse CSV file
   */
  parseCSV(fileBuffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return data;
  }

  /**
   * Parse Excel file
   */
  parseExcel(fileBuffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return data;
  }

  /**
   * Validate headers against schema
   */
  validateHeaders(data, schema) {
    if (!data || data.length === 0) {
      return { valid: false, errors: ['File is empty'] };
    }

    const fileHeaders = Object.keys(data[0]);
    const requiredHeaders = Object.keys(schema).filter(key => schema[key].required);
    const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));

    if (missingHeaders.length > 0) {
      return {
        valid: false,
        errors: [`Missing required columns: ${missingHeaders.join(', ')}`]
      };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate single row
   */
  validateRow(row, rowIndex, schema) {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = row[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`Row ${rowIndex}: ${field} is required`);
        continue;
      }

      // Skip validation if field is optional and empty
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      switch (rules.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Row ${rowIndex}: ${field} must be a string`);
          }
          break;

        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`Row ${rowIndex}: ${field} must be a number`);
          } else {
            const num = Number(value);
            if (rules.min !== undefined && num < rules.min) {
              errors.push(`Row ${rowIndex}: ${field} must be >= ${rules.min}`);
            }
            if (rules.max !== undefined && num > rules.max) {
              errors.push(`Row ${rowIndex}: ${field} must be <= ${rules.max}`);
            }
          }
          break;

        case 'boolean':
          const boolValue = String(value).toLowerCase();
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(boolValue)) {
            errors.push(`Row ${rowIndex}: ${field} must be true/false`);
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`Row ${rowIndex}: ${field} must be a valid email`);
          }
          break;

        case 'date':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push(`Row ${rowIndex}: ${field} must be a valid date`);
          }
          break;

        case 'enum':
          if (!rules.values.includes(value)) {
            errors.push(`Row ${rowIndex}: ${field} must be one of: ${rules.values.join(', ')}`);
          }
          break;
      }

      // Foreign key validation
      if (rules.foreignKey) {
        const relatedEntity = db.findById(rules.foreignKey, value);
        if (!relatedEntity) {
          errors.push(`Row ${rowIndex}: ${field} references non-existent ${rules.foreignKey} (ID: ${value})`);
        }
      }

      // Unique validation
      if (rules.unique) {
        // Will be checked during insert
      }
    }

    return errors;
  }

  /**
   * Transform row data according to schema
   */
  transformRow(row, schema) {
    const transformed = {};

    for (const [field, rules] of Object.entries(schema)) {
      let value = row[field];

      // Use default value if not provided
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
   * Import data from file
   */
  async importData(entityName, fileBuffer, filename, options = {}) {
    try {
      const schema = this.getEntitySchema(entityName);
      if (!schema) {
        throw new Error(`Schema not found for entity: ${entityName}`);
      }

      // Parse file
      const rawData = this.parseFile(fileBuffer, filename);

      // Validate headers
      const headerValidation = this.validateHeaders(rawData, schema);
      if (!headerValidation.valid) {
        return {
          success: false,
          message: 'Header validation failed',
          errors: headerValidation.errors
        };
      }

      // Validate and process rows in batches
      const results = {
        total: rawData.length,
        success: 0,
        failed: 0,
        errors: [],
        inserted: []
      };

      for (let i = 0; i < rawData.length; i += this.BATCH_SIZE) {
        const batch = rawData.slice(i, i + this.BATCH_SIZE);

        for (let j = 0; j < batch.length; j++) {
          const rowIndex = i + j + 2; // +2 because Excel starts at 1 and has header
          const row = batch[j];

          // Validate row
          const rowErrors = this.validateRow(row, rowIndex, schema);

          if (rowErrors.length > 0) {
            results.failed++;
            results.errors.push({
              row: rowIndex,
              data: row,
              errors: rowErrors
            });
            continue; // Skip this row, continue with others
          }

          try {
            // Transform and insert
            const transformed = this.transformRow(row, schema);

            // Check unique constraints
            let isDuplicate = false;
            for (const [field, rules] of Object.entries(schema)) {
              if (rules.unique && transformed[field]) {
                const existing = db.findOne(entityName, { [field]: transformed[field] });
                if (existing) {
                  results.failed++;
                  results.errors.push({
                    row: rowIndex,
                    data: row,
                    errors: [`${field} '${transformed[field]}' already exists`]
                  });
                  isDuplicate = true;
                  break;
                }
              }
            }

            if (isDuplicate) continue;

            // Insert to database
            const inserted = db.create(entityName, transformed);
            results.success++;
            results.inserted.push(inserted);

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
  async exportData(entityName, format = 'xlsx', options = {}) {
    try {
      const schema = this.getEntitySchema(entityName);
      if (!schema) {
        throw new Error(`Schema not found for entity: ${entityName}`);
      }

      // Get data with filters
      const result = db.findAllAdvanced(entityName, options);
      let data = result.data;

      // Include relations if specified
      if (options.includeRelations) {
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

      // Select columns to export
      const columns = options.columns || Object.keys(schema);
      const exportData = data.map(item => {
        const row = {};
        columns.forEach(col => {
          row[col] = item[col];
          // Include relation names if available
          if (item[`${col}_name`]) {
            row[`${col}_name`] = item[`${col}_name`];
          }
        });
        return row;
      });

      // Generate file
      if (format === 'csv') {
        return this.generateCSV(exportData);
      } else {
        return this.generateExcel(exportData, entityName);
      }

    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate Excel file
   */
  generateExcel(data, sheetName = 'Sheet1') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  /**
   * Generate CSV file
   */
  generateCSV(data) {
    if (data.length === 0) {
      return Buffer.from('');
    }

    const parser = new Parser();
    const csv = parser.parse(data);
    return Buffer.from(csv);
  }

  /**
   * Generate template file for import
   */
  generateTemplate(entityName, format = 'xlsx') {
    const schema = this.getEntitySchema(entityName);
    if (!schema) {
      throw new Error(`Schema not found for entity: ${entityName}`);
    }

    // Create sample row with instructions
    const templateRow = {};
    const instructionRow = {};

    for (const [field, rules] of Object.entries(schema)) {
      templateRow[field] = ''; // Empty value

      // Add instruction
      let instruction = rules.type;
      if (rules.required) instruction += ', required';
      if (rules.foreignKey) instruction += `, FK: ${rules.foreignKey}`;
      if (rules.min !== undefined) instruction += `, min: ${rules.min}`;
      if (rules.max !== undefined) instruction += `, max: ${rules.max}`;
      if (rules.values) instruction += `, values: ${rules.values.join('|')}`;

      instructionRow[field] = instruction;
    }

    const data = [instructionRow, templateRow];

    if (format === 'csv') {
      return this.generateCSV(data);
    } else {
      return this.generateExcel(data, `${entityName}_template`);
    }
  }
}

module.exports = new ImportExportService();