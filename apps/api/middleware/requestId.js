/**
 * Request ID Middleware
 * Generates unique ID for each request for tracking and debugging
 */

const { randomUUID } = require('crypto');

/**
 * Generate or extract request ID
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 * @param {Function} done - Callback
 */
function requestIdMiddleware(request, reply, done) {
  // Check if request ID already exists in header
  const existingId = request.headers['x-request-id'];
  
  // Generate new ID if not provided
  const requestId = existingId || randomUUID();
  
  // Attach to request object
  request.id = requestId;
  
  // Add to response headers
  reply.header('X-Request-ID', requestId);
  
  done();
}

module.exports = requestIdMiddleware;
