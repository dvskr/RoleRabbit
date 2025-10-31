import React from 'react';
import type { QuickAction, ThemeColors } from '../types/dashboardFigma';
import { QuickActionButton } from './QuickActionButton';

interface QuickActionsWidgetProps {
  quickActions: QuickAction[];
  colors: ThemeColors;
}

export function QuickActionsWidget({ quickActions, colors }: QuickActionsWidgetProps) {
  return (
    <div
      className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl flex flex-col overflow-hidden"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
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

