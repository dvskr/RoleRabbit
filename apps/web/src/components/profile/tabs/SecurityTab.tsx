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
  getSessions,
  revokeSession,
  revokeOtherSessions,
  LoginSessionDTO,
} from '../../../utils/securityHelpers';
import {
  SecurityHeader,
  PasswordManagementSection,
  LoginActivitySection,
  PrivacySettingsSection,
  PasswordChangeModal,
  TwoFASetupModal,
} from './security/components';
import { usePrivacySettings } from './security/hooks';
import { ProfileVisibility, LoginSession } from './security/types';

type TwoFASetupState = {
  secret: string;
  qrCode: string;
  backupCodes: string[];
};

const mapSessions = (sessions: LoginSessionDTO[]): LoginSession[] =>
  sessions.map((session) => ({
    id: session.id,
    device: session.device,
    ipAddress: session.ipAddress,
    lastActive: session.lastActivity,
    isCurrent: session.isCurrent,
    userAgent: session.userAgent,
  }));

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

  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const {
    profileVisibility,
    showContactInfo,
    setProfileVisibility,
    setShowContactInfo,
  } = usePrivacySettings();

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

  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    const result = await getSessions();
    if (result.success) {
      setSessions(mapSessions(result.sessions));
    } else {
      setSessionsError(result.error);
    }
    setSessionsLoading(false);
  }, []);

  useEffect(() => {
    refresh2FAStatus();
    refreshSessions();
  }, [refresh2FAStatus, refreshSessions]);

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

  const handleLogoutSession = async (sessionId: string) => {
    const result = await revokeSession(sessionId);
    if (!result.success) {
      alert(result.error);
      return;
    }
    refreshSessions();
  };

  const handleLogoutAllSessions = async () => {
    const result = await revokeOtherSessions();
    if (!result.success) {
      alert(result.error);
      return;
    }
    refreshSessions();
  };

  return (
    <div className="max-w-4xl">
      <SecurityHeader colors={colors} />
      
      <div className="space-y-8">
        <PasswordManagementSection
          colors={colors}
          onOpenPasswordModal={() => setShowPasswordModal(true)}
          twoFAEnabled={twoFAEnabled}
          onToggle2FA={handleToggleTwoFA}
          isTwoFAStatusLoading={isTwoFAStatusLoading}
          isTwoFAProcessing={isTwoFAProcessing}
        />

        <LoginActivitySection
          colors={colors}
          sessions={sessions}
          isLoading={sessionsLoading}
          errorMessage={sessionsError}
          onLogoutSession={handleLogoutSession}
          onLogoutAllSessions={handleLogoutAllSessions}
        />

        <PrivacySettingsSection
          colors={colors}
          profileVisibility={profileVisibility}
          onProfileVisibilityChange={(visibility: ProfileVisibility) => setProfileVisibility(visibility)}
          showContactInfo={showContactInfo}
          onContactInfoChange={setShowContactInfo}
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
