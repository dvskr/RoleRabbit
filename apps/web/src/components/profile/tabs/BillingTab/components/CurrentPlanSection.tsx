import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { logger } from '../../../../../utils/logger';
import { CurrentPlan as CurrentPlanType } from '../types';

interface CurrentPlanSectionProps {
  currentPlan: CurrentPlanType;
  onShowCancelModal: () => void;
}

export const CurrentPlanSection: React.FC<CurrentPlanSectionProps> = ({
  currentPlan,
  onShowCancelModal
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  return (
    <div 
      className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      <h3 
        className="text-xl font-semibold mb-6"
        style={{ color: colors.primaryText }}
      >
        Current Plan
      </h3>
      <div 
        className="p-6 rounded-xl"
        style={{
          background: colors.badgeInfoBg,
          border: `1px solid ${colors.badgeInfoBorder}`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 
              className="text-lg font-bold"
              style={{ color: colors.primaryText }}
            >
              {currentPlan.name}
            </h4>
            <p 
              style={{ color: colors.secondaryText }}
            >
              {currentPlan.price}/{currentPlan.billing === 'monthly' ? 'month' : 'year'} • Billed {currentPlan.billing}
            </p>
          </div>
          <div className="text-right">
            <p 
              className="text-2xl font-bold"
              style={{ color: colors.primaryText }}
            >
              {currentPlan.price}
            </p>
            <p 
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              per {currentPlan.billing === 'monthly' ? 'month' : 'year'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle size={16} style={{ color: colors.successGreen }} />
              <span style={{ color: colors.primaryText }}>{feature}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button 
            onClick={() => logger.debug('Upgrade plan clicked')}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primaryBlueHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primaryBlue;
            }}
          >
            Upgrade Plan
          </button>
          <button 
            onClick={onShowCancelModal}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              background: colors.inputBackground,
              color: colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
            }}
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

