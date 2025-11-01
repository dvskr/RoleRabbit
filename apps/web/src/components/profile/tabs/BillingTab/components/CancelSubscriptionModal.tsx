import React from 'react';
import { CreditCard, X } from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!isOpen || !colors) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
      style={{ 
        background: 'rgba(0, 0, 0, 0.75)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="rounded-2xl p-6 w-full max-w-md"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          position: 'relative',
          zIndex: 1,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 
            className="text-xl font-semibold"
            style={{ color: colors.primaryText }}
          >
            Cancel Subscription
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close cancel subscription modal"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div 
            className="rounded-lg p-4"
            style={{
              background: colors.badgeErrorBg,
              border: `1px solid ${colors.badgeErrorBorder}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ background: colors.badgeErrorBg }}
              >
                <CreditCard size={20} style={{ color: colors.errorRed }} />
              </div>
              <div>
                <h4 
                  className="font-semibold mb-1"
                  style={{ color: colors.errorRed }}
                >
                  Important Information
                </h4>
                <ul 
                  className="text-sm space-y-1"
                  style={{ color: colors.badgeErrorText }}
                >
                  <li>• Your subscription will remain active until the end of your current billing cycle</li>
                  <li>• You will lose access to premium features after cancellation</li>
                  <li>• You can reactivate anytime before the end of your billing period</li>
                </ul>
              </div>
            </div>
          </div>

          <div 
            className="rounded-lg p-3"
            style={{
              background: colors.badgeWarningBg,
              border: `1px solid ${colors.badgeWarningBorder}`,
            }}
          >
            <p 
              className="text-sm"
              style={{ color: colors.badgeWarningText }}
            >
              <strong>Current Plan:</strong> Professional Plan ($29/month)<br />
              <strong>Access until:</strong> January 31, 2025
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
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
            Keep Subscription
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: colors.errorRed,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Yes, Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

