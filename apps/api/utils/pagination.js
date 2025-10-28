/**
 * Pagination Utilities
 * Provides consistent pagination across API endpoints
 */

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Parse pagination parameters from request
 */
function parsePagination(request) {
  const page = Math.max(1, parseInt(request.query.page) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(request.query.pageSize) || DEFAULT_PAGE_SIZE)
  );
  
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize
  };
}

/**
 * Create pagination response
 */
function createPaginatedResponse(data, total, page, pageSize) {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * Validate pagination params
 */
function validatePagination(page, pageSize) {
  const errors = [];
  
  if (page < 1) {
    errors.push('Page must be greater than 0');
  }
  
  if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    errors.push(`Page size must be between 1 and ${MAX_PAGE_SIZE}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  parsePagination,
  createPaginatedResponse,
  validatePagination,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
};

