'use client';

import React, { ReactNode } from 'react';
import { ThemeColors } from '../../../contexts/ThemeContext';

interface ProfileCardProps {
  children: ReactNode;
  colors: ThemeColors;
  title?: string;
  titleIcon?: ReactNode;
  headerActions?: ReactNode;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  children,
  colors,
  title,
  titleIcon,
  headerActions,
}) => {
  return (
    <div
      className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {titleIcon}
            <h3
              className="text-xl font-semibold"
              style={{ color: colors.primaryText }}
            >
              {title}
            </h3>
          </div>
          {headerActions}
        </div>
      )}
      {children}
    </div>
  );
};
