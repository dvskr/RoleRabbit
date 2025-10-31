import React from 'react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { BillingHistoryItem } from '../types';

interface BillingHistorySectionProps {
  historyItems: BillingHistoryItem[];
}

export const BillingHistorySection: React.FC<BillingHistorySectionProps> = ({
  historyItems
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
        Billing History
      </h3>
      <div className="space-y-4">
        {historyItems.map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <p 
                className="font-semibold"
                style={{ color: colors.primaryText }}
              >
                {item.plan}
              </p>
              <p 
                className="text-sm"
                style={{ color: colors.secondaryText }}
              >
                {item.date}
              </p>
            </div>
            <div className="text-right">
              <p 
                className="font-semibold"
                style={{ color: colors.primaryText }}
              >
                {item.amount}
              </p>
              <button 
                className="text-sm transition-colors"
                style={{ color: colors.primaryBlue }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryBlueHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.primaryBlue;
                }}
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

