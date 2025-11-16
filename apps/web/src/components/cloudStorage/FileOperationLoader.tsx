'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface FileOperationLoaderProps {
  fileId: string;
  operation: string;
  colors?: any;
}

/**
 * FE-035: Loading state for individual file operations
 */
export const FileOperationLoader: React.FC<FileOperationLoaderProps> = ({
  fileId,
  operation,
  colors,
}) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-xl"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(2px)',
        zIndex: 10,
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader2 size={24} className="animate-spin" style={{ color: palette.primaryBlue }} />
        <p className="text-xs font-medium" style={{ color: 'white' }}>
          {operation}...
        </p>
      </div>
    </div>
  );
};

