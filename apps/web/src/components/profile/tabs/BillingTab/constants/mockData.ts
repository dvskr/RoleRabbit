import { CurrentPlan, BillingHistoryItem } from '../types';

export const MOCK_CURRENT_PLAN: CurrentPlan = {
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

export const MOCK_BILLING_HISTORY: BillingHistoryItem[] = [
  {
    plan: 'Professional Plan',
    date: 'December 2024',
    amount: '$29.00'
  },
  {
    plan: 'Professional Plan',
    date: 'November 2024',
    amount: '$29.00'
  }
];

export const MONTHS = Array.from({ length: 12 }, (_, i) => 
  String(i + 1).padStart(2, '0')
);

export const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear + i);
};

