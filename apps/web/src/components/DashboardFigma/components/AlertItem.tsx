import React from 'react';
import type { Alert } from '../types/dashboardFigma';

interface AlertItemProps {
  alert: Alert;
}

export function AlertItem({ alert }: AlertItemProps) {
  const Icon = alert.icon;

  return (
    <div className="flex items-start gap-1.5 p-1 rounded hover:bg-white/5 transition-colors">
      <div className={`p-0.5 rounded-full flex-shrink-0 ${
        alert.priority === 'urgent' ? 'bg-red-500/20' : 'bg-amber-500/20'
      }`}>
        <Icon 
          size={12} 
          className={`${
            alert.priority === 'urgent' ? 'text-red-400' : 'text-amber-400'
          }`} 
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{alert.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-slate-500">{alert.time}</span>
        </div>
      </div>
    </div>
  );
}

