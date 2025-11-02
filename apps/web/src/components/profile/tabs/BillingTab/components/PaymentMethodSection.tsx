import React from 'react';
import { CreditCard, Star, Trash2 } from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { PaymentMethodSummary } from '../types';

interface PaymentMethodSectionProps {
  paymentMethods: PaymentMethodSummary[];
  onShowPaymentModal: () => void;
  onRemovePaymentMethod: (paymentMethodId: string) => void;
  isLoading: boolean;
}

const formatExpiry = (month?: number | null, year?: number | null) => {
  if (!month || !year) return 'No expiry';
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
};

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  paymentMethods,
  onShowPaymentModal,
  onRemovePaymentMethod,
  isLoading
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
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-xl font-semibold"
          style={{ color: colors.primaryText }}
        >
          Payment Methods
        </h3>
        <button
          onClick={onShowPaymentModal}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            background: colors.primaryBlue,
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.primaryBlueHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.primaryBlue;
          }}
        >
          Add Payment Method
        </button>
      </div>

      {isLoading ? (
        <p style={{ color: colors.secondaryText }}>Loading payment methods…</p>
      ) : paymentMethods.length === 0 ? (
        <p style={{ color: colors.secondaryText }}>
          You have not added any payment methods yet.
        </p>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
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
                    {method.brand || method.type} ending in {method.last4 || '----'}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: colors.secondaryText }}
                  >
                    Expires {formatExpiry(method.expiryMonth, method.expiryYear)}
                  </p>
                  <p className="text-xs" style={{ color: colors.secondaryText }}>
                    Added on {new Date(method.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {method.isDefault && (
                  <span
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: colors.successGreen }}
                  >
                    <Star size={14} /> Default
                  </span>
                )}
                {!method.isDefault && (
                  <button
                    onClick={() => onRemovePaymentMethod(method.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      border: `1px solid ${colors.border}`,
                      color: colors.errorRed
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.hoverBackground;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.cardBackground;
                    }}
                    aria-label="Remove payment method"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

