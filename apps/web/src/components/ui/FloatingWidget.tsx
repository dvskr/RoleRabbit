'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface FloatingWidgetProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hover?: boolean;
}

export function FloatingWidget({ 
  children, 
  className = '', 
  noPadding = false, 
  hover = false 
}: FloatingWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${hover ? 'hover:-translate-y-1 cursor-pointer' : ''} ${noPadding ? '' : 'p-6'} ${className}`}
      style={{
        background: isDark 
          ? 'rgba(30, 41, 59, 0.95)' 
          : '#ffffff', // Pure white for light mode
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',  // Safari support
        border: isDark 
          ? '1px solid rgba(255, 255, 255, 0.08)' 
          : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      {children}
    </div>
  );
}

