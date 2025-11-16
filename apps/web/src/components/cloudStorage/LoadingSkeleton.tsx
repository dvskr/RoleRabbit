'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingSkeletonProps {
  count?: number;
  colors?: any;
}

export const FileCardSkeleton: React.FC<{ colors?: any }> = ({ colors }) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;

  return (
    <div
      className="rounded-xl p-5 animate-pulse"
      style={{
        background: '#1A202C',
        border: '1px solid #2D3748',
        maxWidth: '340px',
        minWidth: '280px',
      }}
    >
      {/* Icon skeleton */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-lg"
          style={{ background: palette.inputBackground || '#2D3748' }}
        />
        <div className="flex-1 space-y-2">
          <div
            className="h-5 rounded w-3/4"
            style={{ background: palette.inputBackground || '#2D3748' }}
          />
          <div
            className="h-3 rounded w-1/2"
            style={{ background: palette.inputBackground || '#2D3748' }}
          />
        </div>
      </div>
      
      {/* Metadata skeleton */}
      <div className="space-y-2 mb-4">
        <div
          className="h-3 rounded w-full"
          style={{ background: palette.inputBackground || '#2D3748' }}
        />
        <div
          className="h-3 rounded w-2/3"
          style={{ background: palette.inputBackground || '#2D3748' }}
        />
      </div>
      
      {/* Actions skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-8 rounded-lg"
            style={{ background: palette.inputBackground || '#2D3748' }}
          />
        ))}
      </div>
    </div>
  );
};

export const FileListSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 6, colors }) => {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
      {Array.from({ length: count }).map((_, i) => (
        <FileCardSkeleton key={i} colors={colors} />
      ))}
    </div>
  );
};

export default FileListSkeleton;

