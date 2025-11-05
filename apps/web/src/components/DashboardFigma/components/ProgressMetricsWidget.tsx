import React from 'react';
import type { ProgressMetric } from '../types/dashboardFigma';
import { ProgressMetricItem } from './ProgressMetricItem';
import { useTheme } from '../../../contexts/ThemeContext';

interface ProgressMetricsWidgetProps {
  metrics: ProgressMetric[];
}

export function ProgressMetricsWidget({ metrics }: ProgressMetricsWidgetProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const isLightTheme = theme.mode === 'light';
  
  // Theme-aware background and border
  const widgetBackground = isLightTheme 
    ? colors.cardBackground 
    : 'rgba(255, 255, 255, 0.05)';
  const widgetBorder = isLightTheme
    ? `1px solid ${colors.border}`
    : '1px solid rgba(255, 255, 255, 0.1)';
  const headingColor = isLightTheme ? colors.primaryText : '#ffffff';
  
  return (
    <div
      className="rounded-xl sm:rounded-2xl pt-4 px-4 pb-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-green-500/10"
      style={{
        background: widgetBackground,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: widgetBorder,
        boxShadow: isLightTheme 
          ? '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)'
          : '0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      <h2 className="text-base font-semibold mb-3" style={{ color: headingColor }}>Progress</h2>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <ProgressMetricItem 
            key={index} 
            metric={metric} 
            isLast={index === metrics.length - 1} 
          />
        ))}
      </div>
    </div>
  );
}

