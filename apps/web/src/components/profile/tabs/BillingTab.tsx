'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle, X, Loader } from 'lucide-react';
import { logger } from '../../../utils/logger';
import { useTheme } from '../../../contexts/ThemeContext';

export default function BillingTab() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const handleUpdatePayment = () => {
    logger.debug('Updating payment method:', paymentData);
    setTimeout(() => {
      logger.debug('Payment method updated successfully');
      setShowPaymentModal(false);
      setPaymentData({
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
      });
    }, 1000);
  };

  const handleCancelSubscription = () => {
    logger.debug('Cancelling subscription...');
    setTimeout(() => {
      logger.debug('Subscription cancelled');
      setShowCancelModal(false);
    }, 1000);
  };

  const currentPlan = {
    name: 'Professional Plan',
    price: '$29',
    billing: 'monthly',
    features: [
      'Unlimited job applications',
      'Advanced analytics',
      'Priority support',
      'Resume templates'
    ]
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Billing & Subscription
        </h2>
        <p style={{ color: colors.secondaryText }}>Manage your subscription and billing information</p>
      </div>
      
      <div className="space-y-8">
        {/* Current Plan */}
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
                  style={{ color: colors.activeBlueText }}
                >
                  Professional Plan
                </h4>
                <p style={{ color: colors.primaryBlue }}>$29/month • Billed monthly</p>
              </div>
              <div className="text-right">
                <p 
                  className="text-2xl font-bold"
                  style={{ color: colors.activeBlueText }}
                >
                  $29
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.primaryBlue }}
                >
                  per month
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2" style={{ color: colors.primaryText }}>
                <CheckCircle size={16} style={{ color: colors.successGreen }} />
                <span>Unlimited job applications</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: colors.primaryText }}>
                <CheckCircle size={16} style={{ color: colors.successGreen }} />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: colors.primaryText }}>
                <CheckCircle size={16} style={{ color: colors.successGreen }} />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: colors.primaryText }}>
                <CheckCircle size={16} style={{ color: colors.successGreen }} />
                <span>Resume templates</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button 
                onClick={() => logger.debug('Upgrade plan clicked')}
                className="px-4 py-2 rounded-lg transition-colors text-white"
                style={{
                  background: colors.primaryBlue,
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
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
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

        {/* Payment Method */}
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
                style={{
                  background: colors.badgeInfoBg,
                }}
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
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
              }}
            >
              Update
            </button>
          </div>
        </div>

        {/* Billing History */}
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
            <div 
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
                  Professional Plan
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  December 2024
                </p>
              </div>
              <div className="text-right">
                <p 
                  className="font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  $29.00
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
            
            <div 
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
                  Professional Plan
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  November 2024
                </p>
              </div>
              <div className="text-right">
                <p 
                  className="font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  $29.00
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
          </div>
        </div>

        {/* Usage Statistics */}
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
            Usage This Month
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div 
              className="text-center p-4 rounded-xl"
              style={{
                background: colors.badgeInfoBg,
                border: `1px solid ${colors.badgeInfoBorder}`,
              }}
            >
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.badgeInfoText }}
              >
                23
              </p>
              <p 
                className="text-sm"
                style={{ color: colors.badgeInfoText }}
              >
                Applications Sent
              </p>
            </div>
            <div 
              className="text-center p-4 rounded-xl"
              style={{
                background: colors.badgeSuccessBg,
                border: `1px solid ${colors.badgeSuccessBorder}`,
              }}
            >
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.badgeSuccessText }}
              >
                8
              </p>
              <p 
                className="text-sm"
                style={{ color: colors.badgeSuccessText }}
              >
                Interviews
              </p>
            </div>
            <div 
              className="text-center p-4 rounded-xl"
              style={{
                background: colors.badgePurpleBg,
                border: `1px solid ${colors.badgePurpleBorder}`,
              }}
            >
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.badgePurpleText }}
              >
                2
              </p>
              <p 
                className="text-sm"
                style={{ color: colors.badgePurpleText }}
              >
                Offers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Update Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                onClick={() => setShowPaymentModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label="Close payment modal"
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
                    setPaymentData(prev => ({ ...prev, cardNumber: value }));
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
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
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardHolder: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                  }}
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    Month
                  </label>
                  <select
                    value={paymentData.expiryMonth}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.borderFocused;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.border;
                    }}
                    aria-label="Expiry month"
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    Year
                  </label>
                  <select
                    value={paymentData.expiryYear}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, expiryYear: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.borderFocused;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.border;
                    }}
                    aria-label="Expiry year"
                  >
                    <option value="">YY</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={String(year).slice(-2)}>
                          {year}
                        </option>
                      );
                    })}
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
                      setPaymentData(prev => ({ ...prev, cvv: value }));
                    }}
                    placeholder="123"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.borderFocused;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.border;
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
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePayment}
                disabled={!paymentData.cardNumber || !paymentData.cardHolder || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
                style={{
                  background: (!paymentData.cardNumber || !paymentData.cardHolder || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv)
                    ? colors.tertiaryText
                    : colors.primaryBlue,
                  cursor: (!paymentData.cardNumber || !paymentData.cardHolder || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv)
                    ? 'not-allowed'
                    : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!(!paymentData.cardNumber || !paymentData.cardHolder || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv)) {
                    e.currentTarget.style.background = colors.primaryBlueHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!paymentData.cardNumber || !paymentData.cardHolder || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv)) {
                    e.currentTarget.style.background = colors.primaryBlue;
                  }
                }}
              >
                Update Payment Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-2xl p-6 w-full max-w-md"
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
                Cancel Subscription
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label="Close cancel subscription modal"
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
                    style={{
                      background: colors.badgeErrorBg,
                    }}
                  >
                    <CreditCard size={20} style={{ color: colors.errorRed }} />
                  </div>
                  <div>
                    <h4 
                      className="font-semibold mb-1"
                      style={{ color: colors.badgeErrorText }}
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
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
                style={{
                  background: colors.errorRed,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.errorRed;
                }}
              >
                Yes, Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
