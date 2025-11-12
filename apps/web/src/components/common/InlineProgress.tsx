'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger';

export interface InlineProgressProps {
  message: string;
  progress: number; // 0-100
  variant?: ProgressVariant;
  showPercentage?: boolean;
  className?: string;
}

const VARIANT_COLORS = {
  primary: {
    bar: 'bg-blue-600',
    text: 'text-gray-700',
    spinner: 'text-blue-600'
  },
  success: {
    bar: 'bg-green-600',
    text: 'text-gray-700',
    spinner: 'text-green-600'
  },
  warning: {
    bar: 'bg-yellow-600',
    text: 'text-gray-700',
    spinner: 'text-yellow-600'
  },
  danger: {
    bar: 'bg-red-600',
    text: 'text-gray-700',
    spinner: 'text-red-600'
  }
};

export function InlineProgress({
  message,
  progress,
  variant = 'primary',
  showPercentage = true,
  className = ''
}: InlineProgressProps) {
  const colors = VARIANT_COLORS[variant];

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className={`w-3.5 h-3.5 animate-spin ${colors.spinner} flex-shrink-0`} />
          <span className={colors.text}>{message}</span>
        </div>
        {showPercentage && (
          <span className="text-xs font-medium text-gray-600">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colors.bar}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

