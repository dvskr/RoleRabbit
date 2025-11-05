import React from 'react';
import type { QuickAction, ThemeColors } from '../types/dashboardFigma';
import { QuickActionButton } from './QuickActionButton';

interface QuickActionsWidgetProps {
  quickActions: QuickAction[];
  colors: ThemeColors;
}

export function QuickActionsWidget({ quickActions, colors }: QuickActionsWidgetProps) {
  const isDark = (
    colors.background.includes('#000000') ||
    colors.background === '#000' ||
    colors.background.toLowerCase().includes('black')
  );

  return (
    <div
      className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl flex flex-col overflow-hidden"
      style={{
        background: isDark ? '#000000' : colors.cardBackground,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid ${colors.border}`,
        boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: colors.primaryText }}>
        Quick Actions
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3">
        {quickActions.map((action) => (
          <QuickActionButton key={action.id} action={action} colors={colors} />
        ))}
      </div>
    </div>
  );
}

