import React from 'react';
import { CreditCard } from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';

interface PaymentMethodSectionProps {
  onShowPaymentModal: () => void;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  onShowPaymentModal
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
        Payment Method
      </h3>
      <div 
        className="flex items-center justify-between p-4 rounded-xl"
        style={{
          background: colors.inputBackground,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="p-2 rounded-lg"
            style={{ background: colors.badgeInfoBg }}
          >
            <CreditCard size={20} style={{ color: colors.primaryBlue }} />
          </div>
          <div>
            <p 
              className="font-semibold"
              style={{ color: colors.primaryText }}
            >
              Visa ending in 4242
            </p>
            <p 
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              Expires 12/25
            </p>
          </div>
        </div>
        <button 
          onClick={onShowPaymentModal}
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
          Update
        </button>
      </div>
    </div>
  );
};

