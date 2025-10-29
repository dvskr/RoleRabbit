import React from 'react';
import { cn } from '../../lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingOverlay({ isLoading, message, size = 'md', className }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={cn(
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
        <LoadingSpinner size={size} />
        {message && (
          <p className="text-gray-600 text-center">{message}</p>
        )}
      </div>
    </div>
  );
}

// For inline loading overlay
export function InlineLoader({ isLoading, message }: { isLoading: boolean; message?: string }) {
  if (!isLoading) return null;

  return (
    <div className="flex items-center justify-center py-8 space-x-3">
      <LoadingSpinner size="md" />
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );
}

