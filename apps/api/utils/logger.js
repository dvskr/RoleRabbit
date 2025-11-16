/**
 * Structured Logger
 * 
 * JSON-formatted logging with context tracking
 */

const winston = require('winston');
const { format } = winston;

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: {
    service: 'roleready-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          let log = `${timestamp} [${level}]: ${message}`;
          
          // Add metadata
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          
          return log;
        })
      )
    }),
    
    // File output - errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    
    // File output - combined
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  ]
});

/**
 * Create child logger with context
 */
function createLogger(context = {}) {
  return {
    error: (message, meta = {}) => {
      logger.error(message, { ...context, ...meta });
    },
    
    warn: (message, meta = {}) => {
      logger.warn(message, { ...context, ...meta });
    },
    
    info: (message, meta = {}) => {
      logger.info(message, { ...context, ...meta });
    },
    
    debug: (message, meta = {}) => {
      logger.debug(message, { ...context, ...meta });
    }
  };
}

/**
 * Log with request context
 */
function logWithRequest(req, level, message, meta = {}) {
  const requestContext = {
    requestId: req.id || req.headers['x-request-id'],
    userId: req.user?.id,
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  };

  logger[level](message, { ...requestContext, ...meta });
}

/**
 * Log error with full context
 */
function logError(error, context = {}) {
  logger.error(error.message, {
    ...context,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    }
  });
}

/**
 * Log API request
 */
function logRequest(req, res, duration) {
  const logData = {
    requestId: req.id,
    userId: req.user?.id,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  };

  if (res.statusCode >= 500) {
    logger.error('HTTP Request Error', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('HTTP Request Warning', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
}

/**
 * Log database query
 */
function logQuery(query, duration, context = {}) {
  logger.debug('Database Query', {
    ...context,
    query: query.substring(0, 200), // Truncate long queries
    duration: `${duration}ms`
  });
}

/**
 * Log AI operation
 */
function logAIOperation(operation, tokensUsed, cost, duration, context = {}) {
  logger.info('AI Operation', {
    ...context,
    operation,
    tokensUsed,
    costUsd: cost,
    duration: `${duration}ms`
  });
}

/**
 * Log cache operation
 */
function logCacheOperation(operation, key, hit, context = {}) {
  logger.debug('Cache Operation', {
    ...context,
    operation,
    key,
    hit: hit ? 'HIT' : 'MISS'
  });
}

/**
 * Log security event
 */
function logSecurityEvent(event, severity, context = {}) {
  const level = severity === 'critical' ? 'error' : 'warn';
  logger[level]('Security Event', {
    ...context,
    event,
    severity
  });
}

/**
 * Log performance metric
 */
function logPerformance(metric, value, context = {}) {
  logger.info('Performance Metric', {
    ...context,
    metric,
    value
  });
}

/**
 * Express middleware for request logging
 */
function requestLoggingMiddleware(req, res, next) {
  const startTime = Date.now();

  // Generate request ID if not present
  if (!req.id && !req.headers['x-request-id']) {
    req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  } else {
    req.id = req.id || req.headers['x-request-id'];
  }

  // Log request start
  logger.info('HTTP Request Started', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logRequest(req, res, duration);
  });

  next();
}

/**
 * Express middleware for error logging
 */
function errorLoggingMiddleware(err, req, res, next) {
  logError(err, {
    requestId: req.id,
    userId: req.user?.id,
    method: req.method,
    path: req.path
  });

  next(err);
}

module.exports = {
  logger,
  createLogger,
  logWithRequest,
  logError,
  logRequest,
  logQuery,
  logAIOperation,
  logCacheOperation,
  logSecurityEvent,
  logPerformance,
  requestLoggingMiddleware,
  errorLoggingMiddleware,
  LOG_LEVELS
};
