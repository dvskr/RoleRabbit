const axios = require('axios');
const crypto = require('crypto');
const logger = require('../../utils/logger');
const { prisma } = require('../../utils/db');

/**
 * Webhook Service
 * Sends webhook notifications for long-running operations
 * Includes retry logic, signature verification, and logging
 */

// Webhook event types
const WEBHOOK_EVENTS = {
  RESUME_PARSED: 'resume.parsed',
  RESUME_PARSE_FAILED: 'resume.parse_failed',
  ATS_CHECK_COMPLETED: 'ats.check_completed',
  ATS_CHECK_FAILED: 'ats.check_failed',
  TAILORING_COMPLETED: 'tailoring.completed',
  TAILORING_FAILED: 'tailoring.failed',
  OPERATION_CANCELLED: 'operation.cancelled'
};

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  delays: [1000, 5000, 15000], // 1s, 5s, 15s
  timeout: 10000 // 10 seconds
};

/**
 * Generate HMAC signature for webhook payload
 * @param {Object} payload - Webhook payload
 * @param {string} secret - Webhook secret
 * @returns {string} HMAC signature
 */
function generateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

/**
 * Send webhook with retry logic
 * @param {string} url - Webhook URL
 * @param {Object} payload - Webhook payload
 * @param {string} secret - Webhook secret
 * @param {number} attempt - Current attempt number
 * @returns {Promise<Object>} Response data
 */
async function sendWebhookWithRetry(url, payload, secret, attempt = 1) {
  try {
    const signature = generateSignature(payload, secret);
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Delivery-Id': payload.deliveryId,
        'User-Agent': 'RoleReady-Webhook/1.0'
      },
      timeout: RETRY_CONFIG.timeout,
      validateStatus: (status) => status >= 200 && status < 300
    });

    logger.info('[WEBHOOK] Successfully delivered', {
      url,
      event: payload.event,
      attempt,
      statusCode: response.status,
      deliveryId: payload.deliveryId
    });

    return {
      success: true,
      statusCode: response.status,
      attempt,
      deliveryId: payload.deliveryId
    };

  } catch (error) {
    const isLastAttempt = attempt >= RETRY_CONFIG.maxAttempts;
    
    logger.warn('[WEBHOOK] Delivery failed', {
      url,
      event: payload.event,
      attempt,
      maxAttempts: RETRY_CONFIG.maxAttempts,
      error: error.message,
      statusCode: error.response?.status,
      deliveryId: payload.deliveryId
    });

    // If not last attempt, retry with exponential backoff
    if (!isLastAttempt) {
      const delay = RETRY_CONFIG.delays[attempt - 1] || RETRY_CONFIG.delays[RETRY_CONFIG.delays.length - 1];
      
      logger.info('[WEBHOOK] Retrying after delay', {
        url,
        event: payload.event,
        nextAttempt: attempt + 1,
        delayMs: delay,
        deliveryId: payload.deliveryId
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      return sendWebhookWithRetry(url, payload, secret, attempt + 1);
    }

    // Last attempt failed
    logger.error('[WEBHOOK] All delivery attempts failed', {
      url,
      event: payload.event,
      totalAttempts: attempt,
      error: error.message,
      deliveryId: payload.deliveryId
    });

    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status,
      attempt,
      deliveryId: payload.deliveryId
    };
  }
}

/**
 * Log webhook delivery to database
 * @param {string} userId - User ID
 * @param {string} event - Event type
 * @param {string} url - Webhook URL
 * @param {Object} payload - Webhook payload
 * @param {Object} result - Delivery result
 */
async function logWebhookDelivery(userId, event, url, payload, result) {
  try {
    await prisma.webhookLog.create({
      data: {
        userId,
        event,
        url,
        payload: JSON.stringify(payload),
        success: result.success,
        statusCode: result.statusCode,
        attempts: result.attempt,
        error: result.error || null,
        deliveryId: result.deliveryId,
        deliveredAt: result.success ? new Date() : null
      }
    });
  } catch (error) {
    logger.error('[WEBHOOK] Failed to log delivery', {
      userId,
      event,
      error: error.message
    });
  }
}

/**
 * Get user's webhook configuration
 * @param {string} userId - User ID
 * @param {string} event - Event type (optional, to check if event is enabled)
 * @returns {Promise<Object|null>} Webhook configuration
 */
