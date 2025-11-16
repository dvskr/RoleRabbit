/**
 * Suspicious Activity Detection Utility
 * 
 * Detects and logs suspicious activities:
 * - Login from new country
 * - High API request rate
 * - Multiple failed login attempts
 * - Unusual access patterns
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const geoip = require('geoip-lite');

// Thresholds for suspicious activity
const THRESHOLDS = {
  failedLoginAttempts: 3, // Within 5 minutes
  highAPIRequests: 200, // Within 1 minute
  unusualHourAccess: { start: 2, end: 5 }, // 2 AM - 5 AM
  rapidLocationChange: 1000 // km within 1 hour
};

/**
 * Detect suspicious login activity
 * 
 * @param {string} userId - User ID
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User agent
 * @returns {Object} - { suspicious: boolean, reasons: string[] }
 */
async function detectSuspiciousLogin(userId, ipAddress, userAgent) {
  const reasons = [];
  
  try {
    // Check for failed login attempts
    const recentFailedAttempts = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM login_attempts
      WHERE user_id = '${userId}'
        AND success = false
        AND attempted_at >= NOW() - INTERVAL '5 minutes'
    `);
    
    const failedCount = parseInt(recentFailedAttempts[0]?.count || 0);
    if (failedCount >= THRESHOLDS.failedLoginAttempts) {
      reasons.push(`${failedCount} failed login attempts in last 5 minutes`);
    }
    
    // Check for new country
    const geo = geoip.lookup(ipAddress);
    if (geo) {
      const recentLogins = await prisma.$queryRawUnsafe(`
        SELECT ip_address
        FROM login_attempts
        WHERE user_id = '${userId}'
          AND success = true
          AND attempted_at >= NOW() - INTERVAL '30 days'
        ORDER BY attempted_at DESC
        LIMIT 10
      `);
      
      const previousCountries = new Set();
      recentLogins.forEach(login => {
        const prevGeo = geoip.lookup(login.ip_address);
        if (prevGeo) {
          previousCountries.add(prevGeo.country);
        }
      });
      
      if (previousCountries.size > 0 && !previousCountries.has(geo.country)) {
        reasons.push(`Login from new country: ${geo.country}`);
      }
    }
    
    // Check for unusual hour
    const hour = new Date().getHours();
    if (hour >= THRESHOLDS.unusualHourAccess.start && hour < THRESHOLDS.unusualHourAccess.end) {
      reasons.push(`Login during unusual hours (${hour}:00)`);
    }
    
    // Check for rapid location change
    const lastLogin = await prisma.$queryRawUnsafe(`
      SELECT ip_address, attempted_at
      FROM login_attempts
      WHERE user_id = '${userId}'
        AND success = true
        AND attempted_at >= NOW() - INTERVAL '1 hour'
      ORDER BY attempted_at DESC
      LIMIT 1
    `);
    
    if (lastLogin && lastLogin.length > 0) {
      const lastGeo = geoip.lookup(lastLogin[0].ip_address);
      const currentGeo = geoip.lookup(ipAddress);
      
      if (lastGeo && currentGeo) {
        const distance = calculateDistance(
          lastGeo.ll[0], lastGeo.ll[1],
          currentGeo.ll[0], currentGeo.ll[1]
        );
        
        if (distance > THRESHOLDS.rapidLocationChange) {
          reasons.push(`Rapid location change: ${Math.round(distance)}km in 1 hour`);
        }
      }
    }
    
    return {
      suspicious: reasons.length > 0,
      reasons,
      severity: reasons.length >= 3 ? 'critical' : reasons.length >= 2 ? 'high' : 'medium'
    };
  } catch (error) {
    console.error('Failed to detect suspicious login:', error);
    return { suspicious: false, reasons: [] };
  }
}

/**
 * Detect high API request rate
 * 
 * @param {string} userId - User ID
 * @param {string} ipAddress - IP address
 * @returns {Object} - { suspicious: boolean, requestCount: number }
 */
async function detectHighAPIRequests(userId, ipAddress) {
  try {
    // This would typically check a rate limiting cache (Redis)
    // For now, we'll use a simplified check
    
    const recentRequests = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM login_attempts
      WHERE ip_address = '${ipAddress}'
        AND attempted_at >= NOW() - INTERVAL '1 minute'
    `);
    
    const requestCount = parseInt(recentRequests[0]?.count || 0);
    const suspicious = requestCount > THRESHOLDS.highAPIRequests;
    
    if (suspicious) {
      await logSuspiciousActivity({
        userId,
        activityType: 'high_api_requests',
        severity: 'high',
        details: {
          requestCount,
          threshold: THRESHOLDS.highAPIRequests,
          timeWindow: '1 minute'
        },
        ipAddress
      });
    }
    
    return { suspicious, requestCount };
  } catch (error) {
    console.error('Failed to detect high API requests:', error);
    return { suspicious: false, requestCount: 0 };
  }
}

/**
 * Detect unusual access patterns
 * 
 * @param {string} userId - User ID
 * @param {string} resource - Resource being accessed
 * @param {string} action - Action being performed
 * @returns {Object} - { suspicious: boolean, reason: string }
 */
