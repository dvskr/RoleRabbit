import { useState } from 'react';

/**
 * Custom hook to manage 2FA setup modal state
 */
export const use2FAModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    setCode('');
  };

  const closeModal = () => {
    setIsOpen(false);
    setCode('');
    setShowCode(false);
  };

  const updateCode = (newCode: string) => {
    // Only allow digits, max 6 characters
    const digitsOnly = newCode.replace(/\D/g, '').slice(0, 6);
    setCode(digitsOnly);
  };

  return {
    isOpen,
    code,
    showCode,
    openModal,
    closeModal,
    updateCode,
    setShowCode,
  };
};

