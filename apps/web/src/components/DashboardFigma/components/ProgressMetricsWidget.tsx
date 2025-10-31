import React from 'react';
import type { ProgressMetric } from '../types/dashboardFigma';
import { ProgressMetricItem } from './ProgressMetricItem';

interface ProgressMetricsWidgetProps {
  metrics: ProgressMetric[];
}

export function ProgressMetricsWidget({ metrics }: ProgressMetricsWidgetProps) {
  return (
    <div
      className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-green-500/10"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <h2 className="text-base font-semibold text-white mb-3">Progress</h2>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <ProgressMetricItem key={index} metric={metric} />
        ))}
      </div>
    </div>
  );
}

