/**
 * Performance Monitoring Utility
 * Tracks and logs performance metrics
 */

const logger = require('./logger');
const { performance } = require('perf_hooks');

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }
  
  /**
   * Start performance tracking
   */
  start(label) {
    performance.mark(`${label}-start`);
  }
  
  /**
   * End performance tracking
   */
  end(label) {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    
    this.metrics.set(label, {
      duration: measure.duration,
      timestamp: new Date().toISOString()
    });
    
    return measure.duration;
  }
  
  /**
   * Log slow operations
   */
  logSlowOperation(label, threshold = 1000) {
    const duration = this.end(label);
    
    if (duration > threshold) {
      logger.warn({
        message: 'Slow operation detected',
        label,
        duration: `${duration.toFixed(2)}ms`,
        threshold: `${threshold}ms`
      });
    }
  }
  
  /**
   * Get all metrics
   */
  getMetrics() {
    return Array.from(this.metrics.entries()).map(([label, data]) => ({
      label,
      ...data
    }));
  }
  
  /**
   * Clear metrics
   */
  clear() {
    this.metrics.clear();
  }
}

// Singleton instance
const monitor = new PerformanceMonitor();

module.exports = monitor;
