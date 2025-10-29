/**
 * Request Logging Utility
 * Logs incoming requests and outgoing responses
 */

const logger = require('./logger');
const { performance } = require('perf_hooks');

/**
 * Request logging middleware
 */
function requestLogger(request, reply, done) {
  const startTime = performance.now();
  
  // Log request
  logger.info({
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent']
  });
  
  // Log response when sent
  reply.addHook('onSend', (request, reply, payload, done) => {
    const duration = performance.now() - startTime;
    
    logger.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration.toFixed(2)}ms`
    });
    
    done();
  });
  
  done();
}

/**
 * Log authentication attempts
 */
function logAuthAttempt(email, success, reason = null) {
  logger.info({
    event: 'auth_attempt',
    email,
    success,
    ...(reason && { reason })
  });
}

/**
 * Log security events
 */
function logSecurityEvent(event, details) {
  logger.warn({
    event: 'security_event',
    type: event,
    details
  });
}

module.exports = {
  requestLogger,
  logAuthAttempt,
  logSecurityEvent
};
