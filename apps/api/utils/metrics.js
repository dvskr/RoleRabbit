/**
 * Metrics Collection Utility
 * Collects and aggregates application metrics
 */

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
        byEndpoint: {}
      },
      responseTimes: [],
      errors: [],
      cache: {
        hits: 0,
        misses: 0
      }
    };
    this.startTime = Date.now();
  }

  /**
   * Record a request
   */
  recordRequest(method, endpoint, statusCode, responseTime) {
    this.metrics.requests.total++;
    
    // Track by method
    this.metrics.requests.byMethod[method] = 
      (this.metrics.requests.byMethod[method] || 0) + 1;
    
    // Track by status
    const statusGroup = Math.floor(statusCode / 100) * 100;
    this.metrics.requests.byStatus[statusGroup] = 
      (this.metrics.requests.byStatus[statusGroup] || 0) + 1;
    
    // Track by endpoint
    this.metrics.requests.byEndpoint[endpoint] = 
      (this.metrics.requests.byEndpoint[endpoint] || 0) + 1;
    
    // Track response times
    if (responseTime !== undefined) {
      this.metrics.responseTimes.push(responseTime);
      
      // Keep only last 1000 response times
      if (this.metrics.responseTimes.length > 1000) {
        this.metrics.responseTimes.shift();
      }
    }
  }

  /**
   * Record an error
   */
  recordError(error, context) {
    this.metrics.errors.push({
      message: error.message,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.shift();
    }
  }

  /**
   * Record cache hit
   */
  recordCacheHit() {
    this.metrics.cache.hits++;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss() {
    this.metrics.cache.misses++;
  }

  /**
   * Get average response time
   */
  getAverageResponseTime() {
    if (this.metrics.responseTimes.length === 0) return 0;
    
    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.responseTimes.length);
  }

  /**
   * Get percentile response time
   */
  getPercentileResponseTime(percentile = 95) {
    if (this.metrics.responseTimes.length === 0) return 0;
    
    const sorted = [...this.metrics.responseTimes].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate() {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    if (total === 0) return 0;
    return Math.round((this.metrics.cache.hits / total) * 100);
  }

  /**
   * Get error rate
   */
  getErrorRate() {
    if (this.metrics.requests.total === 0) return 0;
    return Math.round((this.metrics.errors.length / this.metrics.requests.total) * 100);
  }

  /**
   * Get uptime
   */
  getUptime() {
    return Date.now() - this.startTime;
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return {
      ...this.metrics,
      summary: {
        uptime: this.getUptime(),
        averageResponseTime: this.getAverageResponseTime(),
        p95ResponseTime: this.getPercentileResponseTime(95),
        p99ResponseTime: this.getPercentileResponseTime(99),
        cacheHitRate: this.getCacheHitRate(),
        errorRate: this.getErrorRate()
      }
    };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
        byEndpoint: {}
      },
      responseTimes: [],
      errors: [],
      cache: {
        hits: 0,
        misses: 0
      }
    };
    this.startTime = Date.now();
  }
}

module.exports = new MetricsCollector();

