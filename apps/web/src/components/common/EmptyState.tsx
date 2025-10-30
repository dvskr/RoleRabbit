import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && (
        <div 
          className="mb-4"
          style={{ color: colors.tertiaryText }}
        >
          {icon}
        </div>
      )}
      <h3 
        className="text-lg font-semibold mb-2"
        style={{ color: colors.primaryText }}
      >
        {title}
      </h3>
      {description && (
        <p 
          className="text-sm text-center max-w-md mb-4"
          style={{ color: colors.secondaryText }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            background: colors.primaryBlue,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.primaryBlueHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.primaryBlue;
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
