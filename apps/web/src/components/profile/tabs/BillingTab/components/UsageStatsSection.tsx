import React from 'react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { UsageStatistic } from '../types';

interface UsageStatsSectionProps {
  stats: UsageStatistic[];
}

export const UsageStatsSection: React.FC<UsageStatsSectionProps> = ({
  stats
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  return (
    <div 
      className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <h3 
        className="text-xl font-semibold mb-6"
        style={{ color: colors.primaryText }}
      >
        Usage This Month
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="text-center p-4 rounded-xl"
            style={{
              background: stat.bgColor,
              border: `1px solid ${stat.borderColor}`,
            }}
          >
            <p 
              className="text-2xl font-bold"
              style={{ color: colors.primaryText }}
            >
              {stat.value}
            </p>
            <p 
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

