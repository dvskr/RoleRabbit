'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { validatePasswordChange } from '../../../utils/passwordValidation';
import { changePassword } from '../../../utils/securityHelpers';
import {
  PasswordManagementSection,
  PasswordChangeModal,
} from './security/components';

export default function SecurityTab() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!showPasswordModal) {
      setPasswordError(null);
      setPasswordSuccess(null);
    }
  }, [showPasswordModal]);

  const handlePasswordChange = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setPasswordError(null);
    setPasswordSuccess(null);

    const validation = validatePasswordChange(
      passwordData.currentPassword,
      passwordData.newPassword,
      passwordData.confirmPassword
    );

    if (!validation.isValid) {
      const firstError = validation.errors[0];
      setPasswordError(firstError || 'Password validation failed');
      return;
    }

    setPasswordSubmitting(true);
    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword,
      passwordData.confirmPassword
    );
    setPasswordSubmitting(false);

    if (!result.success) {
      setPasswordError(result.error);
      return;
    }

    setPasswordSuccess('Password updated successfully.');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess(null);
    }, 1500);
  };

  return (
    <div className="w-full">
      <div className="space-y-8">
        <PasswordManagementSection
          colors={colors}
          onOpenPasswordModal={() => setShowPasswordModal(true)}
        />
      </div>

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordChange}
        colors={colors}
        isSubmitting={passwordSubmitting}
        errorMessage={passwordError}
        successMessage={passwordSuccess}
      />
    </div>
  );
}
