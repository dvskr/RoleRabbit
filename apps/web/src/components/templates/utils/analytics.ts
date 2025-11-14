/**
 * Analytics Tracking Utility
 *
 * Provider-agnostic analytics tracking system for template interactions.
 * Supports multiple analytics providers (Google Analytics, Mixpanel, Segment, etc.)
 *
 * @module analytics
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Analytics event categories for template interactions
 */
export enum AnalyticsCategory {
  TEMPLATE = 'Template',
  SEARCH = 'Search',
  FILTER = 'Filter',
  NAVIGATION = 'Navigation',
  USER_ENGAGEMENT = 'User Engagement',
  ERROR = 'Error',
  PERFORMANCE = 'Performance',
}

/**
 * Analytics event actions
 */
export enum AnalyticsAction {
  // Template actions
  VIEW = 'View',
  PREVIEW = 'Preview',
  ADD = 'Add to Editor',
  REMOVE = 'Remove from Editor',
  FAVORITE = 'Favorite',
  UNFAVORITE = 'Unfavorite',
  DOWNLOAD = 'Download',

  // Search actions
  SEARCH = 'Search',
  SEARCH_CLEAR = 'Clear Search',

  // Filter actions
  FILTER_APPLY = 'Apply Filter',
  FILTER_CLEAR = 'Clear Filter',
  FILTER_CLEAR_ALL = 'Clear All Filters',

  // Navigation actions
  PAGE_CHANGE = 'Page Change',
  VIEW_MODE_CHANGE = 'View Mode Change',

  // User engagement
  KEYBOARD_SHORTCUT = 'Keyboard Shortcut Used',
  TOOLTIP_VIEW = 'Tooltip Viewed',
  HELP_MODAL_OPEN = 'Help Modal Opened',

  // Errors
  ERROR_OCCURRED = 'Error Occurred',
  ERROR_BOUNDARY = 'Error Boundary Triggered',

  // Performance
  RENDER_TIME = 'Render Time',
  LOAD_TIME = 'Load Time',
}

/**
 * Analytics event data structure
 */
export interface AnalyticsEvent {
  category: AnalyticsCategory;
  action: AnalyticsAction;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Analytics provider interface
 */
export interface AnalyticsProvider {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (pageName: string) => void;
  setUserId: (userId: string) => void;
  setUserProperty: (property: string, value: unknown) => void;
}

// ============================================================================
// Analytics Manager
// ============================================================================

class AnalyticsManager {
  private providers: AnalyticsProvider[] = [];
  private isEnabled: boolean = true;
  private queue: AnalyticsEvent[] = [];
  private isDebugMode: boolean = false;

  constructor() {
    // Enable debug mode in development
    if (typeof window !== 'undefined') {
      this.isDebugMode = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1' ||
                        process.env.NODE_ENV === 'development';
    }
  }

  /**
   * Register an analytics provider
   */
  registerProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);

    // Process queued events
    this.queue.forEach(event => this.trackEvent(event));
    this.queue = [];
  }

  /**
   * Enable or disable analytics tracking
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Track an analytics event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled) return;

    // Debug logging
    if (this.isDebugMode) {
      console.log('[Analytics]', event);
    }

    // Queue events if no providers registered yet
    if (this.providers.length === 0) {
      this.queue.push(event);
      return;
    }

    // Send to all registered providers
    this.providers.forEach(provider => {
      try {
        provider.trackEvent(event);
      } catch (error) {
        console.error('[Analytics] Error tracking event:', error);
      }
    });
  }

  /**
   * Track a page view
   */
  trackPageView(pageName: string): void {
    if (!this.isEnabled) return;

    if (this.isDebugMode) {
      console.log('[Analytics] Page View:', pageName);
    }

    this.providers.forEach(provider => {
      try {
        provider.trackPageView(pageName);
      } catch (error) {
        console.error('[Analytics] Error tracking page view:', error);
      }
    });
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    if (!this.isEnabled) return;

    this.providers.forEach(provider => {
      try {
        provider.setUserId(userId);
      } catch (error) {
        console.error('[Analytics] Error setting user ID:', error);
      }
    });
  }

  /**
   * Set user property
   */
  setUserProperty(property: string, value: unknown): void {
    if (!this.isEnabled) return;

    this.providers.forEach(provider => {
      try {
        provider.setUserProperty(property, value);
      } catch (error) {
        console.error('[Analytics] Error setting user property:', error);
      }
    });
  }
}

