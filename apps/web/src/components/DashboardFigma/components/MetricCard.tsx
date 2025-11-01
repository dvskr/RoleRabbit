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
      className="group relative rounded-lg p-3 transition-all duration-200 hover:shadow-lg cursor-pointer"
      style={{
        background: colors.cardBackground,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.borderFocused;
        e.currentTarget.style.boxShadow = `0 4px 12px ${colors.borderFocused}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient} shadow-md flex-shrink-0`}>
          <Icon size={16} className="text-white" />
        </div>
        
        {/* Value and Label */}
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold mb-0.5" style={{ color: colors.primaryText }}>
            {metric.value}
          </p>
          <p className="text-xs font-medium" style={{ color: colors.secondaryText }}>
            {metric.label}
          </p>
        </div>
      </div>
    </div>
  );
}

