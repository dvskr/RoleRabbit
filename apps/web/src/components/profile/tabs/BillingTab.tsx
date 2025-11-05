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

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isCurrent: boolean;
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

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Load billing data
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // Mock data for now
      setCurrentPlan({
        id: 'free',
        name: 'Free Plan',
        price: 0,
        interval: 'month',
        features: [
          'Ads included',
          'Limited AI features',
          'Basic resume templates',
          'Basic profile features'
        ],
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
    // TODO: Implement payment method addition
    logger.info('Add payment method clicked');
  };

  const handleUpgradePlan = (planId: string) => {
    // TODO: Implement plan upgrade
    logger.info('Upgrade plan clicked:', planId);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement invoice download
    logger.info('Download invoice clicked:', invoiceId);
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

  const availablePlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        'Ads included',
        'Limited AI features',
        'Basic resume templates',
        'Basic profile features'
      ],
      isCurrent: currentPlan?.id === 'free'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 14.99,
      interval: 'month',
      features: [
        'No ads',
        'Full AI features',
        'Unlimited resume templates',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'All features except AI auto apply'
      ],
      isCurrent: currentPlan?.id === 'pro'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      interval: 'month',
      features: [
        'All Pro features',
        'AI auto apply',
        'Unlimited everything',
        'Dedicated support',
        'Early access to new features',
        'Custom integrations'
      ],
      isCurrent: currentPlan?.id === 'premium'
    }
  ];

  return (
    <div className="max-w-4xl">
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
                      {currentPlan.price === 0 ? 'Free' : formatCurrency(currentPlan.price)}
                      {currentPlan.price > 0 && (
                        <span 
                          className="text-sm font-normal ml-2"
                          style={{ color: colors.secondaryText }}
                        >
                          /{currentPlan.interval}
                        </span>
                      )}
                    </p>
                  </div>
                  {currentPlan.price === 0 && (
                    <button
                      onClick={() => handleUpgradePlan('pro')}
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
                      onClick={() => handleUpgradePlan('premium')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePlans.filter(plan => plan.id !== currentPlan.id).map((plan) => (
                <div
                  key={plan.id}
                  className="p-6 rounded-xl transition-all cursor-pointer"
                  style={{
                    background: colors.inputBackground,
                    border: `2px solid ${colors.border}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primaryBlue;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => handleUpgradePlan(plan.id)}
                >
                  <h4 
                    className="text-lg font-semibold mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    {plan.name}
                  </h4>
                  <p 
                    className="text-2xl font-bold mb-4"
                    style={{ color: colors.primaryBlue }}
                  >
                    {formatCurrency(plan.price)}
                    <span 
                      className="text-sm font-normal ml-1"
                      style={{ color: colors.secondaryText }}
                    >
                      /{plan.interval}
                    </span>
                  </p>
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
                    className="w-full py-2 rounded-lg font-medium transition-all"
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
                    Upgrade to {plan.name}
                  </button>
                </div>
              ))}
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