// ============================================================================
// Global Analytics Instance
// ============================================================================

export const analytics = new AnalyticsManager();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Track template view event
 */
export const trackTemplateView = (templateId: string, templateName: string) => {
  analytics.trackEvent({
    category: AnalyticsCategory.TEMPLATE,
    action: AnalyticsAction.VIEW,
    label: templateName,
    metadata: { templateId },
  });
};

/**
 * Track template preview event
 */
export const trackTemplatePreview = (templateId: string, templateName: string) => {
  analytics.trackEvent({
    category: AnalyticsCategory.TEMPLATE,
    action: AnalyticsAction.PREVIEW,
    label: templateName,
    metadata: { templateId },
  });
};

/**
 * Track template add to editor event
 */
export const trackTemplateAdd = (templateId: string, templateName: string) => {
  analytics.trackEvent({
    category: AnalyticsCategory.TEMPLATE,
    action: AnalyticsAction.ADD,
    label: templateName,
    metadata: { templateId },
  });
};

/**
 * Track template remove from editor event
 */
export const trackTemplateRemove = (templateId: string, templateName: string) => {
  analytics.trackEvent({
    category: AnalyticsCategory.TEMPLATE,
    action: AnalyticsAction.REMOVE,
    label: templateName,
    metadata: { templateId },
  });
};

/**
 * Track template favorite event
 */
export const trackTemplateFavorite = (templateId: string, templateName: string, isFavorited: boolean) => {
  analytics.trackEvent({
    category: AnalyticsCategory.TEMPLATE,
    action: isFavorited ? AnalyticsAction.FAVORITE : AnalyticsAction.UNFAVORITE,
    label: templateName,
    metadata: { templateId, isFavorited },
  });
};

/**
 * Track template download event
 */
export const trackTemplateDownload = (templateId: string, templateName: string) => {
  analytics.trackEvent({
    category: AnalyticsCategory.TEMPLATE,
    action: AnalyticsAction.DOWNLOAD,
    label: templateName,
    metadata: { templateId },
  });
};

/**
 * Track search event
 */
export const trackSearch = (query: string, resultCount: number) => {
  analytics.trackEvent({
    category: AnalyticsCategory.SEARCH,
    action: AnalyticsAction.SEARCH,
    label: query,
    value: resultCount,
    metadata: { query, resultCount },
  });
};

/**
 * Track search clear event
 */
export const trackSearchClear = () => {
  analytics.trackEvent({
    category: AnalyticsCategory.SEARCH,
    action: AnalyticsAction.SEARCH_CLEAR,
  });
};

/**
 * Track filter apply event
 */
export const trackFilterApply = (filterType: string, filterValue: string) => {
  analytics.trackEvent({
    category: AnalyticsCategory.FILTER,
    action: AnalyticsAction.FILTER_APPLY,
    label: `${filterType}: ${filterValue}`,
    metadata: { filterType, filterValue },
  });
};

/**
 * Track filter clear event
 */
export const trackFilterClear = (filterType: string) => {
  analytics.trackEvent({
    category: AnalyticsCategory.FILTER,
    action: AnalyticsAction.FILTER_CLEAR,
    label: filterType,
    metadata: { filterType },
  });
};

/**
 * Track clear all filters event
 */
export const trackClearAllFilters = (activeFilterCount: number) => {
  analytics.trackEvent({
    category: AnalyticsCategory.FILTER,
    action: AnalyticsAction.FILTER_CLEAR_ALL,
    value: activeFilterCount,
    metadata: { activeFilterCount },
  });
};

/**
 * Track page change event
 */
