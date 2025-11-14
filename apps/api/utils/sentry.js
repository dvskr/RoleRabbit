/**
 * Sentry Error Tracking Integration
 * Provides error monitoring and performance tracking for production
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const logger = require('./logger');

let isInitialized = false;

/**
 * Initialize Sentry error tracking
 */
function initializeSentry() {
  try {
    // Check if Sentry is enabled
    if (process.env.SENTRY_ENABLED === 'false') {
      logger.info('Sentry error tracking is disabled via environment variable');
      return false;
    }

    // Check if DSN is configured
    if (!process.env.SENTRY_DSN) {
      logger.warn('⚠️ Sentry DSN not configured. Error tracking disabled. Set SENTRY_DSN in environment variables.');
      return false;
    }

    // Determine environment
    const environment = process.env.NODE_ENV || 'development';

    // Only enable in production by default (can be overridden)
    if (environment !== 'production' && process.env.SENTRY_ENABLED !== 'true') {
      logger.info('Sentry disabled in non-production environment. Set SENTRY_ENABLED=true to enable.');
      return false;
    }

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment,
      release: process.env.SENTRY_RELEASE || `rolerabbit-api@${require('../package.json').version}`,

      // Performance monitoring
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1, // 10% of transactions
      profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 0.1, // 10% of transactions

      // Integrations
      integrations: [
        // HTTP integration for tracking HTTP requests
        new Sentry.Integrations.Http({ tracing: true }),

        // Console integration for capturing console.error
        new Sentry.Integrations.Console(),

        // Performance profiling
        new ProfilingIntegration(),
      ],

      // Before send hook - filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive data from event
        if (event.request) {
          // Remove authorization headers
          if (event.request.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
            delete event.request.headers['x-api-key'];
          }

          // Remove sensitive query parameters
          if (event.request.query_string) {
            event.request.query_string = event.request.query_string
              .replace(/token=[^&]*/g, 'token=[FILTERED]')
              .replace(/password=[^&]*/g, 'password=[FILTERED]')
              .replace(/api_key=[^&]*/g, 'api_key=[FILTERED]');
          }

          // Remove sensitive data from request body
          if (event.request.data) {
            try {
              const data = typeof event.request.data === 'string'
                ? JSON.parse(event.request.data)
                : event.request.data;

              // Filter sensitive fields
              const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard'];
              sensitiveFields.forEach(field => {
                if (data[field]) {
                  data[field] = '[FILTERED]';
                }
              });

              event.request.data = typeof event.request.data === 'string'
                ? JSON.stringify(data)
                : data;
            } catch (e) {
              // If parsing fails, just filter common patterns
              if (typeof event.request.data === 'string') {
                event.request.data = event.request.data
                  .replace(/"password":"[^"]*"/g, '"password":"[FILTERED]"')
                  .replace(/"token":"[^"]*"/g, '"token":"[FILTERED]"');
              }
            }
          }
        }

        // Filter breadcrumbs for sensitive data
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            if (breadcrumb.data) {
              const data = { ...breadcrumb.data };
              if (data.url) {
                data.url = data.url.replace(/token=[^&]*/g, 'token=[FILTERED]');
              }
              if (data.authorization) {
                data.authorization = '[FILTERED]';
              }
              return { ...breadcrumb, data };
            }
            return breadcrumb;
          });
        }

        return event;
      },

      // Ignore certain errors
      ignoreErrors: [
        // Browser/client errors
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',

        // Network errors
        'NetworkError',
        'Network request failed',

        // Known non-critical errors
        'premature close', // Fastify streaming artifact

        // Development-only errors
        /ChunkLoadError/,
      ],

      // Only send errors, not debug logs
      debug: process.env.SENTRY_DEBUG === 'true',
    });

    isInitialized = true;
    logger.info('✅ Sentry error tracking initialized');
    logger.info(`   → Environment: ${environment}`);
    logger.info(`   → Release: ${Sentry.getCurrentHub().getClient()?.getOptions().release}`);
    logger.info(`   → Traces sample rate: ${Sentry.getCurrentHub().getClient()?.getOptions().tracesSampleRate * 100}%`);

    return true;
  } catch (error) {
    logger.error('❌ Failed to initialize Sentry:', error.message);
    return false;
  }
}

