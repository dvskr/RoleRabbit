import React from 'react';
import type { PremiumFeature, ThemeColors } from '../types/dashboardFigma';

interface PremiumFeatureCardProps {
  feature: PremiumFeature;
  colors: ThemeColors;
}

export function PremiumFeatureCard({ feature, colors }: PremiumFeatureCardProps) {
  const Icon = feature.icon;
  const isDark = (
    colors.background.includes('#000000') ||
    colors.background === '#000' ||
    colors.background.toLowerCase().includes('black')
  );

  return (
    <div
      className="p-2 sm:p-2.5 rounded-lg transition-all duration-200 border"
      style={{
        background: isDark ? '#111111' : colors.inputBackground,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? '#1a1a1a' : colors.hoverBackground;
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : colors.borderFocused;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark ? '#111111' : colors.inputBackground;
        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border;
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

