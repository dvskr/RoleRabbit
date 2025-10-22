'use client';

import React, { memo, useMemo, useCallback } from 'react';

// Memoized components for better performance
export const MemoizedButton = memo(({ children, onClick, className, ...props }: any) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg transition-colors ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
});

export const MemoizedInput = memo(({ value, onChange, placeholder, className, ...props }: any) => {
  return (
    <input
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  );
});

export const MemoizedTextarea = memo(({ value, onChange, placeholder, className, ...props }: any) => {
  return (
    <textarea
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  );
});

// Performance-optimized list component
export const VirtualizedList = memo(({ 
  items, 
  renderItem, 
  itemHeight = 50, 
  containerHeight = 400,
  className = ''
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}) => {
  const visibleItems = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
    return items.slice(0, visibleCount);
  }, [items, itemHeight, containerHeight]);

  return (
    <div className={`overflow-y-auto ${className}`} style={{ height: containerHeight }}>
      {visibleItems.map((item, index) => (
        <div key={item.id || index} style={{ height: itemHeight }}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
});

// Debounced input for better performance
export const DebouncedInput = memo(({ 
  value, 
  onChange, 
  delay = 300, 
  placeholder,
  className = '',
  ...props 
}: {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  placeholder?: string;
  className?: string;
  [key: string]: any;
}) => {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, delay, onChange]);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <input
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      {...props}
    />
  );
});

// Optimized form component
export const OptimizedForm = memo(({ 
  children, 
  onSubmit, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  [key: string]: any;
}) => {
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  }, [onSubmit]);

  return (
    <form className={className} onSubmit={handleSubmit} {...props}>
      {children}
    </form>
  );
});

// Performance monitoring component
export const PerformanceMonitor = memo(({ 
  componentName, 
  children 
}: {
  componentName: string;
  children: React.ReactNode;
}) => {
  const renderStartTime = React.useRef<number>(0);
  const renderCount = React.useRef<number>(0);

  React.useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance: ${componentName}`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current
        });

        if (renderTime > 16) {
          console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });

  return <>{children}</>;
});

// Lazy loading wrapper
export const LazyWrapper = memo(({ 
  children, 
  fallback = <div>Loading...</div>,
  threshold = 0.1
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
});

// Memoized modal component
export const MemoizedModal = memo(({ 
  isOpen, 
  onClose, 
  children, 
  title,
  className = ''
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) => {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg shadow-lg max-w-md w-full mx-4 ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
});
