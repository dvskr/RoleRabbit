/**
 * Alerting System
 * INFRA-024, INFRA-025, INFRA-026: Alerting for storage issues
 */

const logger = require('./logger');
const { prisma } = require('./db');
const { addJob } = require('../config/queue');
const { sendQuotaWarningEmail } = require('./emailService');

/**
 * INFRA-024: Alerting for storage quota exceeded (>90% used)
 */
async function checkQuotaAlerts() {
  try {
    // Ensure prisma is available
    if (!prisma || !prisma.storage_quotas) {
      logger.error('Prisma client not available in alerting system');
      return;
    }
    
    const quotas = await prisma.storage_quotas.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    for (const quota of quotas) {
      const percentage = Number(quota.usedBytes) / Number(quota.limitBytes);
      
      // Check if quota is > 90%
      if (percentage > 0.9) {
        logger.warn(`[Alert] User ${quota.userId} storage quota exceeded 90%: ${(percentage * 100).toFixed(1)}%`);
        
        // Send alert email if not already warned
        if (!quota.warnedAt || new Date(quota.warnedAt) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          try {
            await addJob('quotaWarning', {
              userId: quota.userId,
              quota: {
                usedBytes: quota.usedBytes,
                limitBytes: quota.limitBytes
              }
            });
            
            // Update warnedAt
            await prisma.storage_quotas.update({
              where: { userId: quota.userId },
              data: { warnedAt: new Date() }
            });
          } catch (jobError) {
            logger.error('Failed to send quota warning:', jobError);
          }
        }
      }
      
      // Check if quota is > 80% (warning threshold)
      if (percentage > 0.8 && percentage <= 0.9) {
        if (!quota.warnedAt || new Date(quota.warnedAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          try {
            await addJob('quotaWarning', {
              userId: quota.userId,
              quota: {
                usedBytes: quota.usedBytes,
                limitBytes: quota.limitBytes
              }
            });
            
            await prisma.storage_quotas.update({
              where: { userId: quota.userId },
              data: { warnedAt: new Date() }
            });
          } catch (jobError) {
            logger.error('Failed to send quota warning:', jobError);
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error checking quota alerts:', error);
    throw error;
  }
}

/**
 * INFRA-025: Alerting for storage service failures (Supabase downtime)
 */
async function checkStorageServiceHealth() {
  try {
    const storageHandler = require('./storageHandler');
    const health = await storageHandler.healthCheck();
    
    if (health.status === 'unhealthy') {
      logger.error('[Alert] Storage service is unhealthy:', health);
      // TODO: Send alert to monitoring system (PagerDuty, Opsgenie, etc.)
      // TODO: Send email to ops team
    } else if (health.status === 'degraded') {
      logger.warn('[Alert] Storage service is degraded:', health);
    }
    
    return health;
  } catch (error) {
    logger.error('[Alert] Storage service health check failed:', error);
    // TODO: Send critical alert
    throw error;
  }
}

/**
 * INFRA-026: Alerting for high error rates in file operations
 */
async function checkErrorRates(fileMetrics) {
  try {
    const metrics = fileMetrics.getMetrics();
    const errorRateThreshold = 0.1; // 10% error rate
    
    for (const [operation, rate] of Object.entries(metrics.errorRates)) {
      if (rate > errorRateThreshold * 100) {
        logger.error(`[Alert] High error rate for ${operation}: ${rate.toFixed(1)}%`);
        // TODO: Send alert to monitoring system
      }
    }
    
    return metrics.errorRates;
  } catch (error) {
    logger.error('Error checking error rates:', error);
    throw error;
  }
}

/**
 * Run all alert checks
 */
async function runAllAlerts(fileMetrics) {
  try {
    await Promise.all([
      checkQuotaAlerts(),
      checkStorageServiceHealth(),
      checkErrorRates(fileMetrics)
    ]);
    logger.info('✅ All alerts checked');
  } catch (error) {
    logger.error('Error running alerts:', error);
    throw error;
  }
}

module.exports = {
  checkQuotaAlerts,
  checkStorageServiceHealth,
  checkErrorRates,
  runAllAlerts
};

