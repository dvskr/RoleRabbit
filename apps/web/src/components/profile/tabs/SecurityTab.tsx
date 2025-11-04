'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { logger } from '../../../utils/logger';
import { useTheme } from '../../../contexts/ThemeContext';
import { validatePasswordChange } from '../../../utils/passwordValidation';
import {
  setup2FA,
  enable2FA,
  disable2FA,
  changePassword,
  get2FAStatus,
} from '../../../utils/securityHelpers';
import {
  PasswordManagementSection,
  PasswordChangeModal,
  TwoFASetupModal,
} from './security/components';

type TwoFASetupState = {
  secret: string;
  qrCode: string;
  backupCodes: string[];
};

export default function SecurityTab() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [isTwoFAStatusLoading, setIsTwoFAStatusLoading] = useState(true);
  const [isTwoFAProcessing, setIsTwoFAProcessing] = useState(false);
  const [twoFASetupData, setTwoFASetupData] = useState<TwoFASetupState | null>(null);
  const [twoFAModalError, setTwoFAModalError] = useState<string | null>(null);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [show2FAModal, setShow2FAModal] = useState(false);

  const refresh2FAStatus = useCallback(async () => {
    setIsTwoFAStatusLoading(true);
    const status = await get2FAStatus();
    if (status.success) {
      setTwoFAEnabled(status.enabled);
    } else if (status.error) {
      logger.error('Failed to load 2FA status:', status.error);
    }
    setIsTwoFAStatusLoading(false);
  }, []);

  useEffect(() => {
    refresh2FAStatus();
  }, [refresh2FAStatus]);

  useEffect(() => {
    if (!showPasswordModal) {
      setPasswordError(null);
      setPasswordSuccess(null);
    }
  }, [showPasswordModal]);

  useEffect(() => {
    if (!show2FAModal) {
      setTwoFAModalError(null);
      setTwoFASetupData(null);
      setIsVerifying2FA(false);
    }
  }, [show2FAModal]);

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

  const handleToggleTwoFA = async () => {
    if (isTwoFAStatusLoading || isTwoFAProcessing) {
      return;
    }

    setTwoFAModalError(null);

    if (twoFAEnabled) {
      const currentPassword = window.prompt('Enter your current password to disable 2FA');
      if (!currentPassword) {
        return;
      }
      const token = window.prompt('Enter a current 2FA code or one of your backup codes');
      if (!token) {
        return;
      }

      setIsTwoFAProcessing(true);
      const result = await disable2FA(currentPassword, token);
      setIsTwoFAProcessing(false);

      if (!result.success) {
        alert(result.error || 'Unable to disable 2FA.');
        return;
      }

      setTwoFAEnabled(false);
      alert('Two-factor authentication has been disabled.');
    } else {
      setIsTwoFAProcessing(true);
      const result = await setup2FA();
      setIsTwoFAProcessing(false);

      if (!result.success) {
        alert(result.error);
        return;
      }

      setTwoFASetupData({
        secret: result.secret,
        qrCode: result.qrCode,
        backupCodes: result.backupCodes,
      });
      setShow2FAModal(true);
    }
  };

  const handleVerify2FA = async (code: string) => {
    if (!twoFASetupData || code.length !== 6) {
      return;
    }

    setTwoFAModalError(null);
    setIsVerifying2FA(true);
    const result = await enable2FA(twoFASetupData.secret, code, twoFASetupData.backupCodes);
    setIsVerifying2FA(false);

    if (!result.success) {
      setTwoFAModalError(result.error);
      return;
    }

    setTwoFAEnabled(true);
    setShow2FAModal(false);
    setTwoFASetupData(null);
    alert('Two-factor authentication enabled successfully. Don’t forget to store your backup codes safely.');
  };

  return (
    <div className="max-w-4xl">
      <div className="space-y-8">
        <PasswordManagementSection
          colors={colors}
          onOpenPasswordModal={() => setShowPasswordModal(true)}
          twoFAEnabled={twoFAEnabled}
          onToggle2FA={handleToggleTwoFA}
          isTwoFAStatusLoading={isTwoFAStatusLoading}
          isTwoFAProcessing={isTwoFAProcessing}
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

      <TwoFASetupModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onVerify={handleVerify2FA}
        colors={colors}
        qrCode={twoFASetupData?.qrCode}
        secret={twoFASetupData?.secret}
        backupCodes={twoFASetupData?.backupCodes}
        isVerifying={isVerifying2FA}
        errorMessage={twoFAModalError}
      />
    </div>
  );
}
