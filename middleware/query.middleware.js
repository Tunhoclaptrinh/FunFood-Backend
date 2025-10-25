/**
 * Query Middleware - JSON Server Style
 * Hỗ trợ: pagination, sorting, filtering, search, relationships
 */

/**
 * Parse query parameters from request
 */
exports.parseQuery = (req, res, next) => {
  const query = req.query;

  const parsedQuery = {
    filter: {},
    page: parseInt(query._page) || parseInt(query.page) || 1,
    limit: parseInt(query._limit) || parseInt(query.limit) || 10,
    sort: query._sort || query.sort,
    order: (query._order || query.order || 'asc').toLowerCase(),
    q: query.q || query._q,
    embed: query._embed || query.embed,
    expand: query._expand || query.expand
  };

  // Validate and normalize values
  parsedQuery.page = Math.max(1, parsedQuery.page);
  parsedQuery.limit = Math.min(Math.max(1, parsedQuery.limit), 100); // Max 100 items per page

  if (parsedQuery.order !== 'asc' && parsedQuery.order !== 'desc') {
    parsedQuery.order = 'asc';
  }

  // Extract filter parameters
  Object.keys(query).forEach(key => {
    // Skip special parameters
    const specialParams = ['_page', '_limit', '_sort', '_order', '_q', '_embed', '_expand',
      'page', 'limit', 'sort', 'order', 'q', 'embed', 'expand'];

    if (specialParams.includes(key)) {
      return;
    }

    // Handle operator filters
    if (key.includes('_gte') || key.includes('_lte') || key.includes('_ne') ||
      key.includes('_like') || key.includes('_in')) {
      parsedQuery.filter[key] = query[key];
    } else {
      // Regular filter - convert to appropriate type
      const value = query[key];

      // Try to convert to number if possible
      if (!isNaN(value) && value !== '') {
        parsedQuery.filter[key] = Number(value);
      }
      // Convert boolean strings
      else if (value === 'true' || value === 'false') {
        parsedQuery.filter[key] = value === 'true';
      }
      // Keep as string
      else {
        parsedQuery.filter[key] = value;
      }
    }
  });

  // Clean up filter if empty
  if (Object.keys(parsedQuery.filter).length === 0) {
    parsedQuery.filter = null;
  }

  // Attach parsed query to request
  req.parsedQuery = parsedQuery;

  next();
};

/**
 * Format response with pagination headers (JSON Server style)
 */
exports.formatResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    // If data has pagination info, set headers
    if (data && data.pagination) {
      const { page, limit, total, totalPages } = data.pagination;

      // Set pagination headers
      res.set({
        'X-Total-Count': total,
        'X-Total-Pages': totalPages,
        'X-Current-Page': page,
        'X-Per-Page': limit,
        'Access-Control-Expose-Headers': 'X-Total-Count, X-Total-Pages, X-Current-Page, X-Per-Page, Link'
      });

      // Build Link header for pagination navigation
      const links = [];
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}${req.baseUrl}${req.path}`;

      // Create URLSearchParams from original query
      const buildLink = (pageNum) => {
        const params = new URLSearchParams(req.query);
        params.set('_page', pageNum);
        return `${baseUrl}?${params.toString()}`;
      };

      // First page
      links.push(`<${buildLink(1)}>; rel="first"`);

      // Previous page
      if (data.pagination.hasPrev) {
        links.push(`<${buildLink(page - 1)}>; rel="prev"`);
      }

      // Next page
      if (data.pagination.hasNext) {
        links.push(`<${buildLink(page + 1)}>; rel="next"`);
      }

      // Last page
      links.push(`<${buildLink(totalPages)}>; rel="last"`);

      res.set('Link', links.join(', '));
    }

    return originalJson(data);
  };

  next();
};

/**
 * Validate query parameters
 */
exports.validateQuery = (req, res, next) => {
  const { _page, page, _limit, limit } = req.query;

  const pageNum = parseInt(_page || page);
  const limitNum = parseInt(_limit || limit);

  if (_page && (isNaN(pageNum) || pageNum < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid page number. Must be a positive integer.'
    });
  }

  if (_limit && (isNaN(limitNum) || limitNum < 1 || limitNum > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid limit. Must be between 1 and 100.'
    });
  }

  next();
};

/**
 * Log query for debugging
 */
exports.logQuery = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && Object.keys(req.query).length > 0) {
    console.log('📊 Query:', {
      path: req.path,
      query: req.query,
      parsed: req.parsedQuery
    });
  }
  next();
};

module.exports = exports;