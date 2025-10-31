import React from 'react';
import type { Alert } from '../types/dashboardFigma';
import { AlertItem } from './AlertItem';

interface IntelligentAlertsWidgetProps {
  alerts: Alert[];
  urgentCount: number;
}

export function IntelligentAlertsWidget({ alerts, urgentCount }: IntelligentAlertsWidgetProps) {
  return (
    <div
      className="rounded-xl sm:rounded-2xl p-2 sm:p-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-red-500/10 flex flex-col overflow-visible"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-sm font-semibold text-white">Alerts</h2>
        {urgentCount > 0 && (
          <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
            {urgentCount}
          </span>
        )}
      </div>

      <div className="space-y-1">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}

