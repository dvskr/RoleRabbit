import React from 'react';
import type { Alert, ThemeColors } from '../types/dashboardFigma';
import { AlertItem } from './AlertItem';
import { useTheme } from '../../../contexts/ThemeContext';

interface IntelligentAlertsWidgetProps {
  alerts: Alert[];
  urgentCount: number;
}

export function IntelligentAlertsWidget({ alerts, urgentCount }: IntelligentAlertsWidgetProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const isLightTheme = theme.mode === 'light';
  const isDark = (
    colors.background.includes('#000000') ||
    colors.background === '#000' ||
    colors.background.toLowerCase().includes('black')
  );
  
  const widgetBackground = isLightTheme 
    ? colors.cardBackground 
    : (isDark ? '#000000' : 'rgba(255, 255, 255, 0.05)');
  const widgetBorder = isLightTheme
    ? `1px solid ${colors.border}`
    : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)');
  const headingColor = isLightTheme ? colors.primaryText : '#ffffff';
  
  return (
    <div
      className="rounded-xl sm:rounded-2xl p-2 sm:p-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-red-500/10 flex flex-col overflow-visible"
      style={{
        background: widgetBackground,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: widgetBorder,
        boxShadow: isLightTheme 
          ? '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)'
          : (isDark ? '0 2px 8px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.3)'),
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-sm font-semibold" style={{ color: headingColor }}>Alerts</h2>
        {urgentCount > 0 && (
          <span 
            className="px-1.5 py-0.5 text-white text-xs font-bold rounded-full"
            style={{ background: colors.errorRed }}
          >
            {urgentCount}
          </span>
        )}
      </div>

      <div className="space-y-1">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} colors={colors} />
        ))}
      </div>
    </div>
  );
}

