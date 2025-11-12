'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Download, Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { logger } from '../../../utils/logger';
import { UserData } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';
import { SecurityCard } from './security/components';

interface BillingTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

type BillingFrequency = 'monthly' | 'annual';

interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  features: string[];
  badge?: string;
  isCurrent?: boolean;
  billingFrequency?: BillingFrequency;
}

export default function BillingTab({
  userData,
  isEditing,
  onUserDataChange
}: BillingTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Load billing data
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // Note: Billing API integration pending - using placeholder data
      // TODO: Integrate with billing API when available
      // API endpoint: GET /api/billing/plan
      setCurrentPlan({
        id: 'free',
        name: 'Free',
        monthlyPrice: 0,
        features: [
          'Basic resume builder',
          '1 portfolio',
          'Track up to 10 jobs',
          'Basic templates',
          'Community access',
          'Ads included'
        ],
        billingFrequency: 'monthly',
        isCurrent: true
      });

      setPaymentMethods([
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true
        }
      ]);

      setBillingHistory([
        {
          id: '1',
          date: '2024-01-15',
          amount: 0,
          status: 'paid',
          description: 'Free Plan - January 2024'
        }
      ]);
    } catch (error) {
      logger.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    // Note: Payment method addition pending API integration
    // TODO: Integrate with payment API when available
    // API endpoint: POST /api/billing/payment-methods
    alert('Payment method addition is coming soon. This feature will be available in a future update.');
    logger.info('Add payment method clicked - feature pending');
  };

  const handleUpgradePlan = (planId: string, frequency: BillingFrequency) => {
    // Note: Plan upgrade pending API integration
    // TODO: Integrate with subscription API when available
    // API endpoint: POST /api/billing/subscription/upgrade
    alert(`Plan upgrade to ${planId} (${frequency}) is coming soon. This feature will be available in a future update.`);
    logger.info(`Upgrade plan clicked: ${planId} (${frequency}) - feature pending`);
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    // Note: Invoice download pending API integration
    // TODO: Integrate with billing API when available
    // API endpoint: GET /api/billing/invoices/:invoiceId/download
    try {
      // Placeholder implementation - will be replaced with actual API call
      alert(`Invoice download for ${invoiceId} is coming soon. This feature will be available in a future update.`);
      logger.info(`Download invoice clicked: ${invoiceId} - feature pending`);
    } catch (error) {
      logger.error('Failed to download invoice:', error);
      alert('Unable to download invoice. Please try again later.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.successGreen;
      case 'pending':
        return colors.warningYellow;
      case 'failed':
        return colors.errorRed;
      default:
        return colors.secondaryText;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={16} style={{ color: colors.successGreen }} />;
      case 'pending':
        return <Clock size={16} style={{ color: colors.warningYellow }} />;
      case 'failed':
        return <AlertCircle size={16} style={{ color: colors.errorRed }} />;
      default:
        return null;
    }
  };

  const roundToCents = (value: number) => Math.round(value * 100) / 100;

  const getPlanPrice = (plan: SubscriptionPlan, frequency: BillingFrequency) => {
    if (plan.monthlyPrice === 0) return 0;

    return frequency === 'monthly'
      ? roundToCents(plan.monthlyPrice)
      : roundToCents(plan.monthlyPrice * 12 * 0.8);
  };

  const getAnnualMonthlyEquivalent = (plan: SubscriptionPlan) => {
    if (plan.monthlyPrice === 0) return 0;
    return roundToCents(plan.monthlyPrice * 0.8);
  };

  const planOptions: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: 0,
      features: [
        'Basic resume builder',
        '1 portfolio',
        'Track up to 10 jobs',
        'Basic templates',
        'Community access',
        'Ads included'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 14.99,
      features: [
        'Everything in Free',
        'No ads',
        'Full AI features',
        'Unlimited resumes',
        'Unlimited portfolios',
        'Unlimited job tracking',
        'Priority support',
        'Advanced analytics'
      ],
      badge: 'Most Popular'
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 19.99,
      features: [
        'Everything in Pro',
        'AI auto-apply',
        'Personal career coach',
        'Custom integrations',
        'Dedicated support',
        'Early access to features',
        'Priority job matching'
      ]
    }
  ];

  const currentPlanFrequency: BillingFrequency = currentPlan?.billingFrequency ?? 'monthly';
  const currentPlanPrice = currentPlan ? getPlanPrice(currentPlan, currentPlanFrequency) : 0;

  return (
    <div className="w-full">
      <div className="space-y-8">
        {/* Current Subscription */}
        <SecurityCard colors={colors} title="Current Subscription">
          {loading ? (
            <div className="text-center py-8" style={{ color: colors.secondaryText }}>
              Loading subscription details...
            </div>
          ) : currentPlan ? (
            <div className="space-y-4">
              <div 
                className="p-6 rounded-xl"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 
                      className="text-xl font-semibold mb-2"
                      style={{ color: colors.primaryText }}
                    >
                      {currentPlan.name} Plan
                    </h3>
                    <p 
                      className="text-2xl font-bold"
                      style={{ color: colors.primaryBlue }}
                    >
                      {currentPlan.monthlyPrice === 0 ? 'Free' : formatCurrency(currentPlanPrice)}
                      {currentPlan.monthlyPrice > 0 && (
                        <span 
                          className="text-sm font-normal ml-2"
                          style={{ color: colors.secondaryText }}
                        >
                          /{currentPlanFrequency === 'annual' ? 'year' : 'month'}
                        </span>
                      )}
                    </p>
                    {currentPlanFrequency === 'annual' && currentPlan.monthlyPrice > 0 && (
                      <p
                        className="text-sm font-medium mt-1"
                        style={{ color: colors.secondaryText }}
                      >
                        Equivalent to {formatCurrency(getAnnualMonthlyEquivalent(currentPlan))}/month (20% savings)
                      </p>
                    )}
                  </div>
                  {currentPlan.monthlyPrice === 0 && (
                    <button
                      onClick={() => handleUpgradePlan('pro', billingFrequency)}
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        background: colors.primaryBlue,
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Upgrade to Pro
                    </button>
                  )}
                  {currentPlan.id === 'pro' && (
                    <button
                      onClick={() => handleUpgradePlan('premium', billingFrequency)}
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        background: colors.primaryBlue,
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Upgrade to Premium
                    </button>
                  )}
                </div>
                <div className="space-y-2 mt-4">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle size={16} style={{ color: colors.successGreen }} />
                      <span style={{ color: colors.secondaryText }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: colors.secondaryText }}>
              No active subscription
            </div>
          )}
        </SecurityCard>

        {/* Available Plans */}
        {currentPlan && (
          <SecurityCard colors={colors} title="Available Plans">
            <div className="flex justify-center mb-6">
              <div
                className="inline-flex rounded-full p-1"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`
                }}
              >
                <button
                  className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: billingFrequency === 'monthly' ? colors.primaryBlue : 'transparent',
                    color: billingFrequency === 'monthly' ? '#ffffff' : colors.secondaryText
                  }}
                  onClick={() => setBillingFrequency('monthly')}
                >
                  Monthly
                </button>
                <button
                  className="px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2"
                  style={{
                    background: billingFrequency === 'annual' ? colors.primaryBlue : 'transparent',
                    color: billingFrequency === 'annual' ? '#ffffff' : colors.secondaryText
                  }}
                  onClick={() => setBillingFrequency('annual')}
                >
                  <span>Annual</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: billingFrequency === 'annual' ? 'rgba(255,255,255,0.2)' : colors.badgeInfoBg,
                      color: billingFrequency === 'annual' ? '#ffffff' : colors.primaryBlue
                    }}
                  >
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planOptions.map((plan) => {
                const planPrice = getPlanPrice(plan, billingFrequency);
                const isAnnual = billingFrequency === 'annual';
                const isCurrentPlan = currentPlan.id === plan.id;

                return (
                <div key={plan.id} className="relative pt-4">
                  {plan.badge && (
                    <span
                      className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full tracking-wide"
                      style={{
                        background: colors.inputBackground,
                        color: colors.primaryBlue,
                        border: `1px solid ${colors.primaryBlue}`
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}
                <div
                      className="p-6 rounded-xl transition-all flex flex-col h-full"
                  style={{
                    background: colors.inputBackground,
                        border: `2px solid ${isCurrentPlan ? colors.borderFocused : colors.border}`,
                        cursor: isCurrentPlan ? 'default' : 'pointer',
                        opacity: isCurrentPlan ? 0.95 : 1
                  }}
                      onMouseEnter={(e) => {
                        if (isCurrentPlan) return;
                        e.currentTarget.style.borderColor = colors.primaryBlue;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        if (isCurrentPlan) return;
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => {
                        if (isCurrentPlan) return;
                        handleUpgradePlan(plan.id, billingFrequency);
                      }}
                >
                  <h4 
                    className="text-lg font-semibold mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    {plan.name}
                  </h4>
                  {isCurrentPlan && (
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full mb-3 inline-flex"
                      style={{
                        background: colors.badgeInfoBg,
                        color: colors.secondaryText
                      }}
                    >
                      Current Plan
                    </span>
                  )}
                  <p 
                    className="text-2xl font-bold mb-4"
                    style={{ color: colors.primaryBlue }}
                  >
                    {plan.monthlyPrice === 0 ? 'Free' : formatCurrency(planPrice)}
                    {plan.monthlyPrice > 0 && (
                      <span 
                        className="text-sm font-normal ml-1"
                        style={{ color: colors.secondaryText }}
                      >
                        {isAnnual ? '/year' : '/month'}
                      </span>
                    )}
                  </p>
                  {isAnnual && plan.monthlyPrice > 0 && (
                    <p
                      className="text-xs font-medium uppercase tracking-wide mb-4"
                      style={{ color: colors.secondaryText }}
                    >
                      Equivalent to {formatCurrency(getAnnualMonthlyEquivalent(plan))}/month
                    </p>
                  )}
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-2 text-sm"
                        style={{ color: colors.secondaryText }}
                      >
                        <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: colors.successGreen }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="w-full py-2 rounded-lg font-medium transition-all mt-auto"
                    style={{
                          background: isCurrentPlan ? colors.inputBackground : colors.primaryBlue,
                          color: isCurrentPlan ? colors.secondaryText : '#ffffff',
                          border: isCurrentPlan ? `1px solid ${colors.border}` : 'none',
                          cursor: isCurrentPlan ? 'default' : 'pointer'
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (isCurrentPlan) {
                        event.preventDefault();
                        return;
                      }

                      handleUpgradePlan(plan.id, billingFrequency);
                    }}
                    onMouseEnter={(e) => {
                          if (isCurrentPlan) return;
                          e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                          if (isCurrentPlan) return;
                          e.currentTarget.style.opacity = '1';
                    }}
                        disabled={isCurrentPlan}
                  >
                        {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
                </div>
                );
              })}
            </div>
          </SecurityCard>
        )}

        {/* Payment Methods */}
        <SecurityCard colors={colors} title="Payment Methods">
          <div className="space-y-4">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-5 rounded-xl transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${method.isDefault ? colors.borderFocused : colors.border}`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{
                        background: colors.badgeInfoBg
                      }}
                    >
                      <CreditCard size={20} style={{ color: colors.primaryBlue }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p 
                          className="font-semibold"
                          style={{ color: colors.primaryText }}
                        >
                          {method.brand || 'Card'} •••• {method.last4}
                        </p>
                        {method.isDefault && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: colors.badgeInfoBg,
                              color: colors.primaryBlue
                            }}
                          >
                            Default
                          </span>
                        )}
                      </div>
                      {method.expiryMonth && method.expiryYear && (
                        <p 
                          className="text-sm mt-1"
                          style={{ color: colors.secondaryText }}
                        >
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      )}
                    </div>
                  </div>
                  {!method.isDefault && (
                    <button
                      className="text-sm px-3 py-1 rounded-lg transition-all"
                      style={{
                        color: colors.primaryBlue,
                        background: 'transparent',
                        border: `1px solid ${colors.border}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.badgeInfoBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div 
                className="text-center py-8"
                style={{ color: colors.secondaryText }}
              >
                No payment methods added
              </div>
            )}
            <button
              onClick={handleAddPaymentMethod}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl transition-all"
              style={{
                background: colors.inputBackground,
                border: `2px dashed ${colors.border}`,
                color: colors.primaryBlue
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primaryBlue;
                e.currentTarget.style.background = colors.badgeInfoBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.background = colors.inputBackground;
              }}
            >
              <Plus size={20} />
              <span className="font-medium">Add Payment Method</span>
            </button>
          </div>
        </SecurityCard>

        {/* Billing History */}
        <SecurityCard colors={colors} title="Billing History">
          {billingHistory.length > 0 ? (
            <div className="space-y-3">
              {billingHistory.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-5 rounded-xl transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div 
                      className="p-2 rounded-lg"
                      style={{
                        background: colors.badgeInfoBg
                      }}
                    >
                      <Calendar size={18} style={{ color: colors.primaryBlue }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p 
                          className="font-semibold"
                          style={{ color: colors.primaryText }}
                        >
                          {invoice.description}
                        </p>
                        {getStatusIcon(invoice.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span style={{ color: colors.secondaryText }}>
                          {formatDate(invoice.date)}
                        </span>
                        <span 
                          className="font-semibold"
                          style={{ color: getStatusColor(invoice.status) }}
                        >
                          {formatCurrency(invoice.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {invoice.invoiceUrl && (
                    <button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                      style={{
                        color: colors.primaryBlue,
                        background: 'transparent',
                        border: `1px solid ${colors.border}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.badgeInfoBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Download size={16} />
                      <span className="text-sm">Download</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-8"
              style={{ color: colors.secondaryText }}
            >
              No billing history available
            </div>
          )}
        </SecurityCard>
      </div>
    </div>
  );
}

