/**
 * Import/Export Controller
 * Handles file uploads and downloads
 */

const importExportService = require('../services/importExport.service');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx, .xls, and .csv files are allowed'));
    }
  }
});

class ImportExportController {
  /**
   * Import data from uploaded file
   * POST /api/:entity/import
   */
  importData = async (req, res, next) => {
    try {
      const entityName = req.params.entity;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const result = await importExportService.importData(
        entityName,
        req.file.buffer,
        req.file.originalname,
        req.body.options || {}
      );

      // Return partial success with errors
      res.status(result.data.failed > 0 ? 207 : 200).json({
        success: true,
        message: result.message,
        data: {
          summary: {
            total: result.data.total,
            success: result.data.success,
            failed: result.data.failed
          },
          inserted: result.data.inserted,
          errors: result.data.errors
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Export data to Excel/CSV
   * GET /api/:entity/export?format=xlsx&includeRelations=true
   */
  exportData = async (req, res, next) => {
    try {
      const entityName = req.params.entity;
      const format = req.query.format || 'xlsx';
      const includeRelations = req.query.includeRelations === 'true';

      // Get filters from query params
      const options = {
        ...req.parsedQuery,
        includeRelations,
        columns: req.query.columns ? req.query.columns.split(',') : null
      };

      const buffer = await importExportService.exportData(
        entityName,
        format,
        options
      );

      // Set response headers
      const filename = `${entityName}_${new Date().toISOString().split('T')[0]}.${format}`;
      const mimeType = format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Download import template
   * GET /api/:entity/template?format=xlsx
   */
  downloadTemplate = async (req, res, next) => {
    try {
      const entityName = req.params.entity;
      const format = req.query.format || 'xlsx';

      const buffer = importExportService.generateTemplate(entityName, format);

      // Set response headers
      const filename = `${entityName}_template.${format}`;
      const mimeType = format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get entity schema (for frontend to build forms)
   * GET /api/:entity/schema
   */
  getSchema = async (req, res, next) => {
    try {
      const entityName = req.params.entity;
      const schema = importExportService.getEntitySchema(entityName);

      if (!schema) {
        return res.status(404).json({
          success: false,
          message: `Schema not found for entity: ${entityName}`
        });
      }

      res.json({
        success: true,
        data: {
          entity: entityName,
          schema: schema
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get multer middleware for file upload
   */
  getUploadMiddleware() {
    return upload.single('file');
  }
}

module.exports = new ImportExportController();