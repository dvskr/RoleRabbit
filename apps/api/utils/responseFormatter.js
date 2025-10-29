/**
 * Response Formatter Utility
 * Standardizes API response format
 */

/**
 * Success response format
 */
function success(data, message = null, meta = {}) {
  return {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

/**
 * Error response format
 */
function error(message, errors = null, code = 'ERROR', statusCode = 400) {
  return {
    success: false,
    error: {
      code,
      message,
      errors
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Pagination response format
 */
function paginated(data, page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  
  return success(data, null, {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}

/**
 * List response format
 */
function list(items, meta = {}) {
  return success(items, null, {
    count: items.length,
    ...meta
  });
}

/**
 * Single item response format
 */
function item(data, message = null) {
  return success(data, message);
}

/**
 * Created response format (201)
 */
function created(data, message = 'Resource created successfully') {
  return success(data, message);
}

/**
 * Updated response format
 */
function updated(data, message = 'Resource updated successfully') {
  return success(data, message);
}

/**
 * Deleted response format
 */
function deleted(message = 'Resource deleted successfully') {
  return success(null, message);
}

/**
 * Not found response
 */
function notFound(resource = 'Resource') {
  return error(
    `${resource} not found`,
    null,
    'NOT_FOUND',
    404
  );
}

/**
 * Unauthorized response
 */
function unauthorized(message = 'Unauthorized access') {
  return error(
    message,
    null,
    'UNAUTHORIZED',
    401
  );
}

/**
 * Forbidden response
 */
function forbidden(message = 'Forbidden access') {
  return error(
    message,
    null,
    'FORBIDDEN',
    403
  );
}

/**
 * Validation error response
 */
function validationError(errors, message = 'Validation failed') {
  return error(
    message,
    errors,
    'VALIDATION_ERROR',
    422
  );
}

/**
 * Internal server error response
 */
function internalError(message = 'Internal server error') {
  return error(
    message,
    null,
    'INTERNAL_ERROR',
    500
  );
}

module.exports = {
  success,
  error,
  paginated,
  list,
  item,
  created,
  updated,
  deleted,
  notFound,
  unauthorized,
  forbidden,
  validationError,
  internalError
};

