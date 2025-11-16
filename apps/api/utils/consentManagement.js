/**
 * Consent Management Utility
 * 
 * Manages user consent for various data processing activities
 * Required for GDPR compliance
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

/**
 * Consent types
 */
const CONSENT_TYPES = {
  AI_PROCESSING: 'ai_processing',
  DATA_ANALYTICS: 'data_analytics',
  MARKETING: 'marketing',
  THIRD_PARTY_SHARING: 'third_party_sharing'
};

/**
 * Check if user has granted consent
 * 
 * @param {string} userId - User ID
 * @param {string} consentType - Type of consent
 * @returns {boolean} - Whether consent is granted
 */
async function hasConsent(userId, consentType) {
  try {
    const consent = await prisma.$queryRawUnsafe(`
      SELECT * FROM user_consents
      WHERE user_id = '${userId}'
        AND consent_type = '${consentType}'
        AND granted = true
        AND revoked_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    return consent && consent.length > 0;
  } catch (error) {
    console.error('Failed to check consent:', error);
    // Fail closed: if we can't check consent, assume not granted
    return false;
  }
}

/**
 * Grant consent
 * 
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {string} params.consentType - Type of consent
 * @param {string} params.ipAddress - IP address
 * @param {string} params.userAgent - User agent
 * @returns {Object} - Consent record
 */
async function grantConsent({ userId, consentType, ipAddress, userAgent }) {
  try {
    const consentId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Check if consent already exists
    const existing = await prisma.$queryRawUnsafe(`
      SELECT * FROM user_consents
      WHERE user_id = '${userId}' AND consent_type = '${consentType}'
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (existing && existing.length > 0) {
      // Update existing consent
      await prisma.$executeRawUnsafe(`
        UPDATE user_consents
        SET granted = true,
            granted_at = '${now}',
            revoked_at = NULL,
            ip_address = '${ipAddress}',
            user_agent = '${userAgent}',
            updated_at = '${now}'
        WHERE user_id = '${userId}' AND consent_type = '${consentType}'
      `);
      
      return { id: existing[0].id, consentType, granted: true };
    } else {
      // Create new consent
      await prisma.$executeRaw`
        INSERT INTO user_consents (
          id, user_id, consent_type, granted, granted_at,
          ip_address, user_agent, created_at, updated_at
        ) VALUES (
          ${consentId},
          ${userId},
          ${consentType},
          true,
          ${now},
          ${ipAddress},
          ${userAgent},
          ${now},
          ${now}
        )
      `;
      
      return { id: consentId, consentType, granted: true };
    }
  } catch (error) {
    console.error('Failed to grant consent:', error);
    throw new Error('Failed to grant consent');
  }
}

/**
 * Revoke consent
 * 
 * @param {string} userId - User ID
 * @param {string} consentType - Type of consent
 * @returns {boolean} - Success
 */
async function revokeConsent(userId, consentType) {
  try {
    const now = new Date().toISOString();
    
    await prisma.$executeRawUnsafe(`
      UPDATE user_consents
      SET granted = false,
          revoked_at = '${now}',
          updated_at = '${now}'
      WHERE user_id = '${userId}' AND consent_type = '${consentType}'
    `);
    
    return true;
  } catch (error) {
    console.error('Failed to revoke consent:', error);
    throw new Error('Failed to revoke consent');
  }
}

/**
 * Get all consents for a user
 * 
 * @param {string} userId - User ID
 * @returns {Array} - Consent records
 */
async function getUserConsents(userId) {
  try {
    const consents = await prisma.$queryRawUnsafe(`
      SELECT * FROM user_consents
      WHERE user_id = '${userId}'
      ORDER BY consent_type, created_at DESC
    `);
    
    // Get latest consent for each type
    const latestConsents = {};
    consents.forEach(consent => {
      if (!latestConsents[consent.consent_type]) {
        latestConsents[consent.consent_type] = consent;
      }
    });
    
    return Object.values(latestConsents);
  } catch (error) {
    console.error('Failed to get user consents:', error);
    return [];
  }
}

/**
 * Middleware to check consent before AI operations
 * 
 * @returns {Function} - Express middleware
 */
function requireAIConsent() {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }
      
      const hasAIConsent = await hasConsent(userId, CONSENT_TYPES.AI_PROCESSING);
      
      if (!hasAIConsent) {
        return res.status(403).json({
          success: false,
          error: 'AI processing consent required',
          code: 'CONSENT_REQUIRED',
          consentType: CONSENT_TYPES.AI_PROCESSING,
          message: 'You must grant consent for AI processing to use this feature.'
        });
      }
      
      next();
    } catch (error) {
      console.error('Consent check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check consent'
      });
    }
  };
}

/**
 * Middleware to check consent before analytics
 * 
 * @returns {Function} - Express middleware
 */
function requireAnalyticsConsent() {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        return next(); // Allow anonymous analytics
      }
      
      const hasAnalyticsConsent = await hasConsent(userId, CONSENT_TYPES.DATA_ANALYTICS);
      
      // Store consent status in request for analytics code to check
      req.analyticsConsent = hasAnalyticsConsent;
      
      next();
    } catch (error) {
      console.error('Consent check error:', error);
      req.analyticsConsent = false;
      next();
    }
  };
}

/**
 * Initialize default consents for new user
 * 
 * @param {string} userId - User ID
 * @param {string} ipAddress - IP address
 * @param {string} userAgent - User agent
 */
async function initializeDefaultConsents(userId, ipAddress, userAgent) {
  try {
    // By default, grant AI processing consent (required for core functionality)
    // User can revoke later
    await grantConsent({
      userId,
      consentType: CONSENT_TYPES.AI_PROCESSING,
      ipAddress,
      userAgent
    });
    
    console.log(`Initialized default consents for user ${userId}`);
  } catch (error) {
    console.error('Failed to initialize default consents:', error);
  }
}

module.exports = {
  CONSENT_TYPES,
  hasConsent,
  grantConsent,
  revokeConsent,
  getUserConsents,
  requireAIConsent,
  requireAnalyticsConsent,
  initializeDefaultConsents
};

