/**
 * useAnalytics Hook
 *
 * React hook for easy analytics integration in template components.
 * Provides convenient methods for tracking common template interactions.
 *
 * @module useAnalytics
 *
 * @example
 * ```tsx
 * const analytics = useAnalytics();
 *
 * const handleTemplateClick = (template) => {
 *   analytics.trackTemplatePreview(template.id, template.name);
 *   // ... open preview modal
 * };
 * ```
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  trackTemplateView,
  trackTemplatePreview,
  trackTemplateAdd,
  trackTemplateRemove,
  trackTemplateFavorite,
  trackTemplateDownload,
  trackSearch,
  trackSearchClear,
  trackFilterApply,
  trackFilterClear,
  trackClearAllFilters,
  trackPageChange,
  trackViewModeChange,
  trackKeyboardShortcut,
  trackHelpModalOpen,
  trackError,
  trackRenderTime,
} from '../utils/analytics';

/**
 * Options for useAnalytics hook
 */
export interface UseAnalyticsOptions {
  /**
   * Component name for performance tracking
   */
  componentName?: string;

  /**
   * Enable performance tracking (render time)
   */
  trackPerformance?: boolean;
}

/**
 * Return type for useAnalytics hook
 */
export interface UseAnalyticsReturn {
  // Template tracking
  trackTemplateView: (templateId: string, templateName: string) => void;
  trackTemplatePreview: (templateId: string, templateName: string) => void;
  trackTemplateAdd: (templateId: string, templateName: string) => void;
  trackTemplateRemove: (templateId: string, templateName: string) => void;
  trackTemplateFavorite: (templateId: string, templateName: string, isFavorited: boolean) => void;
  trackTemplateDownload: (templateId: string, templateName: string) => void;

  // Search tracking
  trackSearch: (query: string, resultCount: number) => void;
  trackSearchClear: () => void;

  // Filter tracking
  trackFilterApply: (filterType: string, filterValue: string) => void;
  trackFilterClear: (filterType: string) => void;
  trackClearAllFilters: (activeFilterCount: number) => void;

  // Navigation tracking
  trackPageChange: (newPage: number, totalPages: number) => void;
  trackViewModeChange: (viewMode: 'grid' | 'list') => void;

  // User engagement tracking
  trackKeyboardShortcut: (shortcut: string, action: string) => void;
  trackHelpModalOpen: () => void;

  // Error tracking
  trackError: (errorMessage: string, errorStack?: string, context?: string) => void;
}

/**
 * Custom hook for analytics tracking in template components
 */
export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const { componentName, trackPerformance = false } = options;

  // Track render time if performance tracking enabled
  const renderStartTime = useRef<number>(Date.now());

  useEffect(() => {
    if (trackPerformance && componentName) {
      const renderTime = Date.now() - renderStartTime.current;
      trackRenderTime(componentName, renderTime);
    }
  }, [trackPerformance, componentName]);

  // Reset render start time on each render
  renderStartTime.current = Date.now();

  // Memoize tracking functions to prevent unnecessary re-renders
  const trackTemplateViewMemo = useCallback(trackTemplateView, []);
  const trackTemplatePreviewMemo = useCallback(trackTemplatePreview, []);
  const trackTemplateAddMemo = useCallback(trackTemplateAdd, []);
  const trackTemplateRemoveMemo = useCallback(trackTemplateRemove, []);
  const trackTemplateFavoriteMemo = useCallback(trackTemplateFavorite, []);
  const trackTemplateDownloadMemo = useCallback(trackTemplateDownload, []);
  const trackSearchMemo = useCallback(trackSearch, []);
  const trackSearchClearMemo = useCallback(trackSearchClear, []);
  const trackFilterApplyMemo = useCallback(trackFilterApply, []);
  const trackFilterClearMemo = useCallback(trackFilterClear, []);
  const trackClearAllFiltersMemo = useCallback(trackClearAllFilters, []);
  const trackPageChangeMemo = useCallback(trackPageChange, []);
  const trackViewModeChangeMemo = useCallback(trackViewModeChange, []);
  const trackKeyboardShortcutMemo = useCallback(trackKeyboardShortcut, []);
  const trackHelpModalOpenMemo = useCallback(trackHelpModalOpen, []);
  const trackErrorMemo = useCallback(trackError, []);

  return {
    trackTemplateView: trackTemplateViewMemo,
    trackTemplatePreview: trackTemplatePreviewMemo,
    trackTemplateAdd: trackTemplateAddMemo,
    trackTemplateRemove: trackTemplateRemoveMemo,
    trackTemplateFavorite: trackTemplateFavoriteMemo,
    trackTemplateDownload: trackTemplateDownloadMemo,
    trackSearch: trackSearchMemo,
    trackSearchClear: trackSearchClearMemo,
    trackFilterApply: trackFilterApplyMemo,
    trackFilterClear: trackFilterClearMemo,
    trackClearAllFilters: trackClearAllFiltersMemo,
    trackPageChange: trackPageChangeMemo,
    trackViewModeChange: trackViewModeChangeMemo,
    trackKeyboardShortcut: trackKeyboardShortcutMemo,
    trackHelpModalOpen: trackHelpModalOpenMemo,
    trackError: trackErrorMemo,
  };
}