async function getUserWebhookConfig(userId, event = null) {
  try {
    const config = await prisma.webhookConfig.findUnique({
      where: { userId }
    });

    if (!config || !config.enabled) {
      return null;
    }

    // Check if specific event is enabled
    if (event && config.enabledEvents) {
      const enabledEvents = JSON.parse(config.enabledEvents);
      if (!enabledEvents.includes(event)) {
        logger.debug('[WEBHOOK] Event not enabled for user', { userId, event });
        return null;
      }
    }

    return config;
  } catch (error) {
    logger.error('[WEBHOOK] Failed to get user webhook config', {
      userId,
      error: error.message
    });
    return null;
  }
}

/**
 * Send webhook notification
 * @param {string} userId - User ID
 * @param {string} event - Event type
 * @param {Object} data - Event data
 * @returns {Promise<Object|null>} Delivery result
 */
async function sendWebhook(userId, event, data) {
  try {
    // Get user's webhook configuration
    const config = await getUserWebhookConfig(userId, event);
    
    if (!config) {
      logger.debug('[WEBHOOK] No webhook configured for user', { userId, event });
      return null;
    }

    // Generate unique delivery ID
    const deliveryId = crypto.randomUUID();

    // Build webhook payload
    const payload = {
      event,
      deliveryId,
      timestamp: new Date().toISOString(),
      userId,
      data
    };

    // Send webhook with retry logic
    const result = await sendWebhookWithRetry(config.url, payload, config.secret);

    // Log delivery to database
    await logWebhookDelivery(userId, event, config.url, payload, result);

    return result;

  } catch (error) {
    logger.error('[WEBHOOK] Failed to send webhook', {
      userId,
      event,
      error: error.message
    });
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send resume parsed webhook
 */
async function sendResumeParsedWebhook(userId, resumeData) {
  return sendWebhook(userId, WEBHOOK_EVENTS.RESUME_PARSED, {
    resumeId: resumeData.id,
    fileName: resumeData.fileName,
    parsedAt: resumeData.createdAt,
    success: true
  });
}

/**
 * Send resume parse failed webhook
 */
async function sendResumeParseFailedWebhook(userId, fileName, error) {
  return sendWebhook(userId, WEBHOOK_EVENTS.RESUME_PARSE_FAILED, {
    fileName,
    error: error.message,
    failedAt: new Date().toISOString()
  });
}

/**
 * Send ATS check completed webhook
 */
async function sendATSCheckCompletedWebhook(userId, atsData) {
  return sendWebhook(userId, WEBHOOK_EVENTS.ATS_CHECK_COMPLETED, {
    resumeId: atsData.resumeId,
    score: atsData.score,
    matchedKeywords: atsData.matchedKeywords?.length || 0,
    missingKeywords: atsData.missingKeywords?.length || 0,
    completedAt: new Date().toISOString()
  });
}

/**
 * Send ATS check failed webhook
 */
async function sendATSCheckFailedWebhook(userId, resumeId, error) {
  return sendWebhook(userId, WEBHOOK_EVENTS.ATS_CHECK_FAILED, {
    resumeId,
    error: error.message,
    failedAt: new Date().toISOString()
  });
}

/**
 * Send tailoring completed webhook
 */
async function sendTailoringCompletedWebhook(userId, tailoringData) {
  return sendWebhook(userId, WEBHOOK_EVENTS.TAILORING_COMPLETED, {
    resumeId: tailoringData.resumeId,
    jobTitle: tailoringData.jobTitle,
    mode: tailoringData.mode,
    atsScoreImprovement: tailoringData.atsScoreImprovement,
    completedAt: new Date().toISOString()
  });
}

/**
 * Send tailoring failed webhook
 */
async function sendTailoringFailedWebhook(userId, resumeId, error) {
  return sendWebhook(userId, WEBHOOK_EVENTS.TAILORING_FAILED, {
    resumeId,
    error: error.message,
    failedAt: new Date().toISOString()
  });
}

/**
 * Send operation cancelled webhook
 */
async function sendOperationCancelledWebhook(userId, operationType, operationId) {
  return sendWebhook(userId, WEBHOOK_EVENTS.OPERATION_CANCELLED, {
    operationType,
    operationId,
    cancelledAt: new Date().toISOString()
  });
}

module.exports = {
  WEBHOOK_EVENTS,
  sendWebhook,
  sendResumeParsedWebhook,
  sendResumeParseFailedWebhook,
  sendATSCheckCompletedWebhook,
  sendATSCheckFailedWebhook,
  sendTailoringCompletedWebhook,
  sendTailoringFailedWebhook,
  sendOperationCancelledWebhook,
  generateSignature // Export for testing/verification
};

