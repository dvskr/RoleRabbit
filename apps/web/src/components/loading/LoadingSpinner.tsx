/**
 * Loading Spinner Component
 * Section 1.6: Reusable loading spinner with multiple sizes and variants
 */

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const colorMap = {
  primary: 'text-blue-500',
  secondary: 'text-gray-500',
  white: 'text-white',
};

/**
 * Animated loading spinner
 * @param size - Spinner size (sm, md, lg, xl)
 * @param variant - Color variant (primary, secondary, white)
 * @param text - Optional loading text
 */
export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
  text,
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        className={`${colorMap[variant]} animate-spin`}
        size={sizeMap[size]}
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({
  text = 'Loading...',
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
    >
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * Button loading spinner (inline)
 */
export function ButtonSpinner({
  size = 'sm',
  variant = 'white',
  className = '',
}: Omit<LoadingSpinnerProps, 'text'>) {
  return (
    <Loader2
      className={`${colorMap[variant]} animate-spin ${className}`}
      size={sizeMap[size]}
    />
  );
}

export default LoadingSpinner;
