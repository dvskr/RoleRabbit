/**
 * Error Tracking Utility
 * Centralized error tracking and reporting
 * 
 * Supports: Sentry, LogRocket, Rollbar, or custom tracking
 */

const logger = require('./logger');

/**
 * Error tracking configuration
 */
const config = {
  enabled: process.env.ERROR_TRACKING_ENABLED === 'true',
  service: process.env.ERROR_TRACKING_SERVICE || 'sentry', // sentry, rollbar, custom
  dsn: process.env.ERROR_TRACKING_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.APP_VERSION || 'unknown',
  sampleRate: parseFloat(process.env.ERROR_SAMPLE_RATE) || 1.0
};

/**
 * Initialize error tracking service
 * Call this once at application startup
 */
function initializeErrorTracking() {
  if (!config.enabled) {
    logger.info('[ERROR_TRACKING] Error tracking disabled');
    return;
  }

  if (!config.dsn) {
    logger.warn('[ERROR_TRACKING] Error tracking enabled but no DSN provided');
    return;
  }

  try {
    // Initialize based on service
    switch (config.service) {
      case 'sentry':
        initializeSentry();
        break;
      case 'rollbar':
        initializeRollbar();
        break;
      default:
        logger.warn(`[ERROR_TRACKING] Unknown service: ${config.service}`);
    }

    logger.info(`[ERROR_TRACKING] ✅ ${config.service} initialized for ${config.environment}`);
  } catch (error) {
    logger.error('[ERROR_TRACKING] Failed to initialize error tracking', {
      error: error.message
    });
  }
}

/**
 * Initialize Sentry
 * Requires: npm install @sentry/node
 */
function initializeSentry() {
  try {
    const Sentry = require('@sentry/node');
    
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      sampleRate: config.sampleRate,
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
      integrations: [
        // Add integrations as needed
      ],
      beforeSend(event, hint) {
        // Filter sensitive data
        return filterSensitiveData(event);
      }
    });

    global.errorTracker = Sentry;
  } catch (error) {
    logger.error('[ERROR_TRACKING] Sentry not installed. Run: npm install @sentry/node');
    throw error;
  }
}

/**
 * Initialize Rollbar
 * Requires: npm install rollbar
 */
function initializeRollbar() {
  try {
    const Rollbar = require('rollbar');
    
    const rollbar = new Rollbar({
      accessToken: config.dsn,
      environment: config.environment,
      codeVersion: config.release,
      captureUncaught: true,
      captureUnhandledRejections: true
    });

    global.errorTracker = rollbar;
  } catch (error) {
    logger.error('[ERROR_TRACKING] Rollbar not installed. Run: npm install rollbar');
    throw error;
  }
}

/**
 * Capture an exception
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
function captureException(error, context = {}) {
  // Always log locally
  logger.error('[ERROR] Exception captured', {
    error: error.message,
    stack: error.stack,
    ...context
  });

  if (!config.enabled || !global.errorTracker) {
    return;
  }

  try {
    // Filter sensitive data from context
    const filteredContext = filterSensitiveData(context);

    if (config.service === 'sentry') {
      global.errorTracker.captureException(error, {
        extra: filteredContext,
        tags: {
          environment: config.environment,
          ...filteredContext.tags
        }
      });
    } else if (config.service === 'rollbar') {
      global.errorTracker.error(error, filteredContext);
    }
  } catch (trackingError) {
    logger.error('[ERROR_TRACKING] Failed to capture exception', {
      error: trackingError.message
    });
  }
}

/**
 * Capture a message (non-error event)
 * @param {string} message - Message to capture
 * @param {string} level - Severity level (info, warning, error)
 * @param {Object} context - Additional context
 */
function captureMessage(message, level = 'info', context = {}) {
  // Always log locally
  logger[level](`[${level.toUpperCase()}] ${message}`, context);

  if (!config.enabled || !global.errorTracker) {
    return;
  }

  try {
    const filteredContext = filterSensitiveData(context);

    if (config.service === 'sentry') {
      global.errorTracker.captureMessage(message, {
        level,
        extra: filteredContext
      });
    } else if (config.service === 'rollbar') {
      global.errorTracker[level](message, filteredContext);
    }
  } catch (trackingError) {
    logger.error('[ERROR_TRACKING] Failed to capture message', {
      error: trackingError.message
    });
  }
}

/**
 * Set user context for error tracking
 * @param {Object} user - User information
 */
function setUser(user) {
  if (!config.enabled || !global.errorTracker) {
    return;
  }

  try {
    const userContext = {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier
    };

    if (config.service === 'sentry') {
      global.errorTracker.setUser(userContext);
    } else if (config.service === 'rollbar') {
      global.errorTracker.configure({
        payload: {
          person: userContext
        }
      });
    }
  } catch (error) {
    logger.error('[ERROR_TRACKING] Failed to set user context', {
      error: error.message
    });
  }
}

/**
 * Add breadcrumb (event trail)
 * @param {Object} breadcrumb - Breadcrumb data
 */
function addBreadcrumb(breadcrumb) {
  if (!config.enabled || !global.errorTracker) {
    return;
  }

  try {
    if (config.service === 'sentry') {
      global.errorTracker.addBreadcrumb(breadcrumb);
    }
  } catch (error) {
    logger.error('[ERROR_TRACKING] Failed to add breadcrumb', {
      error: error.message
    });
  }
}

/**
 * Filter sensitive data from error reports
 * @param {Object} data - Data to filter
 * @returns {Object} Filtered data
 */
function filterSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const filtered = { ...data };
  const sensitiveKeys = [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
    'cookie',
    'session',
    'jwt',
    'accessToken',
    'refreshToken'
  ];

  // Recursively filter sensitive keys
  function filterObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(filterObject);
    }

    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Check if key contains sensitive words
      const isSensitive = sensitiveKeys.some(sensitive => 
        lowerKey.includes(sensitive.toLowerCase())
      );

      if (isSensitive) {
        result[key] = '[FILTERED]';
      } else if (typeof value === 'object') {
        result[key] = filterObject(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return filterObject(filtered);
}

/**
 * Create Fastify error handler middleware
 * @returns {Function} Fastify error handler
 */
function createErrorHandler() {
  return async (error, request, reply) => {
    // Capture error with context
    captureException(error, {
      url: request.url,
      method: request.method,
      userId: request.user?.userId,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    });

    // Don't expose internal errors to users
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 
      ? 'Internal server error' 
      : error.message;

    reply.status(statusCode).send({
      success: false,
      error: message
    });
  };
}

/**
 * Wrap async function with error tracking
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
function wrapWithErrorTracking(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error, {
        function: fn.name,
        args: filterSensitiveData(args)
      });
      throw error;
    }
  };
}

/**
 * Track performance metric
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 * @param {Object} tags - Additional tags
 */
function trackPerformance(name, value, tags = {}) {
  if (!config.enabled || !global.errorTracker) {
    return;
  }

  try {
    if (config.service === 'sentry') {
      // Sentry performance tracking
      global.errorTracker.captureMessage(`Performance: ${name}`, {
        level: 'info',
        extra: { value, ...tags }
      });
    }
  } catch (error) {
    logger.error('[ERROR_TRACKING] Failed to track performance', {
      error: error.message
    });
  }
}

module.exports = {
  initializeErrorTracking,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  createErrorHandler,
  wrapWithErrorTracking,
  trackPerformance,
  config
};

