/**
 * Validation Middleware - Auto-generated from Schemas
 * Provides flexible validation methods
 */

const schemas = require('../schemas');

/**
 * Auto-validate request body theo schema
 * Usage: router.post('/', validateSchema('product'), controller.create)
 */
exports.validateSchema = (entity) => {
  return (req, res, next) => {
    const schema = schemas[entity];
    if (!schema) return next();

    const errors = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = req.body[field];

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
      let typeError = null;
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') typeError = `${field} must be a string`;
          if (rule.minLength && value.length < rule.minLength) typeError = `${field} must be at least ${rule.minLength} characters`;
          if (rule.maxLength && value.length > rule.maxLength) typeError = `${field} must be at most ${rule.maxLength} characters`;
          break;
        case 'number':
          if (isNaN(Number(value))) typeError = `${field} must be a number`;
          else {
            const num = Number(value);
            if (rule.min !== undefined && num < rule.min) typeError = `${field} must be >= ${rule.min}`;
            if (rule.max !== undefined && num > rule.max) typeError = `${field} must be <= ${rule.max}`;
          }
          break;
        case 'boolean':
          const boolStr = String(value).toLowerCase();
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(boolStr)) typeError = `${field} must be true/false`;
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) typeError = `${field} must be a valid email`;
          break;
        case 'date':
          if (isNaN(new Date(value).getTime())) typeError = `${field} must be a valid date`;
          break;
        case 'enum':
          if (!rule.enum.includes(value)) typeError = `${field} must be one of: ${rule.enum.join(', ')}`;
          break;
      }

      if (typeError) {
        errors[field] = typeError;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.entries(errors).map(([field, message]) => ({
          field,
          message
        }))
      });
    }

    next();
  };
};

/**
 * Validate specific fields only
 * Usage: router.put('/:id', validateFields('product', ['name', 'price']), controller.update)
 */
exports.validateFields = (entity, fields) => {
  return (req, res, next) => {
    const schema = schemas[entity];
    if (!schema) return next();

    const errors = {};
    const fieldsToValidate = Array.isArray(fields) ? fields : [fields];

    for (const field of fieldsToValidate) {
      const value = req.body[field];
      const rule = schema[field];

      if (!rule) continue;

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      // Type validation (simplified)
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') errors[field] = `${field} must be a string`;
          break;
        case 'number':
          if (isNaN(Number(value))) errors[field] = `${field} must be a number`;
          break;
        case 'boolean':
          if (typeof value !== 'boolean') errors[field] = `${field} must be true/false`;
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) errors[field] = `${field} must be a valid email`;
          break;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.entries(errors).map(([field, message]) => ({
          field,
          message
        }))
      });
    }

    next();
  };
};

/**
 * Get schema documentation
 * GET /api/schema/:entity
 */
exports.getSchemaDoc = (req, res) => {
  const { entity } = req.params;
  const schema = schemas[entity];

  if (!schema) {
    return res.status(404).json({
      success: false,
      message: `Schema not found for entity: ${entity}`
    });
  }

  const doc = {
    entity,
    fields: {}
  };

  for (const [field, rule] of Object.entries(schema)) {
    doc.fields[field] = {
      type: rule.type,
      required: rule.required || false,
      description: rule.description || '',
      constraints: {}
    };

    if (rule.min !== undefined) doc.fields[field].constraints.min = rule.min;
    if (rule.max !== undefined) doc.fields[field].constraints.max = rule.max;
    if (rule.minLength) doc.fields[field].constraints.minLength = rule.minLength;
    if (rule.maxLength) doc.fields[field].constraints.maxLength = rule.maxLength;
    if (rule.enum) doc.fields[field].constraints.enum = rule.enum;
    if (rule.unique) doc.fields[field].constraints.unique = true;
    if (rule.foreignKey) doc.fields[field].constraints.foreignKey = rule.foreignKey;
  }

  res.json({
    success: true,
    data: doc
  });
};

/**
 * Get all schemas
 * GET /api/schemas
 */
exports.getAllSchemas = (req, res) => {
  const allSchemas = {};

  for (const [entity, schema] of Object.entries(schemas)) {
    const doc = {
      entity,
      fields: {}
    };

    for (const [field, rule] of Object.entries(schema)) {
      doc.fields[field] = {
        type: rule.type,
        required: rule.required || false,
        description: rule.description || ''
      };
    }

    allSchemas[entity] = doc;
  }

  res.json({
    success: true,
    data: allSchemas
  });
};