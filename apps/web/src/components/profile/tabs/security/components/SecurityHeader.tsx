'use client';

import React from 'react';
import { SecurityHeaderProps } from '../types';
import { SECURITY_TITLE as DEFAULT_TITLE, SECURITY_DESCRIPTION as DEFAULT_DESCRIPTION } from '../constants';

export const SecurityHeader: React.FC<SecurityHeaderProps> = ({
  colors,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}) => {
  return (
    <div className="mb-8">
      <h2 
        className="text-3xl font-bold mb-2"
        style={{ color: colors.primaryText }}
      >
        {title}
      </h2>
      <p style={{ color: colors.secondaryText }}>
        {description}
      </p>
    </div>
  );
};

