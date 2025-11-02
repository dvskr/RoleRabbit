import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { SubscriptionSummary, PaymentMethodSummary } from '../types';

interface CurrentPlanSectionProps {
  subscription: SubscriptionSummary | null;
  formattedPrice: string;
  onShowCancelModal: () => void;
  onUpgradePlan: () => void;
  isLoading: boolean;
  isProcessing: boolean;
  defaultPaymentMethod: PaymentMethodSummary | null;
}

export const CurrentPlanSection: React.FC<CurrentPlanSectionProps> = ({
  subscription,
  formattedPrice,
  onShowCancelModal,
  onUpgradePlan,
  isLoading,
  isProcessing,
  defaultPaymentMethod
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  const planName = subscription?.planName || 'Free Plan';
  const billingInterval = subscription?.billingInterval || 'monthly';
  const features = subscription?.features || [
    'Resume builder core features',
    'Job tracker basics'
  ];

  const statusLabel = subscription?.status === 'cancelling'
    ? 'Cancelling at period end'
    : subscription?.status === 'active'
      ? 'Active'
      : subscription?.status || 'Active';

  const nextRenewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
    : null;

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
        className="p-6 rounded-xl space-y-4"
        style={{
          background: colors.badgeInfoBg,
          border: `1px solid ${colors.badgeInfoBorder}`,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4
              className="text-lg font-bold"
              style={{ color: colors.primaryText }}
            >
              {planName}
            </h4>
            <p style={{ color: colors.secondaryText }}>
              {formattedPrice}{formattedPrice !== 'Free' ? ` / ${billingInterval === 'monthly' ? 'month' : 'year'}` : ''}
            </p>
            <p className="text-sm" style={{ color: colors.secondaryText }}>
              Status: {statusLabel}
            </p>
            {nextRenewalDate && (
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                Next renewal on {nextRenewalDate}
              </p>
            )}
            {subscription?.cancelAtPeriodEnd && (
              <div
                className="mt-3 flex items-center gap-2 text-sm rounded-md px-3 py-2"
                style={{
                  background: colors.badgeWarningBg,
                  border: `1px solid ${colors.badgeWarningBorder}`,
                  color: colors.badgeWarningText
                }}
              >
                <AlertTriangle size={16} />
                Scheduled to cancel at the end of the billing cycle.
              </div>
            )}
            {!defaultPaymentMethod && (
              <div
                className="mt-3 flex items-center gap-2 text-sm rounded-md px-3 py-2"
                style={{
                  background: colors.badgeWarningBg,
                  border: `1px solid ${colors.badgeWarningBorder}`,
                  color: colors.badgeWarningText
                }}
              >
                <AlertTriangle size={16} />
                Add a payment method to unlock premium plans.
              </div>
            )}
          </div>
          <div className="text-right">
            <p
              className="text-2xl font-bold"
              style={{ color: colors.primaryText }}
            >
              {formattedPrice}
            </p>
            <p
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              {billingInterval === 'monthly' ? 'Billed monthly' : 'Billed yearly'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {features.map((feature, index) => (
            <div key={`${feature}-${index}`} className="flex items-center gap-2">
              <CheckCircle size={16} style={{ color: colors.successGreen }} />
              <span style={{ color: colors.primaryText }}>{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={onUpgradePlan}
            disabled={isProcessing || !defaultPaymentMethod}
            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            style={{
              background: (isProcessing || !defaultPaymentMethod) ? colors.inputBackground : colors.primaryBlue,
              color: (isProcessing || !defaultPaymentMethod) ? colors.tertiaryText : 'white',
              cursor: (isProcessing || !defaultPaymentMethod) ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isProcessing && defaultPaymentMethod) {
                e.currentTarget.style.background = colors.primaryBlueHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing && defaultPaymentMethod) {
                e.currentTarget.style.background = colors.primaryBlue;
              }
            }}
          >
            {isProcessing ? 'Updating…' : 'Upgrade Plan'}
            <ArrowRight size={16} />
          </button>
          <button
            onClick={onShowCancelModal}
            disabled={isProcessing || isLoading}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              background: colors.inputBackground,
              color: colors.secondaryText,
              border: `1px solid ${colors.border}`,
              opacity: (isProcessing || isLoading) ? 0.6 : 1,
              cursor: (isProcessing || isLoading) ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isProcessing && !isLoading) {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing && !isLoading) {
                e.currentTarget.style.background = colors.inputBackground;
              }
            }}
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

