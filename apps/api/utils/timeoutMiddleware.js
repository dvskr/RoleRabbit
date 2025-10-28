/**
 * Request Timeout Middleware
 * Adds timeout handling to prevent hanging requests
 */

/**
 * Create timeout middleware
 */
function createTimeoutMiddleware(timeoutMs = 30000) {
  return async (request, reply) => {
    const timeoutId = setTimeout(() => {
      if (!reply.sent) {
        reply.status(504).send({
          success: false,
          error: 'Request timeout',
          message: `Request took longer than ${timeoutMs}ms to process`
        });
      }
    }, timeoutMs);

    // Clean up timeout when request completes
    reply.raw.on('close', () => {
      clearTimeout(timeoutId);
    });

    try {
      await request;
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Apply timeout to specific routes
 */
function applyTimeout(fastify, routes, timeoutMs = 30000) {
  routes.forEach(route => {
    fastify.addHook('onRequest', async (request, reply) => {
      // Only apply to specific routes
      if (route === request.raw.url.split('?')[0]) {
        const timeoutId = setTimeout(() => {
          if (!reply.sent) {
            reply.status(504).send({
              success: false,
              error: 'Request timeout',
              route: route
            });
          }
        }, timeoutMs);

        reply.raw.on('close', () => {
          clearTimeout(timeoutId);
        });
      }
    });
  });
}

/**
 * Get default timeout values by route type
 */
function getTimeoutByRouteType(route) {
  const timeouts = {
    '/api/ai/': 60000,        // 60s for AI requests
    '/api/resumes': 45000,    // 45s for resume operations
    '/api/jobs': 30000,       // 30s for job operations
    '/api/auth': 15000,       // 15s for auth
    '/api/files': 60000,      // 60s for file uploads
    default: 30000            // 30s default
  };

  for (const [pattern, timeout] of Object.entries(timeouts)) {
    if (route.includes(pattern)) {
      return timeout;
    }
  }

  return timeouts.default;
}

module.exports = {
  createTimeoutMiddleware,
  applyTimeout,
  getTimeoutByRouteType
};

