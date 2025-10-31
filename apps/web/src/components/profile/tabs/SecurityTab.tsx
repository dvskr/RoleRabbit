'use client';

import React, { useState } from 'react';
import { logger } from '../../../utils/logger';
import { useTheme } from '../../../contexts/ThemeContext';
import { validatePasswordChange } from '../../../utils/passwordValidation';
import { setup2FA, disable2FA, simulatePasswordChange } from '../../../utils/securityHelpers';
import {
  SecurityHeader,
  PasswordManagementSection,
  LoginActivitySection,
  PrivacySettingsSection,
  PasswordChangeModal,
  TwoFASetupModal,
} from './security/components';
import { usePrivacySettings } from './security/hooks';
import { ProfileVisibility } from './security/types';

export default function SecurityTab() {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Privacy settings
  const {
    profileVisibility,
    showContactInfo,
    setProfileVisibility,
    setShowContactInfo,
  } = usePrivacySettings();

  // Handle password change
  const handlePasswordChange = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    // Validate password
    const validation = validatePasswordChange(
      passwordData.currentPassword,
      passwordData.newPassword,
      passwordData.confirmPassword
    );

    if (!validation.isValid) {
      validation.errors.forEach(error => logger.debug(error));
      return;
    }

    // Simulate password change (replace with actual API call)
    const success = await simulatePasswordChange(
      passwordData.currentPassword,
      passwordData.newPassword
    );

    if (success) {
      setShowPasswordModal(false);
    }
  };

  // Handle 2FA enable/disable
  const handleEnable2FA = async () => {
    if (twoFAEnabled) {
      // Disable 2FA
      const success = await disable2FA('currentPassword', '999999');
      if (success) {
        setTwoFAEnabled(false);
      } else {
        alert('Failed to disable 2FA. Please try again.');
      }
    } else {
      // Enable 2FA - Setup first
      const result = await setup2FA();
      if (result.success) {
        setShow2FAModal(true);
      } else {
        alert('Failed to setup 2FA. Is the API server running on port 3001?');
      }
    }
  };

  // Handle 2FA verification
  const handleVerify2FA = async (code: string) => {
    if (code.length === 6) {
      logger.debug('Verifying 2FA code...');
      // Simulate verification (replace with actual API call)
      setTimeout(() => {
        setTwoFAEnabled(true);
        setShow2FAModal(false);
        logger.debug('2FA enabled successfully');
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl">
      <SecurityHeader colors={colors} />
      
      <div className="space-y-8">
        <PasswordManagementSection
          colors={colors}
          onOpenPasswordModal={() => setShowPasswordModal(true)}
          twoFAEnabled={twoFAEnabled}
          onToggle2FA={handleEnable2FA}
        />

        <LoginActivitySection
          colors={colors}
        />

        <PrivacySettingsSection
          colors={colors}
          profileVisibility={profileVisibility}
          onProfileVisibilityChange={(visibility: ProfileVisibility) => setProfileVisibility(visibility)}
          showContactInfo={showContactInfo}
          onContactInfoChange={setShowContactInfo}
        />
      </div>

      {/* Modals */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordChange}
        colors={colors}
      />

      <TwoFASetupModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onVerify={handleVerify2FA}
        colors={colors}
      />
    </div>
  );
}
