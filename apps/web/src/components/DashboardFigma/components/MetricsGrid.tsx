import React from 'react';
import type { Metric, ThemeColors } from '../types/dashboardFigma';
import { MetricCard } from './MetricCard';

interface MetricsGridProps {
  metrics: Metric[];
  colors: ThemeColors;
}

export function MetricsGrid({ metrics, colors }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} colors={colors} />
      ))}
    </div>
  );
}

