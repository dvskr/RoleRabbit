import React from 'react';
import type { ProgressMetric } from '../types/dashboardFigma';
import { useTheme } from '../../../contexts/ThemeContext';

interface ProgressMetricItemProps {
  metric: ProgressMetric;
  isLast?: boolean;
}

export function ProgressMetricItem({ metric, isLast = false }: ProgressMetricItemProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const isLightTheme = theme.mode === 'light';
  
  // Use theme-aware colors
  const labelColor = isLightTheme ? colors.secondaryText : '#94a3b8'; // slate-400 equivalent
  const valueColor = isLightTheme ? colors.primaryText : '#ffffff';
  const progressBgColor = isLightTheme ? colors.inputBackground : '#1e293b'; // slate-800 equivalent
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span style={{ color: labelColor }}>{metric.label}</span>
        <span className="font-semibold" style={{ color: valueColor }}>{metric.value}%</span>
      </div>
      <div 
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: progressBgColor }}
      >
        <div
          className={`h-full bg-gradient-to-r ${metric.gradient} rounded-full transition-all`}
          style={{ width: `${metric.value}%` }}
        />
      </div>
    </div>
  );
}

