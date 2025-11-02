export interface PaymentData {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  setAsDefault: boolean;
}

export interface SubscriptionSummary {
  id: string;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  billingInterval: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  features: string[];
}

export interface InvoiceItem {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  billingInterval: string;
  invoiceDate: string;
  dueDate?: string | null;
  paidAt?: string | null;
  invoiceUrl?: string | null;
}

export interface PaymentMethodSummary {
  id: string;
  type: string;
  brand?: string | null;
  last4?: string | null;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  isDefault: boolean;
  createdAt: string;
}

export interface UsageStatistic {
  label: string;
  value: number;
  bgColor?: string;
  borderColor?: string;
}

