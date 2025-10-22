'use client';

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance: ${componentName}`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
          timestamp: new Date().toISOString()
        });
      }

      // Warn about slow renders
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
};

export const useMemoryMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const logMemoryUsage = () => {
        const memory = (performance as any).memory;
        console.log('Memory Usage:', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
        });
      };

      // Log memory usage every 30 seconds
      const interval = setInterval(logMemoryUsage, 30000);
      return () => clearInterval(interval);
    }
  }, []);
};
