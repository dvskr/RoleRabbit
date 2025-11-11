'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Mail } from 'lucide-react';
import { logger } from '../../../utils/logger';
import { UserData } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';
import { validatePasswordChange } from '../../../utils/passwordValidation';
import {
  changePassword,
  sendOTP,
  sendOTPToNewEmail,
  verifyOTPAndUpdateEmail,
  verifyOTPAndResetPassword,
} from '../../../utils/securityHelpers';
import {
  AccountUpdateSection,
  PasswordChangeModal,
  EmailUpdateModal,
  ForgotFlowModal,
  SecurityCard,
} from './security/components';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../services/apiService';

interface PreferencesTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function PreferencesTab({
  userData,
  isEditing,
  onUserDataChange
}: PreferencesTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { user } = useAuth();
  const currentEmail = user?.email || userData.email || '';

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Email update modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  // Forgot flow modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!showPasswordModal) {
      setPasswordError(null);
      setPasswordSuccess(null);
    }
  }, [showPasswordModal]);

  useEffect(() => {
    if (!showEmailModal) {
      setEmailError(null);
      setEmailSuccess(null);
      setIsSendingOTP(false);
    }
  }, [showEmailModal]);

  useEffect(() => {
    if (!showForgotModal) {
      setForgotError(null);
      setForgotSuccess(null);
    }
  }, [showForgotModal]);

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

  const handleSendOTPToCurrent = async () => {
    setIsSendingOTP(true);
    setEmailError(null);
    try {
      const result = await sendOTP('email_update');
      if (!result.success) {
        setEmailError(result.error);
        setIsSendingOTP(false);
        return;
      }
      // Success - reset loading state
      setIsSendingOTP(false);
    } catch (error) {
      logger.error('Failed to send OTP:', error);
      setEmailError('Failed to send verification code. Please try again.');
      setIsSendingOTP(false);
    }
  };

  const handleVerifyCurrentOTP = async (otp: string, newEmail: string) => {
    setEmailError(null);
    try {
      // Verify current email OTP and save new email as pending
      const result = await verifyOTPAndUpdateEmail(otp, newEmail, 'verify_current');
      if (!result.success) {
        setEmailError(result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      logger.error('Failed to verify current OTP:', error);
      throw error;
    }
  };

  const handleSendOTPToNew = async (newEmail: string) => {
    setIsSendingOTP(true);
    setEmailError(null);
    try {
      const result = await sendOTPToNewEmail(newEmail);
      if (!result.success) {
        setEmailError(result.error);
        setIsSendingOTP(false);
        throw new Error(result.error);
      }
      // Success - reset loading state
      setIsSendingOTP(false);
    } catch (error) {
      logger.error('Failed to send OTP to new email:', error);
      setIsSendingOTP(false);
      throw error;
    }
  };

  const handleVerifyNewOTP = async (otp: string, newEmail: string) => {
    setEmailError(null);
    setEmailSuccess(null);
    
    const result = await verifyOTPAndUpdateEmail(otp, newEmail, 'verify_new');
    
    if (!result.success) {
      setEmailError(result.error);
      throw new Error(result.error);
    }

    setEmailSuccess('Email updated successfully.');
    setTimeout(() => {
      setShowEmailModal(false);
      setEmailSuccess(null);
      // Refresh user data
      window.location.reload();
    }, 2000);
  };

  const handleSendOTPForForgot = async () => {
    setForgotError(null);
    const result = await sendOTP('password_reset');
    if (!result.success) {
      setForgotError(result.error);
    }
  };

  const handleResetPassword = async (otp: string, newPassword: string, confirmPassword: string) => {
    setForgotError(null);
    setForgotSuccess(null);
    
    const result = await verifyOTPAndResetPassword(otp, newPassword, confirmPassword);
    
    if (!result.success) {
      setForgotError(result.error);
      return;
    }

    setForgotSuccess('Password reset successfully.');
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(null);
    }, 2000);
  };


  // Handle email notifications toggle change - save immediately to backend
  const handleEmailNotificationsChange = async (enabled: boolean) => {
    try {
      // Update local state immediately for instant UI feedback
      onUserDataChange({ emailNotifications: enabled });
      
      // Save to backend immediately
      await apiService.updateUserProfile({ emailNotifications: enabled });
      
      logger.info('Email notifications preference saved:', enabled);
    } catch (error) {
      logger.error('Failed to save email notifications preference:', error);
      // Revert on error
      onUserDataChange({ emailNotifications: !enabled });
      // Could show error toast here if needed
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-8">
        {/* Combined Account & Security and Notification Preferences Section */}
        <SecurityCard colors={colors} title="Account & Security">
          <div className="space-y-6">
            {/* Account & Security Section */}
            <AccountUpdateSection
              colors={colors}
              currentEmail={currentEmail}
              onOpenPasswordModal={() => setShowPasswordModal(true)}
              onOpenEmailModal={() => setShowEmailModal(true)}
              onOpenForgotFlow={() => setShowForgotModal(true)}
            />

            {/* Notification Preferences Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bell size={20} style={{ color: colors.primaryBlue }} />
                <h4 
                  className="text-lg font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  Notification Preferences
                </h4>
              </div>
              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between p-5 rounded-xl transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${userData.emailNotifications ? colors.borderFocused : colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = userData.emailNotifications ? colors.borderFocused : colors.border;
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{
                        background: userData.emailNotifications ? colors.badgeInfoBg : colors.inputBackground,
                      }}
                    >
                      <Mail size={18} style={{ color: userData.emailNotifications ? colors.primaryBlue : colors.secondaryText }} />
                    </div>
                    <div>
                      <p 
                        id="email-notifications-heading"
                        className="font-semibold flex items-center gap-2"
                        style={{ color: colors.primaryText }}
                      >
                        Product Updates & Tips
                        {userData.emailNotifications && (
                          <CheckCircle size={14} style={{ color: colors.successGreen }} />
                        )}
                      </p>
                      <p 
                        className="text-sm mt-1"
                        style={{ color: colors.secondaryText }}
                      >
                        Receive product updates, tips, and new features via email
                      </p>
                      <p 
                        className="text-xs mt-1 italic"
                        style={{ color: colors.tertiaryText }}
                      >
                        Security emails (password reset, OTP) will always be sent
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input 
                      id="email-notifications-toggle"
                      name="emailNotifications"
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={userData.emailNotifications || false}
                      onChange={(e) => handleEmailNotificationsChange(e.target.checked)}
                      aria-labelledby="email-notifications-heading"
                    />
                    <div 
                      className="w-11 h-6 rounded-full relative transition-all duration-200"
                      style={{
                        background: userData.emailNotifications ? colors.primaryBlue : colors.inputBackground,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div
                        className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all duration-200 bg-white shadow-sm"
                        style={{
                          transform: userData.emailNotifications ? 'translateX(20px)' : 'translateX(0)',
                        }}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </SecurityCard>
      </div>

      {/* Modals */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordChange}
        colors={colors}
        isSubmitting={passwordSubmitting}
        errorMessage={passwordError}
        successMessage={passwordSuccess}
      />

      <EmailUpdateModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSendOTPToCurrent={handleSendOTPToCurrent}
        onVerifyCurrentOTP={handleVerifyCurrentOTP}
        onSendOTPToNew={handleSendOTPToNew}
        onVerifyNewOTP={handleVerifyNewOTP}
        colors={colors}
        currentEmail={currentEmail}
        isLoading={isSendingOTP}
        errorMessage={emailError}
        successMessage={emailSuccess}
      />

      <ForgotFlowModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSendOTP={handleSendOTPForForgot}
        onResetPassword={handleResetPassword}
        colors={colors}
        currentEmail={currentEmail}
        errorMessage={forgotError}
        successMessage={forgotSuccess}
      />
    </div>
  );
}
