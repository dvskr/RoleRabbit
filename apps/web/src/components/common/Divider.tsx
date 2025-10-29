import React from 'react';
import { cn } from '../../lib/utils';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export function Divider({ orientation = 'horizontal', label, className }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={cn('w-px bg-gray-300 self-stretch', className)} />;
  }

  if (label) {
    return (
      <div className={cn('flex items-center my-4', className)}>
        <div className="flex-1 h-px bg-gray-300" />
        <span className="px-4 text-sm text-gray-600">{label}</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>
    );
  }

  return <div className={cn('h-px bg-gray-300 my-4', className)} />;
}

