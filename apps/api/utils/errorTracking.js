/**
 * Error Tracking Integration
 * 
 * Integrates with Sentry, Rollbar, or similar error tracking services
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry
 */
function initializeSentry(app) {
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || 'unknown',
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new ProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app })
    ],
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from event
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      
      return event;
    }
  });

  console.log('✅ Sentry initialized');
}

/**
 * Sentry request handler middleware
 */
function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}

/**
 * Sentry tracing middleware
 */
function sentryTracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

/**
 * Sentry error handler middleware
 */
function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}

/**
 * Capture exception with context
 */
function captureException(error, context = {}) {
  if (!process.env.SENTRY_DSN) {
    console.error('Error (Sentry not configured):', error);
    return;
  }

  Sentry.captureException(error, {
    tags: {
      component: context.component,
      operation: context.operation
    },
    user: context.userId ? {
      id: context.userId
    } : undefined,
    extra: context
  });
}

/**
 * Capture message with context
 */
function captureMessage(message, level = 'info', context = {}) {
  if (!process.env.SENTRY_DSN) {
    console.log(`Message (Sentry not configured): ${message}`);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    tags: {
      component: context.component,
      operation: context.operation
    },
    user: context.userId ? {
      id: context.userId
    } : undefined,
    extra: context
  });
}

/**
 * Set user context
 */
function setUser(user) {
  if (!process.env.SENTRY_DSN) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name
  });
}

/**
 * Clear user context
 */
function clearUser() {
  if (!process.env.SENTRY_DSN) return;
  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
function addBreadcrumb(message, category, data = {}) {
  if (!process.env.SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    timestamp: Date.now() / 1000
  });
}

/**
 * Start transaction for performance monitoring
 */
function startTransaction(name, op) {
  if (!process.env.SENTRY_DSN) return null;

  return Sentry.startTransaction({
    name,
    op
  });
}

/**
 * Express middleware for error tracking
 */
function errorTrackingMiddleware(err, req, res, next) {
  // Add request context to error
  captureException(err, {
    requestId: req.id,
    userId: req.user?.id,
    method: req.method,
    path: req.path,
    component: 'express',
    operation: 'http_request'
  });

  next(err);
}

/**
 * Track unhandled rejections
 */
function trackUnhandledRejections() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    captureException(new Error(`Unhandled Rejection: ${reason}`), {
      component: 'process',
      operation: 'unhandled_rejection'
    });
  });
}

/**
 * Track uncaught exceptions
 */
function trackUncaughtExceptions() {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    captureException(error, {
      component: 'process',
      operation: 'uncaught_exception'
    });
    
    // Give Sentry time to send the error
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
}

module.exports = {
  initializeSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  startTransaction,
  errorTrackingMiddleware,
  trackUnhandledRejections,
  trackUncaughtExceptions
};
