/**
 * Pagination Utility
 * 
 * Standardized pagination for list endpoints.
 * Supports cursor-based and offset-based pagination.
 */

/**
 * Parse pagination parameters from request
 */
function parsePaginationParams(req, defaults = {}) {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    maxLimit = 100
  } = defaults;

  const page = Math.max(1, parseInt(req.query.page) || defaultPage);
  const limit = Math.min(
    Math.max(1, parseInt(req.query.limit) || defaultLimit),
    maxLimit
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Create pagination response
 */
function createPaginationResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  };
}

/**
 * Paginate Prisma query
 */
async function paginatePrismaQuery(model, options = {}) {
  const {
    where = {},
    orderBy = {},
    include = {},
    select = null,
    page = 1,
    limit = 10
  } = options;

  const offset = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      include,
      select,
      take: limit,
      skip: offset
    }),
    model.count({ where })
  ]);

  return createPaginationResponse(data, total, page, limit);
}

/**
 * Cursor-based pagination
 * Better for large datasets and real-time data
 */
function parseCursorParams(req, defaults = {}) {
  const {
    defaultLimit = 10,
    maxLimit = 100
  } = defaults;

  const cursor = req.query.cursor || null;
  const limit = Math.min(
    Math.max(1, parseInt(req.query.limit) || defaultLimit),
    maxLimit
  );

  return { cursor, limit };
}

/**
 * Create cursor pagination response
 */
function createCursorResponse(data, cursorField = 'id') {
  const hasMore = data.length > 0;
  const nextCursor = hasMore ? data[data.length - 1][cursorField] : null;

  return {
    data,
    pagination: {
      hasMore,
      nextCursor,
      count: data.length
    }
  };
}

/**
 * Paginate with cursor
 */
async function paginateWithCursor(model, options = {}) {
  const {
    where = {},
    orderBy = {},
    include = {},
    select = null,
    cursor = null,
    limit = 10,
    cursorField = 'id'
  } = options;

  const query = {
    where,
    orderBy,
    include,
    select,
    take: limit + 1 // Fetch one extra to check if there's more
  };

  if (cursor) {
    query.cursor = { [cursorField]: cursor };
    query.skip = 1; // Skip the cursor itself
  }

  const data = await model.findMany(query);
  
  // Check if there's more data
  const hasMore = data.length > limit;
  if (hasMore) {
    data.pop(); // Remove the extra item
  }

  return createCursorResponse(data, cursorField);
}

/**
 * Middleware: Add pagination helpers to request
 */
function paginationMiddleware(defaults = {}) {
  return (req, res, next) => {
    // Offset-based pagination
    req.pagination = parsePaginationParams(req, defaults);
    
    // Cursor-based pagination
    req.cursorPagination = parseCursorParams(req, defaults);
    
    // Helper to send paginated response
    res.paginate = (data, total) => {
      const { page, limit } = req.pagination;
      return res.json(createPaginationResponse(data, total, page, limit));
    };
    
    // Helper to send cursor response
    res.cursorPaginate = (data, cursorField = 'id') => {
      return res.json(createCursorResponse(data, cursorField));
    };
    
    next();
  };
}

/**
 * Search with pagination
 */
async function searchWithPagination(model, options = {}) {
  const {
    searchFields = [],
    searchTerm = '',
    where = {},
    orderBy = {},
    page = 1,
    limit = 10
  } = options;

  // Build search conditions
  const searchConditions = searchTerm
    ? {
        OR: searchFields.map(field => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }))
      }
    : {};

  // Combine with existing where conditions
  const combinedWhere = {
    ...where,
    ...searchConditions
  };

  return paginatePrismaQuery(model, {
    where: combinedWhere,
    orderBy,
    page,
    limit
  });
}

module.exports = {
  parsePaginationParams,
  createPaginationResponse,
  paginatePrismaQuery,
  parseCursorParams,
  createCursorResponse,
  paginateWithCursor,
  paginationMiddleware,
  searchWithPagination
};