export const trackPageChange = (newPage: number, totalPages: number) => {
  analytics.trackEvent({
    category: AnalyticsCategory.NAVIGATION,
    action: AnalyticsAction.PAGE_CHANGE,
    label: `Page ${newPage} of ${totalPages}`,
    value: newPage,
    metadata: { page: newPage, totalPages },
  });
};

/**
 * Track view mode change event
 */
export const trackViewModeChange = (viewMode: 'grid' | 'list') => {
  analytics.trackEvent({
    category: AnalyticsCategory.NAVIGATION,
    action: AnalyticsAction.VIEW_MODE_CHANGE,
    label: viewMode,
    metadata: { viewMode },
  });
};

/**
 * Track keyboard shortcut usage
 */
export const trackKeyboardShortcut = (shortcut: string, action: string) => {
  analytics.trackEvent({
    category: AnalyticsCategory.USER_ENGAGEMENT,
    action: AnalyticsAction.KEYBOARD_SHORTCUT,
    label: `${shortcut}: ${action}`,
    metadata: { shortcut, action },
  });
};

/**
 * Track help modal open event
 */
export const trackHelpModalOpen = () => {
  analytics.trackEvent({
    category: AnalyticsCategory.USER_ENGAGEMENT,
    action: AnalyticsAction.HELP_MODAL_OPEN,
  });
};

/**
 * Track error event
 */
export const trackError = (errorMessage: string, errorStack?: string, context?: string) => {
  analytics.trackEvent({
    category: AnalyticsCategory.ERROR,
    action: AnalyticsAction.ERROR_OCCURRED,
    label: errorMessage,
    metadata: {
      errorMessage,
      errorStack,
      context,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track error boundary trigger
 */
export const trackErrorBoundary = (error: Error, errorInfo?: { componentStack?: string }) => {
  analytics.trackEvent({
    category: AnalyticsCategory.ERROR,
    action: AnalyticsAction.ERROR_BOUNDARY,
    label: error.message,
    metadata: {
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track render performance
 */
export const trackRenderTime = (componentName: string, renderTime: number) => {
  analytics.trackEvent({
    category: AnalyticsCategory.PERFORMANCE,
    action: AnalyticsAction.RENDER_TIME,
    label: componentName,
    value: Math.round(renderTime),
    metadata: { componentName, renderTime },
  });
};

/**
 * Track load performance
 */
export const trackLoadTime = (resourceName: string, loadTime: number) => {
  analytics.trackEvent({
    category: AnalyticsCategory.PERFORMANCE,
    action: AnalyticsAction.LOAD_TIME,
    label: resourceName,
    value: Math.round(loadTime),
    metadata: { resourceName, loadTime },
  });
};

// ============================================================================
// Example Provider Implementations
// ============================================================================

/**
 * Google Analytics 4 provider (example implementation)
 */
export class GA4Provider implements AnalyticsProvider {
  trackEvent(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata,
      });
    }
  }

  trackPageView(pageName: string): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: pageName,
      });
    }
  }

  setUserId(userId: string): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId,
      });
    }
  }

  setUserProperty(property: string, value: unknown): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('set', 'user_properties', {
        [property]: value,
      });
    }
  }
}

/**
 * Console logger provider (for development/debugging)
 */
export class ConsoleLoggerProvider implements AnalyticsProvider {
  trackEvent(event: AnalyticsEvent): void {
    console.log('[Analytics Event]', {
      category: event.category,
      action: event.action,
      label: event.label,
      value: event.value,
      metadata: event.metadata,
    });
  }

  trackPageView(pageName: string): void {
    console.log('[Analytics Page View]', pageName);
  }

  setUserId(userId: string): void {
    console.log('[Analytics User ID]', userId);
  }

  setUserProperty(property: string, value: unknown): void {
    console.log('[Analytics User Property]', property, value);
  }
}

// ============================================================================
// Auto-initialize in development
// ============================================================================

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Register console logger in development
  analytics.registerProvider(new ConsoleLoggerProvider());
}
