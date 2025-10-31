import React from 'react';
import type { Metric, ThemeColors } from '../types/dashboardFigma';

interface MetricCardProps {
  metric: Metric;
  colors: ThemeColors;
}

export function MetricCard({ metric, colors }: MetricCardProps) {
  const Icon = metric.icon;

  return (
    <div
      className="group relative rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.borderFocused;
        e.currentTarget.style.boxShadow = `0 10px 25px ${colors.borderFocused}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
        <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg`}>
          <Icon size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1" style={{ color: colors.primaryText }}>
          {metric.value}
        </p>
        <p className="text-xs sm:text-sm" style={{ color: colors.secondaryText }}>
          {metric.label}
        </p>
      </div>
    </div>
  );
}

