/**
 * usePerformance Hook
 * Easy-to-use React hook for tracking component performance
 */

import { useEffect, useRef, useCallback } from 'react';
import { trackMetric, trackOperation } from '../services/performanceMonitoring';

interface UsePerformanceOptions {
  componentName: string;
  trackMount?: boolean;
  trackRender?: boolean;
  trackUnmount?: boolean;
}

interface PerformanceHelpers {
  trackAction: (actionName: string, action: () => void | Promise<void>) => void | Promise<void>;
  trackMetric: (metricName: string, value: number, unit?: 'ms' | 'bytes' | 'count' | 'score') => void;
  startTimer: (timerName: string) => () => void;
}

/**
 * Hook for tracking component performance
 */
export function usePerformance(options: UsePerformanceOptions): PerformanceHelpers {
  const { componentName, trackMount = false, trackRender = false, trackUnmount = false } = options;

  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const timersRef = useRef<Map<string, number>>(new Map());

  // Track mount time
  useEffect(() => {
    const mountTime = performance.now();
    mountTimeRef.current = mountTime;

    if (trackMount) {
      // Track time from page load to component mount
      const timeToMount = mountTime;
      trackMetric(`component_mount_${componentName}`, timeToMount, 'ms');
    }

    // Track unmount
    return () => {
      if (trackUnmount) {
        const lifetime = performance.now() - mountTimeRef.current;
        trackMetric(`component_lifetime_${componentName}`, lifetime, 'ms');
      }
    };
  }, [componentName, trackMount, trackUnmount]);

  // Track render count and duration
  useEffect(() => {
    renderCountRef.current++;

    if (trackRender) {
      trackMetric(`component_render_count_${componentName}`, renderCountRef.current, 'count');
    }
  });

  // Track user action
  const trackAction = useCallback(
    (actionName: string, action: () => void | Promise<void>) => {
      return trackOperation(`${componentName}_${actionName}`, action, {
        component: componentName,
      });
    },
    [componentName]
  );

  // Track custom metric
  const trackCustomMetric = useCallback(
    (metricName: string, value: number, unit: 'ms' | 'bytes' | 'count' | 'score' = 'ms') => {
      trackMetric(`${componentName}_${metricName}`, value, unit, {
        component: componentName,
      });
    },
    [componentName]
  );

  // Start a timer
  const startTimer = useCallback(
    (timerName: string) => {
      const startTime = performance.now();
      timersRef.current.set(timerName, startTime);

      // Return function to stop timer
      return () => {
        const endTime = performance.now();
        const duration = endTime - (timersRef.current.get(timerName) || endTime);
        timersRef.current.delete(timerName);

        trackMetric(`${componentName}_${timerName}`, duration, 'ms', {
          component: componentName,
        });

        return duration;
      };
    },
    [componentName]
  );

  return {
    trackAction,
    trackMetric: trackCustomMetric,
    startTimer,
  };
}

/**
 * Hook for tracking data fetching performance
 */
export function useFetchPerformance(resourceName: string) {
  const trackFetch = useCallback(
    async <T,>(fetcher: () => Promise<T>): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await fetcher();
        const duration = performance.now() - startTime;

        trackMetric(`fetch_${resourceName}_success`, duration, 'ms', {
          resource: resourceName,
          status: 'success',
        });

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        trackMetric(`fetch_${resourceName}_error`, duration, 'ms', {
          resource: resourceName,
          status: 'error',
        });

        throw error;
      }
    },
    [resourceName]
  );

  return { trackFetch };
}

/**
 * Hook for tracking list rendering performance
 */
export function useListPerformance(listName: string, itemCount: number) {
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    const renderDuration = performance.now() - renderStartRef.current;

    trackMetric(`list_render_${listName}`, renderDuration, 'ms', {
      itemCount,
      avgPerItem: renderDuration / Math.max(itemCount, 1),
    });
  }, [listName, itemCount]);
}

/**
 * Hook for tracking user interactions
 */
export function useInteractionTracking(componentName: string) {
  const trackClick = useCallback(
    (elementName: string) => {
      trackMetric(`interaction_click_${componentName}_${elementName}`, 1, 'count', {
        component: componentName,
        element: elementName,
        type: 'click',
      });
    },
    [componentName]
  );

  const trackHover = useCallback(
    (elementName: string, duration: number) => {
      trackMetric(`interaction_hover_${componentName}_${elementName}`, duration, 'ms', {
        component: componentName,
        element: elementName,
        type: 'hover',
      });
    },
    [componentName]
  );

  const trackScroll = useCallback(
    (scrollDepth: number) => {
      trackMetric(`interaction_scroll_${componentName}`, scrollDepth, 'count', {
        component: componentName,
        type: 'scroll',
      });
    },
    [componentName]
  );

  return {
    trackClick,
    trackHover,
    trackScroll,
  };
}

export default usePerformance;
