'use client';

import React from 'react';
import { Cloud } from 'lucide-react';
import { EmptyFilesStateProps } from './types';

export const EmptyFilesState: React.FC<EmptyFilesStateProps> = ({
  searchTerm,
  filterType,
  onUpload,
  colors,
}) => {
  return (
    <div className="text-center py-12">
      <div 
        className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
        style={{
          background: colors.inputBackground,
        }}
      >
        <Cloud size={24} style={{ color: colors.tertiaryText }} />
      </div>
      <h3 
        className="text-lg font-semibold mb-2"
        style={{ color: colors.primaryText }}
      >
        No Files Found
      </h3>
      <p 
        className="mb-4"
        style={{ color: colors.secondaryText }}
      >
        {searchTerm || filterType !== 'all' 
          ? 'Try adjusting your search or filter criteria'
          : 'Upload your first file to get started'
        }
      </p>
      {(!searchTerm && filterType === 'all') && (
        <button
          onClick={onUpload}
          className="px-4 py-2 rounded-lg transition-colors"
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
          aria-label="Upload files"
        >
          Upload Your First File
        </button>
      )}
    </div>
  );
};

