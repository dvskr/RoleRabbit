'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { FloatingUploadButtonProps } from './types';

export const FloatingUploadButton: React.FC<FloatingUploadButtonProps> = ({
  onUpload,
  colors,
}) => {
  return (
    <button
      onClick={onUpload}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all z-50 flex items-center justify-center"
      style={{
        background: colors.primaryBlue,
        color: 'white',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.opacity = '1';
      }}
      aria-label="Upload file"
      title="Upload file"
    >
      <Upload size={24} />
    </button>
  );
};