/**
 * Capture exception to Sentry
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @returns {string|null} - Event ID
 */
function captureException(error, context = {}) {
  if (!isInitialized) {
    return null;
  }

  try {
    return Sentry.captureException(error, {
      contexts: context,
      tags: {
        source: 'api',
        ...context.tags
      }
    });
  } catch (e) {
    logger.error('Failed to capture exception in Sentry:', e.message);
    return null;
  }
}

/**
 * Capture message to Sentry
 * @param {string} message - Message to capture
 * @param {string} level - Severity level (fatal, error, warning, info, debug)
 * @param {Object} context - Additional context
 * @returns {string|null} - Event ID
 */
function captureMessage(message, level = 'info', context = {}) {
  if (!isInitialized) {
    return null;
  }

  try {
    return Sentry.captureMessage(message, {
      level,
      contexts: context,
      tags: {
        source: 'api',
        ...context.tags
      }
    });
  } catch (e) {
    logger.error('Failed to capture message in Sentry:', e.message);
    return null;
  }
}

/**
 * Set user context for Sentry
 * @param {Object} user - User object
 */
function setUser(user) {
  if (!isInitialized || !user) {
    return;
  }

  try {
    Sentry.setUser({
      id: user.id || user.userId,
      email: user.email,
      username: user.name || user.username,
      ip_address: user.ip
    });
  } catch (e) {
    logger.error('Failed to set user context in Sentry:', e.message);
  }
}

/**
 * Clear user context
 */
function clearUser() {
  if (!isInitialized) {
    return;
  }

  try {
    Sentry.setUser(null);
  } catch (e) {
    logger.error('Failed to clear user context in Sentry:', e.message);
  }
}

/**
 * Add breadcrumb for debugging
 * @param {Object} breadcrumb - Breadcrumb data
 */
function addBreadcrumb(breadcrumb) {
  if (!isInitialized) {
    return;
  }

  try {
    Sentry.addBreadcrumb({
      timestamp: Date.now() / 1000,
      ...breadcrumb
    });
  } catch (e) {
    logger.error('Failed to add breadcrumb in Sentry:', e.message);
  }
}

/**
 * Start transaction for performance monitoring
 * @param {string} name - Transaction name
 * @param {string} op - Operation type
 * @returns {Transaction|null} - Sentry transaction
 */
function startTransaction(name, op = 'http.server') {
  if (!isInitialized) {
    return null;
  }

  try {
    return Sentry.startTransaction({
      name,
      op
    });
  } catch (e) {
    logger.error('Failed to start transaction in Sentry:', e.message);
    return null;
  }
}

/**
 * Set tag for current scope
 * @param {string} key - Tag key
 * @param {string} value - Tag value
 */
function setTag(key, value) {
  if (!isInitialized) {
    return;
  }

  try {
    Sentry.setTag(key, value);
  } catch (e) {
    logger.error('Failed to set tag in Sentry:', e.message);
  }
}

/**
 * Set extra context data
 * @param {string} key - Context key
 * @param {any} value - Context value
 */
function setExtra(key, value) {
  if (!isInitialized) {
    return;
  }

  try {
    Sentry.setExtra(key, value);
  } catch (e) {
    logger.error('Failed to set extra context in Sentry:', e.message);
  }
}

/**
 * Flush Sentry events (wait for pending events to send)
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>}
 */
async function flush(timeout = 2000) {
  if (!isInitialized) {
    return true;
  }

  try {
    return await Sentry.flush(timeout);
  } catch (e) {
    logger.error('Failed to flush Sentry events:', e.message);
    return false;
  }
}

/**
 * Check if Sentry is initialized
 * @returns {boolean}
 */
function isEnabled() {
  return isInitialized;
}

/**
 * Get Sentry instance (for advanced usage)
 * @returns {typeof Sentry}
 */
function getSentry() {
  return Sentry;
}

module.exports = {
  initializeSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  startTransaction,
  setTag,
  setExtra,
  flush,
  isEnabled,
  getSentry
};
