import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

export function Tooltip({ content, children, position = 'top', delay = 0, disabled = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (disabled) return;
    
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const parent = tooltipRef.current.parentElement?.getBoundingClientRect();
      
      if (parent) {
        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = parent.top - rect.height - 8;
            left = parent.left + (parent.width - rect.width) / 2;
            break;
          case 'bottom':
            top = parent.bottom + 8;
            left = parent.left + (parent.width - rect.width) / 2;
            break;
          case 'left':
            top = parent.top + (parent.height - rect.height) / 2;
            left = parent.left - rect.width - 8;
            break;
          case 'right':
            top = parent.top + (parent.height - rect.height) / 2;
            left = parent.right + 8;
            break;
        }

        setTooltipPosition({ top, left });
      }
    }
  }, [isVisible, position]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <span className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
            positionClasses[position]
          )}
          style={position === 'left' || position === 'right' ? {
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`
          } : undefined}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute',
              position === 'top' && 'top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900',
              position === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900',
              position === 'left' && 'left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900',
              position === 'right' && 'right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900'
            )}
          />
        </div>
      )}
    </span>
  );
}
