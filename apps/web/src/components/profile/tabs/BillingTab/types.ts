export interface PaymentData {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface CurrentPlan {
  name: string;
  price: string;
  billing: string;
  features: string[];
}

export interface BillingHistoryItem {
  plan: string;
  date: string;
  amount: string;
}

export interface UsageStatistic {
  label: string;
  value: number;
  bgColor: string;
  borderColor: string;
}

