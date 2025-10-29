/**
 * Application Monitoring
 * Tracks performance metrics and errors
 */

class Monitoring {
  constructor() {
    this.metrics = new Map();
    this.errors = [];
    this.startTime = Date.now();
  }

  /**
   * Track metric
   */
  track(metric, value) {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    this.metrics.get(metric).push({ value, timestamp: Date.now() });
  }

  /**
   * Log error
   */
  logError(error) {
    this.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  }

  /**
   * Get metrics
   */
  getMetrics() {
    const now = Date.now();
    const uptime = now - this.startTime;

    return {
      uptime,
      metrics: Object.fromEntries(this.metrics),
      errors: this.errors.slice(-10), // Last 10 errors
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics.clear();
    this.errors = [];
  }
}

module.exports = new Monitoring();

