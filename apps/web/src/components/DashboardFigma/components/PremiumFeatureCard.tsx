import React from 'react';
import type { PremiumFeature, ThemeColors } from '../types/dashboardFigma';

interface PremiumFeatureCardProps {
  feature: PremiumFeature;
  colors: ThemeColors;
}

export function PremiumFeatureCard({ feature, colors }: PremiumFeatureCardProps) {
  const Icon = feature.icon;

  return (
    <div
      className="p-2 sm:p-2.5 rounded-lg transition-all duration-200 border"
      style={{
        background: colors.inputBackground,
        borderColor: colors.border,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.hoverBackground;
        e.currentTarget.style.borderColor = colors.borderFocused;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.inputBackground;
        e.currentTarget.style.borderColor = colors.border;
      }}
    >
      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${feature.gradient} w-fit mb-1.5`}>
        <Icon size={14} className="text-white" />
      </div>
      <h3 className="text-xs sm:text-sm font-semibold mb-0.5" style={{ color: colors.primaryText }}>
        {feature.title}
      </h3>
      <p className="text-xs leading-tight line-clamp-2" style={{ color: colors.secondaryText }}>
        {feature.description}
      </p>
    </div>
  );
}

