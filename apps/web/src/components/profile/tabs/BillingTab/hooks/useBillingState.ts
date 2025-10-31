import { useState } from 'react';
import { logger } from '../../../../../utils/logger';
import { PaymentData } from '../types';

export function useBillingState() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
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

  const updatePaymentData = (field: keyof PaymentData, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  return {
    showPaymentModal,
    setShowPaymentModal,
    showCancelModal,
    setShowCancelModal,
    paymentData,
    updatePaymentData,
    handleUpdatePayment,
    handleCancelSubscription,
    isPaymentFormValid: !!paymentData.cardNumber && 
                       !!paymentData.cardHolder && 
                       !!paymentData.expiryMonth && 
                       !!paymentData.expiryYear && 
                       !!paymentData.cvv
  };
}

