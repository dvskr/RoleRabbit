import { useCallback, useEffect, useState } from 'react';
import apiService from '../../../../../services/apiService';
import { logger } from '../../../../../utils/logger';
import {
  InvoiceItem,
  PaymentData,
  PaymentMethodSummary,
  SubscriptionSummary,
  UsageStatistic
} from '../types';

const initialPaymentData: PaymentData = {
  cardNumber: '',
  cardHolder: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  setAsDefault: true
};

export function useBillingState() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStatistic[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [invoicePagination, setInvoicePagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [paymentData, setPaymentData] = useState<PaymentData>(initialPaymentData);
  const [paymentModalError, setPaymentModalError] = useState<string | null>(null);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (!showPaymentModal) {
      setPaymentModalError(null);
      setPaymentData(initialPaymentData);
    }
  }, [showPaymentModal]);

  const fetchSubscription = useCallback(async () => {
    const response = await apiService.getBillingSubscription();
    setSubscription(response.subscription);
    const usage: UsageStatistic[] = (response.usage || []).map((item: any) => ({
      label: item.label,
      value: item.value
    }));
    setUsageStats(usage);
  }, []);

  const fetchInvoices = useCallback(async (page = 1, pageSize = 10) => {
    const response = await apiService.getBillingInvoices(page, pageSize);
    const formatted: InvoiceItem[] = (response.invoices || []).map((invoice: any) => ({
      id: invoice.id,
      planId: invoice.planId || invoice.plan,
      planName: invoice.planName,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      billingInterval: invoice.billingInterval,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      invoiceUrl: invoice.invoiceUrl
    }));
    setInvoices(formatted);
    if (response.pagination) {
      setInvoicePagination(response.pagination);
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    const response = await apiService.getBillingPaymentMethods();
    const methods: PaymentMethodSummary[] = (response.paymentMethods || []).map((method: any) => ({
      id: method.id,
      type: method.type,
      brand: method.brand,
      last4: method.last4,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      isDefault: method.isDefault,
      createdAt: method.createdAt
    }));
    setPaymentMethods(methods);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchSubscription(),
        fetchInvoices(invoicePagination.page, invoicePagination.pageSize),
        fetchPaymentMethods()
      ]);
    } catch (err) {
      logger.error('Failed to load billing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  }, [fetchInvoices, fetchPaymentMethods, fetchSubscription, invoicePagination.page, invoicePagination.pageSize]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updatePaymentData = (field: keyof PaymentData, value: string | boolean) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdatePayment = async () => {
    setPaymentModalError(null);

    if (!paymentData.cardNumber || !paymentData.cardHolder || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv) {
      setPaymentModalError('Please complete all payment details');
      return;
    }

    setIsPaymentSubmitting(true);
    try {
      await apiService.addBillingPaymentMethod({
        cardNumber: paymentData.cardNumber,
        cardHolder: paymentData.cardHolder,
        expiryMonth: paymentData.expiryMonth,
        expiryYear: paymentData.expiryYear,
        setDefault: paymentData.setAsDefault
      });

      await fetchPaymentMethods();
      setPaymentData(initialPaymentData);
      setShowPaymentModal(false);
    } catch (err) {
      logger.error('Failed to add payment method:', err);
      setPaymentModalError(err instanceof Error ? err.message : 'Unable to add payment method.');
    } finally {
      setIsPaymentSubmitting(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    setIsCancelling(true);
    try {
      const response = await apiService.cancelSubscription();
      setSubscription(response.subscription);
      setShowCancelModal(false);
    } catch (err) {
      logger.error('Failed to cancel subscription:', err);
      alert(err instanceof Error ? err.message : 'Unable to cancel subscription right now.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpgradePlan = async (targetPlan: string) => {
    const defaultMethod = paymentMethods.find((method) => method.isDefault);
    if (!defaultMethod) {
      alert('Add a payment method before upgrading your plan.');
      setShowPaymentModal(true);
      return;
    }

    setIsUpgrading(true);
    try {
      const result = await apiService.subscribeToPlan({
        plan: targetPlan,
        paymentMethodId: defaultMethod.id
      });

      setSubscription(result.subscription);
      await fetchInvoices();
    } catch (err) {
      logger.error('Failed to change subscription plan:', err);
      alert(err instanceof Error ? err.message : 'Unable to change plan at this time.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    const confirmRemoval = window.confirm('Remove this payment method?');
    if (!confirmRemoval) {
      return;
    }
    try {
      await apiService.deleteBillingPaymentMethod(paymentMethodId);
      await fetchPaymentMethods();
    } catch (err) {
      logger.error('Failed to remove payment method:', err);
      alert(err instanceof Error ? err.message : 'Unable to remove payment method.');
    }
  };

  const defaultPaymentMethod = paymentMethods.find((method) => method.isDefault) || null;

  const isPaymentFormValid = Boolean(
    paymentData.cardNumber &&
    paymentData.cardHolder &&
    paymentData.expiryMonth &&
    paymentData.expiryYear &&
    paymentData.cvv
  );

  return {
    loading,
    error,
    subscription,
    usageStats,
    invoices,
    invoicePagination,
    paymentMethods,
    defaultPaymentMethod,
    refresh,

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
  };
}


