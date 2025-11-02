'use client';

import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useBillingState } from './hooks';
import {
  CurrentPlanSection,
  PaymentMethodSection,
  BillingHistorySection,
  UsageStatsSection,
  UpdatePaymentModal,
  CancelSubscriptionModal
} from './components';
import { UsageStatistic } from './types';

const withColors = (stats: UsageStatistic[], colors: any): UsageStatistic[] => {
  const bgPalette = [colors.badgeInfoBg, colors.badgeSuccessBg, colors.badgePurpleBg, colors.badgeWarningBg];
  const borderPalette = [colors.badgeInfoBorder, colors.badgeSuccessBorder, colors.badgePurpleBorder, colors.badgeWarningBorder];

  return stats.map((stat, index) => ({
    ...stat,
    bgColor: stat.bgColor || bgPalette[index % bgPalette.length],
    borderColor: stat.borderColor || borderPalette[index % borderPalette.length]
  }));
};

const formatPrice = (price: number, currency: string) => {
  if (price === 0) {
    return 'Free';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price);
};

export default function BillingTab() {
  const { theme } = useTheme();
  const colors = theme?.colors;

  const {
    loading,
    error,
    subscription,
    usageStats,
    invoices,
    paymentMethods,
    defaultPaymentMethod,
    showPaymentModal,
    setShowPaymentModal,
    showCancelModal,
    setShowCancelModal,
    paymentData,
    updatePaymentData,
    handleUpdatePayment,
    paymentModalError,
    isPaymentSubmitting,
    isPaymentFormValid,
    handleCancelSubscription,
    handleUpgradePlan,
    handleRemovePaymentMethod,
    isCancelling,
    isUpgrading
  } = useBillingState();

  if (!colors) return null;

  const usageStatsWithColors = withColors(usageStats, colors);
  const planPriceDisplay = subscription ? formatPrice(subscription.price, subscription.currency) : 'Free';

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

      {error && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{
            background: colors.badgeErrorBg,
            border: `1px solid ${colors.badgeErrorBorder}`,
            color: colors.badgeErrorText
          }}
        >
          {error}
        </div>
      )}

      <div className="space-y-8">
        <CurrentPlanSection
          subscription={subscription}
          formattedPrice={planPriceDisplay}
          onUpgradePlan={() => handleUpgradePlan('pro')}
          onShowCancelModal={() => setShowCancelModal(true)}
          isLoading={loading}
          isProcessing={isUpgrading}
          defaultPaymentMethod={defaultPaymentMethod}
        />

        <PaymentMethodSection
          paymentMethods={paymentMethods}
          onShowPaymentModal={() => setShowPaymentModal(true)}
          onRemovePaymentMethod={handleRemovePaymentMethod}
          isLoading={loading}
        />

        <BillingHistorySection
          historyItems={invoices}
          isLoading={loading}
        />

        <UsageStatsSection
          stats={usageStatsWithColors}
          isLoading={loading}
        />
      </div>

      <UpdatePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentData={paymentData}
        onUpdatePaymentData={updatePaymentData}
        onSubmit={handleUpdatePayment}
        isValid={isPaymentFormValid}
        isSubmitting={isPaymentSubmitting}
        errorMessage={paymentModalError}
      />

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        isSubmitting={isCancelling}
        planName={subscription?.planName || 'Current Plan'}
        renewalDate={subscription?.currentPeriodEnd || null}
        cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd || false}
      />
    </div>
  );
}


