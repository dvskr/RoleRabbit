import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface CollapseProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Collapse({ title, children, defaultOpen = false, icon, className }: CollapseProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [height, setHeight] = useState(defaultOpen ? 'auto' : '0');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : '0');
    }
  }, [isOpen, children]);

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span className="font-medium text-left">{title}</span>
        </div>
        <svg
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform',
            isOpen && 'transform rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ height }}
      >
        <div ref={contentRef} className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

