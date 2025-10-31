import React from 'react';
import type { ProgressMetric } from '../types/dashboardFigma';

interface ProgressMetricItemProps {
  metric: ProgressMetric;
}

export function ProgressMetricItem({ metric }: ProgressMetricItemProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-slate-400">{metric.label}</span>
        <span className="text-white font-semibold">{metric.value}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${metric.gradient} rounded-full transition-all`}
          style={{ width: `${metric.value}%` }}
        />
      </div>
    </div>
  );
}

