/**
 * Performance Optimization Hooks
 * Section 1.9: Centralized performance hooks
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Debounced function interface with cancel method
 */
export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

/**
 * Hook for debounced values
 * Use for form inputs to reduce re-renders
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // API call with debounced value
 *   searchAPI(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for debounced callbacks
 * Use for form onChange handlers
 *
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   searchAPI(query);
 * }, 300);
 *
 * <input onChange={(e) => handleSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): DebouncedFunction<T> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as DebouncedFunction<T>;

  debouncedFn.cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return debouncedFn;
}

/**
 * Hook for throttled callbacks
 * Use for scroll/resize handlers
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottledCallback(() => {
 *   console.log('Scrolled!');
 * }, 100);
 *
 * <div onScroll={handleScroll}>...</div>
 * ```
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const inThrottleRef = useRef<boolean>(false);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        callbackRef.current(...args);
        inThrottleRef.current = true;
        setTimeout(() => {
          inThrottleRef.current = false;
        }, limit);
      }
    },
    [limit]
  );
}

/**
 * Hook for lazy loading images with IntersectionObserver
 * Use in preview panels for better performance
 *
 * @example
 * ```tsx
 * const { imageSrc, imageRef, isLoaded } = useLazyImage(imageUrl, placeholderUrl);
 *
 * <img
 *   ref={imageRef}
 *   src={imageSrc}
 *   alt="Description"
 *   className={isLoaded ? 'loaded' : 'loading'}
 * />
 * ```
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(placeholder);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imageRef || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            setIsLoaded(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(imageRef);

    return () => {
      if (imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src]);

  return {
    imageSrc,
    imageRef: setImageRef,
    isLoaded,
  };
}

/**
 * Hook for memoizing expensive computations
 * Alternative to useMemo with explicit dependencies
 *
 * @example
 * ```tsx
 * const expensiveResult = useMemoized(
 *   () => computeExpensiveValue(a, b),
 *   [a, b]
 * );
 * ```
 */
export function useMemoized<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Hook for detecting slow renders
 * Development tool to identify performance bottlenecks
 *
 * @example
 * ```tsx
 * useRenderTime('MyComponent', 50); // Warn if render takes > 50ms
 * ```
 */
export function useRenderTime(componentName: string, threshold: number = 16) {
  const renderStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current;
    if (renderTime > threshold && process.env.NODE_ENV === 'development') {
      console.warn(
        `[Performance] ${componentName} took ${renderTime}ms to render (threshold: ${threshold}ms)`
      );
    }
    renderStartTime.current = Date.now();
  });
}

/**
 * Hook for batching state updates
 * Use when you need to update multiple states together
 *
 * @example
 * ```tsx
 * const batchUpdate = useBatchedUpdates();
 *
 * batchUpdate(() => {
 *   setState1(value1);
 *   setState2(value2);
 *   setState3(value3);
 * });
 * ```
 */
export function useBatchedUpdates() {
  return useCallback((callback: () => void) => {
    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      requestAnimationFrame(callback);
    } else {
      callback();
    }
  }, []);
}

/**
 * Hook for pagination state
 * Section 1.9 requirement #12: Pagination for portfolios
 *
 * @example
 * ```tsx
 * const { currentPage, itemsPerPage, paginatedItems, goToPage, nextPage, prevPage } =
 *   usePagination(allItems, 20);
 * ```
 */
export function usePagination<T>(items: T[], itemsPerPage: number = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    totalItems: items.length,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, items.length),
  };
}

/**
 * Hook for virtual scrolling
 * Section 1.9 requirement #10: Virtualization for long lists
 *
 * @example
 * ```tsx
 * const { visibleItems, scrollContainerRef, totalHeight } =
 *   useVirtualScroll(items, 50); // 50px item height
 * ```
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  overscan: number = 3
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    handleResize();
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index,
    top: (startIndex + index) * itemHeight,
  }));

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    scrollContainerRef,
    totalHeight,
    startIndex,
    endIndex,
  };
}
