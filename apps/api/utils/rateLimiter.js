/**
 * Rate limiting utilities for different endpoints
 * @module utils/rateLimiter
 */

/**
 * Create rate limiter configuration for profile endpoints
 * @param {number} max - Maximum requests per time window
 * @param {number} timeWindow - Time window in milliseconds
 * @returns {Object} Rate limiter configuration
 */
function createRateLimiter(max, timeWindow) {
  return {
    max,
    timeWindow,
    skip: (request) => {
      // Skip rate limiting for localhost in development
      if (process.env.NODE_ENV !== 'production') {
        const isLocalhost = request.ip === '127.0.0.1' || 
                           request.ip === '::1' || 
                           request.ip === '::ffff:127.0.0.1' || 
                           request.hostname === 'localhost';
        if (isLocalhost) {
          return true;
        }
      }
      return false;
    },
    errorResponseBuilder: (request, context) => {
      return {
        error: 'Rate limit exceeded. Please try again later.',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(context.ttl / 1000)
      };
    }
  };
}

// Profile GET endpoint: 60 requests per minute
const profileGetLimiter = createRateLimiter(60, 60 * 1000);

// Profile PUT endpoint: 10 requests per minute
const profilePutLimiter = createRateLimiter(10, 60 * 1000);

// Profile picture upload: 5 requests per minute
const profilePictureLimiter = createRateLimiter(5, 60 * 1000);

// ============================================================
// Job Tracker Rate Limiters
// ============================================================

// Job GET endpoint: 100 requests per minute (read-heavy operations)
const jobGetLimiter = createRateLimiter(100, 60 * 1000);

// Job POST endpoint: 30 requests per minute (create new job)
const jobPostLimiter = createRateLimiter(30, 60 * 1000);

// Job PUT endpoint: 30 requests per minute (update job)
const jobPutLimiter = createRateLimiter(30, 60 * 1000);

// Job DELETE endpoint: 20 requests per minute (delete job)
const jobDeleteLimiter = createRateLimiter(20, 60 * 1000);

// Bulk operations: 10 requests per minute (bulk delete, restore, update)
const jobBulkOperationLimiter = createRateLimiter(10, 60 * 1000);

// Enhanced tracking POST: 50 requests per minute (create notes, reminders, etc.)
const jobTrackingPostLimiter = createRateLimiter(50, 60 * 1000);

// Enhanced tracking PUT/DELETE: 30 requests per minute (update/delete notes, reminders, etc.)
const jobTrackingModifyLimiter = createRateLimiter(30, 60 * 1000);

// Saved views operations: 20 requests per minute
const jobViewsLimiter = createRateLimiter(20, 60 * 1000);

// Import/Export operations: 5 requests per minute (resource-intensive)
const jobImportExportLimiter = createRateLimiter(5, 60 * 1000);

// Stats endpoint: 50 requests per minute (aggregation queries)
const jobStatsLimiter = createRateLimiter(50, 60 * 1000);

module.exports = {
  profileGetLimiter,
  profilePutLimiter,
  profilePictureLimiter,
  // Job tracker rate limiters
  jobGetLimiter,
  jobPostLimiter,
  jobPutLimiter,
  jobDeleteLimiter,
  jobBulkOperationLimiter,
  jobTrackingPostLimiter,
  jobTrackingModifyLimiter,
  jobViewsLimiter,
  jobImportExportLimiter,
  jobStatsLimiter,
  createRateLimiter
};
