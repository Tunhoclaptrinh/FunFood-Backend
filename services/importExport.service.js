/**
 * Import/Export Service - Working with BaseService
 * Handles file parsing and generation only
 * Business logic is delegated to individual services
 */

const XLSX = require('xlsx');
const { Parser } = require('json2csv');

class ImportExportService {
  constructor() {
    this.BATCH_SIZE = 100;
  }

  /**
   * Get service instance for entity
   */
  getServiceForEntity(entityName) {
    const serviceMap = {
      'users': require('../services/user.service'),
      'categories': require('../services/category.service'),
      'restaurants': require('../services/restaurant.service'),
      'products': require('../services/product.service'),
      'promotions': require('../services/promotion.service')
    };

    const service = serviceMap[entityName];
    if (!service) {
      throw new Error(`Service not found for entity: ${entityName}`);
    }

    return service;
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
   * Import data - delegates to service
   */
  async importData(entityName, fileBuffer, filename, options = {}) {
    try {
      // Get service
      const service = this.getServiceForEntity(entityName);

      // Parse file
      const rawData = this.parseFile(fileBuffer, filename);

      if (!rawData || rawData.length === 0) {
        return {
          success: false,
          message: 'File is empty or invalid'
        };
      }

      // Validate headers
      const schema = service.getSchema();
      const fileHeaders = Object.keys(rawData[0]);
      const requiredHeaders = Object.keys(schema).filter(key => schema[key].required);
      const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));

      if (missingHeaders.length > 0) {
        return {
          success: false,
          message: `Missing required columns: ${missingHeaders.join(', ')}`
        };
      }

      // Delegate import to service
      const result = await service.importData(rawData);

      return result;

    } catch (error) {
      throw error;
    }
  }

  /**
   * Export data - delegates to service
   */
  async exportData(entityName, format = 'xlsx', options = {}) {
    try {
      // Get service
      const service = this.getServiceForEntity(entityName);

      // Get data from service
      const data = await service.prepareExportData(options);

      if (!data || data.length === 0) {
        // Return empty file
        return this.generateEmptyFile(format);
      }

      // Generate file
      if (format === 'csv') {
        return this.generateCSV(data);
      } else {
        return this.generateExcel(data, entityName);
      }

    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate template file
   */
  generateTemplate(entityName, format = 'xlsx') {
    const service = this.getServiceForEntity(entityName);
    const schema = service.getSchema();

    // Create header row
    const headers = {};
    const instructions = {};

    for (const [field, rules] of Object.entries(schema)) {
      headers[field] = ''; // Empty value

      // Build instruction
      let instruction = rules.type;
      if (rules.required) instruction += ', required';
      if (rules.foreignKey) instruction += `, FK: ${rules.foreignKey}`;
      if (rules.min !== undefined) instruction += `, min: ${rules.min}`;
      if (rules.max !== undefined) instruction += `, max: ${rules.max}`;
      if (rules.values) instruction += `, values: ${rules.values.join('|')}`;

      instructions[field] = instruction;
    }

    const data = [instructions, headers];

    if (format === 'csv') {
      return this.generateCSV(data);
    } else {
      return this.generateExcel(data, `${entityName}_template`);
    }
  }

  /**
   * Get schema from service
   */
  getEntitySchema(entityName) {
    try {
      const service = this.getServiceForEntity(entityName);
      return service.getSchema();
    } catch (error) {
      return null;
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
   * Generate empty file
   */
  generateEmptyFile(format) {
    if (format === 'csv') {
      return Buffer.from('No data available');
    } else {
      const worksheet = XLSX.utils.json_to_sheet([{ message: 'No data available' }]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
  }
}

module.exports = new ImportExportService();