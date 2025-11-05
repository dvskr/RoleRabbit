'use client';

import React from 'react';
import { SecurityCardProps } from '../types';

export const SecurityCard: React.FC<SecurityCardProps> = ({
  children,
  colors,
  title,
}) => {
  return (
    <div 
      className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
      style={{
        background: colors.cardBackground,
      }}
    >
      {title && (
        <h3 
          className="text-xl font-semibold mb-6"
          style={{ color: colors.primaryText }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

