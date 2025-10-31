import React from 'react';
import { Crown } from 'lucide-react';
import type { ThemeColors } from '../types/dashboardFigma';
import { PREMIUM_FEATURES } from '../constants/dashboardFigma';
import { PremiumFeatureCard } from './PremiumFeatureCard';

interface PremiumFeaturesWidgetProps {
  colors: ThemeColors;
}

export function PremiumFeaturesWidget({ colors }: PremiumFeaturesWidgetProps) {
  return (
    <div
      className="rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl flex flex-col overflow-hidden mb-3 sm:mb-4"
      style={{
        background: colors.badgeWarningBg,
        border: `1px solid ${colors.badgeWarningBorder}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <Crown size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold" style={{ color: colors.primaryText }}>
              Premium Features
            </h2>
            <p className="text-xs hidden sm:block" style={{ color: colors.secondaryText }}>
              Unlock your full potential
            </p>
          </div>
        </div>
        <span 
          className="px-2 py-0.5 text-xs font-bold rounded-full border"
          style={{
            background: colors.badgeWarningBg,
            color: colors.badgeWarningText,
            borderColor: colors.badgeWarningBorder,
          }}
        >
          PRO
        </span>
      </div>
      
      {/* Premium Features Grid - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {PREMIUM_FEATURES.map((feature, index) => (
          <PremiumFeatureCard key={index} feature={feature} colors={colors} />
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-amber-500/20">
        <button className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs sm:text-sm rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-amber-500/20">
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
}

