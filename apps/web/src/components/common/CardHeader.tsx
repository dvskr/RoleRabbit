import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 
          className="text-lg font-semibold"
          style={{ color: colors.primaryText }}
        >
          {title}
        </h3>
        {subtitle && (
          <p 
            className="text-sm mt-1"
            style={{ color: colors.tertiaryText }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
