'use client';

import React from 'react';
import { ThemeColors } from '../../contexts/ThemeContext';
import { LoadingStateProps } from './types';
import { DEFAULT_LOADING_MESSAGE } from './constants';

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  colors, 
  message = DEFAULT_LOADING_MESSAGE 
}) => {
  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{ background: colors.background }}
    >
      <div className="text-center">
        <div 
          className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
          style={{
            borderColor: colors.primaryBlue,
            borderTopColor: 'transparent',
          }}
        />
        <p style={{ color: colors.secondaryText }}>{message}</p>
      </div>
    </div>
  );
};

