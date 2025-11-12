'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  colors: ThemeColors;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  message,
  colors,
  actionButton,
}) => {
  return (
    <div className="text-center py-12">
      <Icon
        size={48}
        className="mx-auto mb-4"
        style={{ color: colors.tertiaryText, opacity: 0.5 }}
      />
      <p
        className="text-lg mb-4"
        style={{ color: colors.tertiaryText }}
      >
        {message}
      </p>
      {actionButton && (
        <button
          type="button"
          onClick={actionButton.onClick}
          className="px-6 py-3 rounded-xl transition-all duration-200"
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
        >
          {actionButton.label}
        </button>
      )}
    </div>
  );
};
