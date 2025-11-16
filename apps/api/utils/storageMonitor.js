/**
 * BE-064: Monitoring and alerting for storage service failures
 */

const logger = require('./logger');

/**
 * Storage operation metrics
 */
class StorageMonitor {
  constructor() {
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalLatency: 0,
      operations: [], // Recent operations for analysis
      errors: [], // Recent errors
      lastAlertTime: null
    };
    
    // Keep only last 1000 operations
    this.maxOperations = 1000;
    this.maxErrors = 100;
    
    // Alert thresholds
    this.alertThresholds = {
      failureRate: parseFloat(process.env.STORAGE_ALERT_FAILURE_RATE) || 0.1, // 10%
      minFailures: parseInt(process.env.STORAGE_ALERT_MIN_FAILURES) || 5,
      alertCooldown: parseInt(process.env.STORAGE_ALERT_COOLDOWN_MS) || 300000 // 5 minutes
    };
  }

  /**
   * Record an operation
   */
  recordOperation(operation, success, latency, error = null) {
    const now = Date.now();
    
    this.metrics.totalOperations++;
    if (success) {
      this.metrics.successfulOperations++;
    } else {
      this.metrics.failedOperations++;
      if (error) {
        this.metrics.errors.push({
          timestamp: now,
          operation,
          error: error.message || String(error),
          errorCode: error.code
        });
        
        // Keep only recent errors
        if (this.metrics.errors.length > this.maxErrors) {
          this.metrics.errors.shift();
        }
      }
    }
    
    this.metrics.totalLatency += latency;
    
    // Record operation
    this.metrics.operations.push({
      timestamp: now,
      operation,
      success,
      latency
    });
    
    // Keep only recent operations
    if (this.metrics.operations.length > this.maxOperations) {
      this.metrics.operations.shift();
    }
    
    // Check if we should alert
    this.checkAndAlert();
  }

  /**
   * Calculate failure rate
   */
  getFailureRate(windowMs = 60000) {
    const now = Date.now();
    const recentOps = this.metrics.operations.filter(
      op => now - op.timestamp < windowMs
    );
    
    if (recentOps.length === 0) return 0;
    
    const failures = recentOps.filter(op => !op.success).length;
    return failures / recentOps.length;
  }

  /**
   * Get average latency
   */
  getAverageLatency(windowMs = 60000) {
    const now = Date.now();
    const recentOps = this.metrics.operations.filter(
      op => now - op.timestamp < windowMs
    );
    
    if (recentOps.length === 0) return 0;
    
    const totalLatency = recentOps.reduce((sum, op) => sum + op.latency, 0);
    return totalLatency / recentOps.length;
  }

  /**
   * Check if we should alert and send alert if needed
   */
  checkAndAlert() {
    const now = Date.now();
    
    // Check cooldown
    if (this.metrics.lastAlertTime && 
        now - this.metrics.lastAlertTime < this.alertThresholds.alertCooldown) {
      return;
    }
    
    // Check failure rate
    const failureRate = this.getFailureRate();
    const recentFailures = this.metrics.operations
      .filter(op => !op.success && now - op.timestamp < 60000)
      .length;
    
    if (failureRate >= this.alertThresholds.failureRate && 
        recentFailures >= this.alertThresholds.minFailures) {
      this.sendAlert(failureRate, recentFailures);
      this.metrics.lastAlertTime = now;
    }
  }

  /**
   * Send alert
   */
  sendAlert(failureRate, failureCount) {
    const alert = {
      type: 'STORAGE_SERVICE_DEGRADED',
      severity: 'HIGH',
      message: `Storage service failure rate is ${(failureRate * 100).toFixed(1)}% (${failureCount} failures in last minute)`,
      failureRate,
      failureCount,
      timestamp: Date.now(),
      recentErrors: this.metrics.errors.slice(-5) // Last 5 errors
    };
    
    logger.error('🚨 STORAGE ALERT:', alert);
    
    // TODO: Integrate with alerting service (e.g., Sentry, PagerDuty, email)
    // For now, just log
    if (process.env.STORAGE_ALERT_WEBHOOK) {
      // Could send to webhook
      logger.info('Would send alert to webhook:', process.env.STORAGE_ALERT_WEBHOOK);
    }
  }

  /**
   * Get metrics summary
   */
  getMetrics() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const fiveMinutesAgo = now - 300000;
    
    const recentOps = this.metrics.operations.filter(op => op.timestamp > oneMinuteAgo);
    const recentFailures = recentOps.filter(op => !op.success).length;
    
    return {
      total: {
        operations: this.metrics.totalOperations,
        successful: this.metrics.successfulOperations,
        failed: this.metrics.failedOperations,
        successRate: this.metrics.totalOperations > 0 
          ? (this.metrics.successfulOperations / this.metrics.totalOperations) 
          : 1,
        averageLatency: this.metrics.totalOperations > 0
          ? this.metrics.totalLatency / this.metrics.totalOperations
          : 0
      },
      recent: {
        operations: recentOps.length,
        failures: recentFailures,
        failureRate: recentOps.length > 0 ? recentFailures / recentOps.length : 0,
        averageLatency: this.getAverageLatency(60000)
      },
      errors: this.metrics.errors.slice(-10) // Last 10 errors
    };
  }

  /**
   * Reset metrics (for testing)
   */
  reset() {
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalLatency: 0,
      operations: [],
      errors: [],
      lastAlertTime: null
    };
  }
}

// Singleton instance
let monitorInstance = null;

/**
 * Get storage monitor instance
 * BE-064: Monitoring and alerting for storage service failures
 */
function getStorageMonitor() {
  if (!monitorInstance) {
    monitorInstance = new StorageMonitor();
  }
  return monitorInstance;
}

module.exports = {
  getStorageMonitor,
  StorageMonitor
};

