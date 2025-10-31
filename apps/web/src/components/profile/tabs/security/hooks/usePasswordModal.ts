import { useState } from 'react';
import { PasswordData } from '../types';

/**
 * Custom hook to manage password change modal state
 */
export const usePasswordModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetPasswordData();
  };

  const resetPasswordData = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
    });
  };

  const updatePasswordField = (field: keyof PasswordData, value: string | boolean) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    isOpen,
    passwordData,
    openModal,
    closeModal,
    resetPasswordData,
    updatePasswordField,
  };
};