async function detectUnusualAccessPattern(userId, resource, action) {
  try {
    // Check for rapid consecutive deletions
    if (action === 'delete') {
      const recentDeletions = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count
        FROM pii_access_logs
        WHERE user_id = '${userId}'
          AND action = 'delete'
          AND created_at >= NOW() - INTERVAL '5 minutes'
      `);
      
      const deletionCount = parseInt(recentDeletions[0]?.count || 0);
      if (deletionCount >= 5) {
        await logSuspiciousActivity({
          userId,
          activityType: 'rapid_deletions',
          severity: 'high',
          details: {
            deletionCount,
            timeWindow: '5 minutes',
            resource
          }
        });
        
        return {
          suspicious: true,
          reason: `${deletionCount} deletions in 5 minutes`
        };
      }
    }
    
    // Check for bulk export attempts
    if (action === 'export') {
      const recentExports = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count
        FROM pii_access_logs
        WHERE user_id = '${userId}'
          AND action = 'export'
          AND created_at >= NOW() - INTERVAL '1 hour'
      `);
      
      const exportCount = parseInt(recentExports[0]?.count || 0);
      if (exportCount >= 10) {
        await logSuspiciousActivity({
          userId,
          activityType: 'bulk_export_attempt',
          severity: 'medium',
          details: {
            exportCount,
            timeWindow: '1 hour',
            resource
          }
        });
        
        return {
          suspicious: true,
          reason: `${exportCount} exports in 1 hour`
        };
      }
    }
    
    return { suspicious: false, reason: null };
  } catch (error) {
    console.error('Failed to detect unusual access pattern:', error);
    return { suspicious: false, reason: null };
  }
}

/**
 * Log suspicious activity
 * 
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {string} params.activityType - Type of activity
 * @param {string} params.severity - Severity level
 * @param {Object} params.details - Activity details
 * @param {string} params.ipAddress - IP address
 * @param {string} params.userAgent - User agent
 */
async function logSuspiciousActivity({
  userId,
  activityType,
  severity = 'medium',
  details = {},
  ipAddress = null,
  userAgent = null
}) {
  try {
    const activityId = crypto.randomUUID();
    
    await prisma.$executeRaw`
      INSERT INTO suspicious_activities (
        id, user_id, activity_type, severity, details,
        ip_address, user_agent, is_resolved, detected_at
      ) VALUES (
        ${activityId},
        ${userId},
        ${activityType},
        ${severity},
        ${JSON.stringify(details)}::jsonb,
        ${ipAddress},
        ${userAgent},
        false,
        NOW()
      )
    `;
    
    console.log(`Suspicious activity logged: ${activityType} for user ${userId}`);
    
    // In production: Send alert to security team if severity is high or critical
    if (severity === 'high' || severity === 'critical') {
      console.warn(`HIGH SEVERITY: ${activityType} detected for user ${userId}`);
      // sendSecurityAlert(userId, activityType, details);
    }
  } catch (error) {
    console.error('Failed to log suspicious activity:', error);
  }
}

/**
 * Get suspicious activities for a user
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Array} - Suspicious activities
 */
async function getSuspiciousActivities(userId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    includeResolved = false
  } = options;
  
  try {
    let whereClause = `user_id = '${userId}'`;
    
    if (!includeResolved) {
      whereClause += ` AND is_resolved = false`;
    }
    
    const activities = await prisma.$queryRawUnsafe(`
      SELECT * FROM suspicious_activities
      WHERE ${whereClause}
      ORDER BY detected_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);
    
    return activities;
  } catch (error) {
    console.error('Failed to get suspicious activities:', error);
    return [];
  }
}

/**
 * Resolve suspicious activity
 * 
 * @param {string} activityId - Activity ID
 * @returns {boolean} - Success
 */
async function resolveSuspiciousActivity(activityId) {
  try {
    await prisma.$executeRawUnsafe(`
      UPDATE suspicious_activities
      SET is_resolved = true,
          resolved_at = NOW()
      WHERE id = '${activityId}'
    `);
    
    return true;
  } catch (error) {
    console.error('Failed to resolve suspicious activity:', error);
    return false;
  }
}

/**
 * Middleware to detect suspicious activity on requests
 * 
 * @returns {Function} - Express middleware
 */
function detectSuspiciousActivityMiddleware() {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      if (!userId) {
        return next();
      }
      
      // Detect unusual access patterns
      const resource = req.baseUrl + req.path;
      const action = req.method.toLowerCase();
      
      const detection = await detectUnusualAccessPattern(userId, resource, action);
      
      if (detection.suspicious) {
        console.warn(`Suspicious activity detected: ${detection.reason}`);
        // Don't block request, just log
      }
      
      next();
    } catch (error) {
      console.error('Suspicious activity detection middleware error:', error);
      next();
    }
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * 
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} - Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = {
  THRESHOLDS,
  detectSuspiciousLogin,
  detectHighAPIRequests,
  detectUnusualAccessPattern,
  logSuspiciousActivity,
  getSuspiciousActivities,
  resolveSuspiciousActivity,
  detectSuspiciousActivityMiddleware
};
