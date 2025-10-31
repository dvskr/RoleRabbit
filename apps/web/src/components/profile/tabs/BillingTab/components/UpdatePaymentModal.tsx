import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { PaymentData } from '../types';
import { MONTHS, getYears } from '../constants';

interface UpdatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentData;
  onUpdatePaymentData: (field: keyof PaymentData, value: string) => void;
  onSubmit: () => void;
  isValid: boolean;
}

export const UpdatePaymentModal: React.FC<UpdatePaymentModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  onUpdatePaymentData,
  onSubmit,
  isValid
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!isOpen || !colors) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
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
            Update Payment Method
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
            aria-label="Close payment modal"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.primaryText }}
            >
              Card Number
            </label>
            <input
              type="text"
              value={paymentData.cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                onUpdatePaymentData('cardNumber', value);
              }}
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 rounded-lg transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
          </div>

          {/* Card Holder */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.primaryText }}
            >
              Card Holder Name
            </label>
            <input
              type="text"
              value={paymentData.cardHolder}
              onChange={(e) => onUpdatePaymentData('cardHolder', e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 rounded-lg transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label 
                htmlFor="expiry-month"
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                Month
              </label>
              <select
                id="expiry-month"
                value={paymentData.expiryMonth}
                onChange={(e) => onUpdatePaymentData('expiryMonth', e.target.value)}
                className="w-full px-3 py-2 rounded-lg transition-all"
                aria-label="Expiry month"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <option value="" style={{ background: colors.background, color: colors.secondaryText }}>MM</option>
                {MONTHS.map((month) => (
                  <option key={month} value={month} style={{ background: colors.background, color: colors.secondaryText }}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label 
                htmlFor="expiry-year"
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                Year
              </label>
              <select
                id="expiry-year"
                value={paymentData.expiryYear}
                onChange={(e) => onUpdatePaymentData('expiryYear', e.target.value)}
                className="w-full px-3 py-2 rounded-lg transition-all"
                aria-label="Expiry year"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <option value="" style={{ background: colors.background, color: colors.secondaryText }}>YY</option>
                {getYears().map((year) => (
                  <option key={year} value={String(year).slice(-2)} style={{ background: colors.background, color: colors.secondaryText }}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                CVV
              </label>
              <input
                type="text"
                value={paymentData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  onUpdatePaymentData('cvv', value);
                }}
                placeholder="123"
                className="w-full px-3 py-2 rounded-lg transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              />
            </div>
          </div>

          <div 
            className="rounded-lg p-3"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
            }}
          >
            <p 
              className="text-sm"
              style={{ color: colors.badgeInfoText }}
            >
              Your payment information is encrypted and secure. We never store your full card number.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
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
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!isValid}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: !isValid ? colors.inputBackground : colors.primaryBlue,
              color: !isValid ? colors.tertiaryText : 'white',
              opacity: !isValid ? 0.5 : 1,
              cursor: !isValid ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (isValid) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (isValid) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            Update Payment Method
          </button>
        </div>
      </div>
    </div>
  );
};

