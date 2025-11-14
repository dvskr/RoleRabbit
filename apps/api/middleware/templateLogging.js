/**
 * Template API Request Logging Middleware
 * Tracks request metrics, duration, errors, and structured logging
 */

const logger = require('../utils/logger');
const {
  templateRequestCounter,
  templateRequestDuration,
  templateErrorCounter
} = require('../observability/metrics');

/**
 * Extracts endpoint name from request path
 * @param {string} url - Request URL
 * @returns {string} - Normalized endpoint name
 */
function getEndpointName(url) {
  const path = url.split('?')[0]; // Remove query params

  // Normalize template ID paths
  if (path.match(/\/api\/templates\/tpl_[a-zA-Z0-9]+$/)) {
    return '/api/templates/:id';
  }
  if (path.match(/\/api\/templates\/tpl_[a-zA-Z0-9]+\/favorite$/)) {
    return '/api/templates/:id/favorite';
  }
  if (path.match(/\/api\/templates\/tpl_[a-zA-Z0-9]+\/track$/)) {
    return '/api/templates/:id/track';
  }
  if (path.match(/\/api\/templates\/tpl_[a-zA-Z0-9]+\/stats$/)) {
    return '/api/templates/:id/stats';
  }
  if (path.match(/\/api\/templates\/favorites\/check\/tpl_[a-zA-Z0-9]+$/)) {
    return '/api/templates/favorites/check/:id';
  }

  return path;
}

/**
 * Template request logging middleware
 */
async function templateLoggingMiddleware(request, reply) {
  // Only log template API routes
  if (!request.url.startsWith('/api/templates')) {
    return;
  }

  const startTime = Date.now();
  const endpoint = getEndpointName(request.url);
  const method = request.method;

  // Log request start
  logger.http(`[Template API] ${method} ${endpoint}`, {
    userId: request.user?.id || 'anonymous',
    query: request.query,
    params: request.params
  });

  // Track request initiation
  const endTimer = templateRequestDuration.startTimer({ endpoint, method });

  // Hook into response to log completion
  reply.addHook('onSend', async (request, reply, payload) => {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const status = reply.statusCode;

    // Stop timer and record metrics
    endTimer();
    templateRequestCounter.inc({ endpoint, method, status });

    // Log errors
    if (status >= 400) {
      const errorType = status >= 500 ? 'server_error' : 'client_error';
      templateErrorCounter.inc({ endpoint, error_type: errorType });

      logger.error(`[Template API] ${method} ${endpoint} - ${status}`, {
        userId: request.user?.id || 'anonymous',
        duration,
        status,
        error: payload
      });
    } else {
      // Log successful requests
      logger.info(`[Template API] ${method} ${endpoint} - ${status}`, {
        userId: request.user?.id || 'anonymous',
        duration,
        status
      });
    }

    return payload;
  });
}

/**
 * Error logging helper for template services
 */
function logTemplateError(context, error, additionalData = {}) {
  logger.error(`[Template Service Error] ${context}`, {
    error: error.message,
    stack: error.stack,
    ...additionalData
  });
}

/**
 * Info logging helper for template operations
 */
function logTemplateInfo(message, data = {}) {
  logger.info(`[Template Service] ${message}`, data);
}

/**
 * Debug logging helper for template operations
 */
function logTemplateDebug(message, data = {}) {
  logger.debug(`[Template Service] ${message}`, data);
}

module.exports = {
  templateLoggingMiddleware,
  logTemplateError,
  logTemplateInfo,
  logTemplateDebug,
  getEndpointName
};
