'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { FloatingUploadButtonProps } from './types';

export const FloatingUploadButton: React.FC<FloatingUploadButtonProps> = ({
  onUpload,
  colors,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onUpload}
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        style={{
          background: colors.primaryBlue,
          color: 'white',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        title="Upload Files"
      >
        <Upload size={20} className="group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
};

