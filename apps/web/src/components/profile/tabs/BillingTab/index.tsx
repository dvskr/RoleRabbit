'use client';

import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useBillingState } from './hooks';
import { MOCK_CURRENT_PLAN, MOCK_BILLING_HISTORY } from './constants';
import {
  CurrentPlanSection,
  PaymentMethodSection,
  BillingHistorySection,
  UsageStatsSection,
  UpdatePaymentModal,
  CancelSubscriptionModal
} from './components';
import { UsageStatistic } from './types';

export default function BillingTab() {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  const {
    showPaymentModal,
    setShowPaymentModal,
    showCancelModal,
    setShowCancelModal,
    paymentData,
    updatePaymentData,
    handleUpdatePayment,
    handleCancelSubscription,
    isPaymentFormValid
  } = useBillingState();

  const usageStats: UsageStatistic[] = [
    {
      label: 'Applications Sent',
      value: 23,
      bgColor: colors.badgeInfoBg,
      borderColor: colors.badgeInfoBorder
    },
    {
      label: 'Interviews',
      value: 8,
      bgColor: colors.badgeSuccessBg,
      borderColor: colors.badgeSuccessBorder
    },
    {
      label: 'Offers',
      value: 2,
      bgColor: colors.badgePurpleBg,
      borderColor: colors.badgePurpleBorder
    }
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Billing & Subscription
        </h2>
        <p 
          style={{ color: colors.secondaryText }}
        >
          Manage your subscription and billing information
        </p>
      </div>
      
      <div className="space-y-8">
        <CurrentPlanSection 
          currentPlan={MOCK_CURRENT_PLAN}
          onShowCancelModal={() => setShowCancelModal(true)}
        />

        <PaymentMethodSection 
          onShowPaymentModal={() => setShowPaymentModal(true)}
        />

        <BillingHistorySection 
          historyItems={MOCK_BILLING_HISTORY}
        />

        <UsageStatsSection 
          stats={usageStats}
        />
      </div>

      <UpdatePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentData={paymentData}
        onUpdatePaymentData={updatePaymentData}
        onSubmit={handleUpdatePayment}
        isValid={isPaymentFormValid}
      />

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
      />
    </div>
  );
}

