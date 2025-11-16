/**
 * BE-039: Rate limiting per endpoint for storage routes
 * BE-046: IP-based rate limiting for suspicious activity
 */

const { createRateLimiter } = require('./rateLimiter');
const logger = require('./logger');

// Storage endpoint rate limiters
const storageRateLimiters = {
  // File upload: 10 requests per minute per user
  fileUpload: createRateLimiter(10, 60 * 1000),
  
  // File download: 60 requests per minute per user
  fileDownload: createRateLimiter(60, 60 * 1000),
  
  // File list: 30 requests per minute per user
  fileList: createRateLimiter(30, 60 * 1000),
  
  // File update: 20 requests per minute per user
  fileUpdate: createRateLimiter(20, 60 * 1000),
  
  // File delete: 10 requests per minute per user
  fileDelete: createRateLimiter(10, 60 * 1000),
  
  // File share: 20 requests per minute per user
  fileShare: createRateLimiter(20, 60 * 1000),
  
  // Bulk operations: 5 requests per minute per user
  bulkOperations: createRateLimiter(5, 60 * 1000),
  
  // Folder operations: 30 requests per minute per user
  folderOperations: createRateLimiter(30, 60 * 1000),
  
  // Comments: 50 requests per minute per user
  comments: createRateLimiter(50, 60 * 1000)
};

/**
 * BE-046: IP-based rate limiting for suspicious activity
 * Tracks IP addresses and flags suspicious patterns
 */
const suspiciousIPs = new Map(); // IP -> { count, firstSeen, lastSeen, blocked }

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour
  for (const [ip, data] of suspiciousIPs.entries()) {
    if (now - data.lastSeen > maxAge) {
      suspiciousIPs.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if IP is suspicious
 */
function isSuspiciousIP(ip) {
  const data = suspiciousIPs.get(ip);
  if (!data) return false;
  
  // Block if too many requests in short time
  const timeWindow = 5 * 60 * 1000; // 5 minutes
  if (Date.now() - data.firstSeen < timeWindow && data.count > 100) {
    return true;
  }
  
  return data.blocked || false;
}

/**
 * Record suspicious activity from IP
 */
function recordSuspiciousActivity(ip, reason) {
  const now = Date.now();
  const data = suspiciousIPs.get(ip) || { count: 0, firstSeen: now, lastSeen: now, blocked: false };
  
  data.count++;
  data.lastSeen = now;
  data.reason = reason;
  
  // Auto-block after 50 suspicious activities
  if (data.count >= 50) {
    data.blocked = true;
    logger.warn(`IP ${ip} has been blocked due to suspicious activity: ${reason}`);
  }
  
  suspiciousIPs.set(ip, data);
}

/**
 * Get rate limiter for storage endpoint
 */
function getStorageRateLimiter(endpoint) {
  return storageRateLimiters[endpoint] || storageRateLimiters.fileList; // Default to fileList
}

module.exports = {
  storageRateLimiters,
  getStorageRateLimiter,
  isSuspiciousIP,
  recordSuspiciousActivity
};

