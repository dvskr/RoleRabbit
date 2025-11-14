/**
 * Frontend Performance Monitoring Service
 * Tracks Web Vitals, custom metrics, and user experience metrics
 */

// Performance metrics types
interface WebVitals {
  CLS: number; // Cumulative Layout Shift
  FID: number; // First Input Delay
  LCP: number; // Largest Contentful Paint
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
  INP?: number; // Interaction to Next Paint
}

interface CustomMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'score';
  metadata?: Record<string, any>;
}

interface PerformanceConfig {
  enabled: boolean;
  apiEndpoint: string;
  sampleRate: number; // 0.0 to 1.0
  reportInterval: number; // milliseconds
  enableWebVitals: boolean;
  enableResourceTiming: boolean;
  enableNavigationTiming: boolean;
}

class PerformanceMonitoringService {
  private config: PerformanceConfig;
  private metrics: CustomMetric[] = [];
  private webVitals: Partial<WebVitals> = {};
  private reportTimer?: NodeJS.Timeout;

  constructor() {
    this.config = {
      enabled: process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED === 'true',
      apiEndpoint: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      sampleRate: parseFloat(process.env.NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE || '0.1'),
      reportInterval: 30000, // 30 seconds
      enableWebVitals: true,
      enableResourceTiming: true,
      enableNavigationTiming: true,
    };
  }

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled || typeof window === 'undefined') {
      return;
    }

    try {
      // Apply sampling
      if (Math.random() > this.config.sampleRate) {
        console.log('[Performance] Not sampled for monitoring');
        return;
      }

      // Track Web Vitals if enabled
      if (this.config.enableWebVitals) {
        await this.trackWebVitals();
      }

      // Track navigation timing if enabled
      if (this.config.enableNavigationTiming) {
        this.trackNavigationTiming();
      }

      // Track resource timing if enabled
      if (this.config.enableResourceTiming) {
        this.trackResourceTiming();
      }

      // Set up periodic reporting
      this.startPeriodicReporting();

      // Report on page unload
      this.setupUnloadReporting();

      console.log('[Performance] Monitoring initialized');
    } catch (error) {
      console.error('[Performance] Failed to initialize:', error);
    }
  }

  /**
   * Track Web Vitals using web-vitals library
   */
  private async trackWebVitals(): Promise<void> {
    try {
      // Dynamic import to avoid bundling if not used
      const { onCLS, onFID, onLCP, onFCP, onTTFB, onINP } = await import('web-vitals');

      // Cumulative Layout Shift
      onCLS((metric) => {
        this.webVitals.CLS = metric.value;
        this.trackMetric('web_vitals_cls', metric.value, 'score', { rating: metric.rating });
      });

      // First Input Delay
      onFID((metric) => {
        this.webVitals.FID = metric.value;
        this.trackMetric('web_vitals_fid', metric.value, 'ms', { rating: metric.rating });
      });

      // Largest Contentful Paint
      onLCP((metric) => {
        this.webVitals.LCP = metric.value;
        this.trackMetric('web_vitals_lcp', metric.value, 'ms', { rating: metric.rating });
      });

      // First Contentful Paint
      onFCP((metric) => {
        this.webVitals.FCP = metric.value;
        this.trackMetric('web_vitals_fcp', metric.value, 'ms', { rating: metric.rating });
      });

      // Time to First Byte
      onTTFB((metric) => {
        this.webVitals.TTFB = metric.value;
        this.trackMetric('web_vitals_ttfb', metric.value, 'ms', { rating: metric.rating });
      });

      // Interaction to Next Paint (Chrome 96+)
      if (onINP) {
        onINP((metric) => {
          this.webVitals.INP = metric.value;
          this.trackMetric('web_vitals_inp', metric.value, 'ms', { rating: metric.rating });
        });
      }
    } catch (error) {
      console.debug('[Performance] web-vitals library not available');
    }
  }

  /**
   * Track navigation timing
   */
  private trackNavigationTiming(): void {
    if (!window.performance || !window.performance.timing) {
      return;
    }

    // Wait for page to fully load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const navigation = window.performance.navigation;

        // DNS lookup time
        const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
        this.trackMetric('navigation_dns_time', dnsTime, 'ms');

        // TCP connection time
        const tcpTime = timing.connectEnd - timing.connectStart;
        this.trackMetric('navigation_tcp_time', tcpTime, 'ms');

        // Request time
        const requestTime = timing.responseStart - timing.requestStart;
        this.trackMetric('navigation_request_time', requestTime, 'ms');

        // Response time
        const responseTime = timing.responseEnd - timing.responseStart;
        this.trackMetric('navigation_response_time', responseTime, 'ms');

        // DOM processing time
        const domTime = timing.domComplete - timing.domLoading;
        this.trackMetric('navigation_dom_time', domTime, 'ms');

        // Total page load time
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        this.trackMetric('navigation_load_time', loadTime, 'ms', {
          navigationType: navigation.type,
          redirectCount: navigation.redirectCount,
        });

        // DOM Content Loaded
        const domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart;
        this.trackMetric('navigation_dom_content_loaded', domContentLoadedTime, 'ms');
      }, 0);
    });
  }

  /**
   * Track resource timing
   */
  private trackResourceTiming(): void {
    if (!window.performance || !window.performance.getEntriesByType) {
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

        // Aggregate by resource type
        const typeStats: Record<string, { count: number; totalSize: number; totalDuration: number }> = {};

        resources.forEach((resource) => {
          const type = this.getResourceType(resource);

          if (!typeStats[type]) {
            typeStats[type] = { count: 0, totalSize: 0, totalDuration: 0 };
          }

          typeStats[type].count++;
          typeStats[type].totalSize += resource.transferSize || 0;
          typeStats[type].totalDuration += resource.duration;
        });

        // Report aggregated stats
        Object.entries(typeStats).forEach(([type, stats]) => {
          this.trackMetric(`resource_${type}_count`, stats.count, 'count');
          this.trackMetric(`resource_${type}_size`, stats.totalSize, 'bytes');
          this.trackMetric(`resource_${type}_duration`, stats.totalDuration, 'ms');
        });

        // Total resource count and size
        const totalCount = resources.length;
        const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
        const totalDuration = resources.reduce((sum, r) => sum + r.duration, 0);

        this.trackMetric('resource_total_count', totalCount, 'count');
        this.trackMetric('resource_total_size', totalSize, 'bytes');
        this.trackMetric('resource_avg_duration', totalDuration / totalCount, 'ms');
      }, 0);
    });
  }

  /**
   * Get resource type from initiatorType
   */
  private getResourceType(resource: PerformanceResourceTiming): string {
    const initiatorType = resource.initiatorType;
    const name = resource.name.toLowerCase();

    // Classify by initiator or file extension
    if (initiatorType === 'img' || /\.(jpg|jpeg|png|gif|svg|webp|ico)/.test(name)) {
      return 'image';
    }
    if (initiatorType === 'css' || name.endsWith('.css')) {
      return 'css';
    }
    if (initiatorType === 'script' || name.endsWith('.js')) {
      return 'script';
    }
    if (/\.(woff|woff2|ttf|eot)/.test(name)) {
      return 'font';
    }
    if (initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') {
      return 'xhr';
    }

    return 'other';
  }

  /**
   * Track custom metric
   */
  trackMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' | 'score' = 'ms',
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled) {
      return;
    }

    this.metrics.push({ name, value, unit, metadata });

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value}${unit}`, metadata);
    }
  }

  /**
   * Track operation duration
   */
  trackOperation<T>(name: string, operation: () => T | Promise<T>, metadata?: Record<string, any>): T | Promise<T> {
    if (!this.config.enabled) {
      return operation();
    }

    const startTime = performance.now();

    const finish = (result?: any) => {
      const duration = performance.now() - startTime;
      this.trackMetric(`operation_${name}`, duration, 'ms', metadata);
      return result;
    };

    try {
      const result = operation();

      // Handle promises
      if (result instanceof Promise) {
        return result.then(finish).catch((error) => {
          finish();
          throw error;
        }) as any;
      }

      return finish(result);
    } catch (error) {
      finish();
      throw error;
    }
  }

  /**
   * Start periodic reporting
   */
  private startPeriodicReporting(): void {
    this.reportTimer = setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);
  }

  /**
   * Setup reporting on page unload
   */
  private setupUnloadReporting(): void {
    window.addEventListener('beforeunload', () => {
      this.reportMetrics(true); // Force synchronous for unload
    });
  }

  /**
   * Report metrics to backend
   */
  private async reportMetrics(sync: boolean = false): Promise<void> {
    if (this.metrics.length === 0) {
      return;
    }

    const payload = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      webVitals: this.webVitals,
      metrics: [...this.metrics],
    };

    // Clear metrics after capturing
    this.metrics = [];

    try {
      if (sync) {
        // Use sendBeacon for synchronous reporting on unload
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(`${this.config.apiEndpoint}/api/performance/metrics`, blob);
      } else {
        // Use fetch for async reporting
        await fetch(`${this.config.apiEndpoint}/api/performance/metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.debug('[Performance] Failed to report metrics:', error);
    }
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = undefined;
    }

    // Final report
    this.reportMetrics();
  }
}

// Singleton instance
export const performanceMonitoring = new PerformanceMonitoringService();

// Convenience exports
export const trackMetric = (name: string, value: number, unit?: 'ms' | 'bytes' | 'count' | 'score', metadata?: Record<string, any>) =>
  performanceMonitoring.trackMetric(name, value, unit, metadata);

export const trackOperation = <T>(name: string, operation: () => T | Promise<T>, metadata?: Record<string, any>) =>
  performanceMonitoring.trackOperation(name, operation, metadata);

export default performanceMonitoring;
