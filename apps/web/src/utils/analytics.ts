/**
 * Analytics utilities for tracking user interactions
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];

  /**
   * Track an event
   */
  track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now()
    };

    this.events.push(event);
    
    // Send to analytics service (mock)
    console.log('Analytics event:', event);
  }

  /**
   * Track page view
   */
  page(name: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page: name,
      ...properties
    });
  }

  /**
   * Track error
   */
  error(error: Error, properties?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...properties
    });
  }

  /**
   * Get events
   */
  getEvents() {
    return this.events;
  }

  /**
   * Clear events
   */
  clear() {
    this.events = [];
  }
}

export const analytics = new Analytics();

