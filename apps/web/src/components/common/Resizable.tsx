import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizableProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  onResize?: (width: number) => void;
}

export function Resizable({ children, minWidth = 100, maxWidth = 800, defaultWidth = 300, onResize }: ResizableProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const newWidth = e.clientX - containerRef.current.getBoundingClientRect().left;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    setWidth(clampedWidth);
    onResize?.(clampedWidth);
  }, [isResizing, minWidth, maxWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="relative flex" style={{ width }}>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="w-1 bg-gray-300 cursor-col-resize hover:bg-blue-500 transition-colors"
      />
    </div>
  );
}

