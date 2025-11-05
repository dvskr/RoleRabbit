'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Lock } from 'lucide-react';
import { ThemeColors } from '../../../../contexts/ThemeContext';
import { PasswordInput } from './PasswordInput';

interface ForgotFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendOTP: (purpose: 'password_reset') => Promise<void>;
  onResetPassword: (otp: string, newPassword: string, confirmPassword: string) => Promise<void>;
  colors: ThemeColors;
  currentEmail: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
}

export const ForgotFlowModal: React.FC<ForgotFlowModalProps> = ({
  isOpen,
  onClose,
  onSendOTP,
  onResetPassword,
  colors,
  currentEmail,
  isLoading = false,
  errorMessage,
  successMessage,
}) => {
  const [step, setStep] = useState<'select' | 'otp' | 'reset'>('select');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsSendingOTP(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSendOTP = async () => {
    setIsSendingOTP(true);
    try {
      await onSendOTP('password_reset');
      setStep('otp');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleResetPassword = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6 || !newPassword || !confirmPassword) return;

    setIsSubmitting(true);
    try {
      await onResetPassword(otpString, newPassword, confirmPassword);
      setStep('reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetEmail = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6 || !newEmail) return;

    setIsSubmitting(true);
    try {
      await onResetEmail(otpString, newEmail);
      setStep('reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const otpString = otp.join('');
  const isOtpValid = otpString.length === 6;
  const passwordsMatch = newPassword === confirmPassword;
  const isPasswordValid = newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /\d/.test(newPassword);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
      style={{ 
        background: 'rgba(0, 0, 0, 0.75)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="rounded-2xl p-6 w-full max-w-md"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {(errorMessage || successMessage) && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              errorMessage
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}
          >
            {errorMessage || successMessage}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-xl font-semibold"
            style={{ color: colors.primaryText }}
          >
            Reset Account Access
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.secondaryText }}
          >
            <X size={20} />
          </button>
        </div>

        {step === 'select' && (
          <>
            <div className="mb-6">
              <p className="text-sm mb-4" style={{ color: colors.secondaryText }}>
                We'll send a verification code to your current email address: <span className="font-medium" style={{ color: colors.primaryText }}>{currentEmail}</span>
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={handleSendOTP}
                disabled={isSendingOTP || isLoading}
                className="w-full p-4 rounded-xl transition-all text-left"
                style={{
                  background: colors.inputBackground,
                  border: `2px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (!isSendingOTP && !isLoading) {
                    e.currentTarget.style.borderColor = colors.primaryBlue;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div className="flex items-center gap-3">
                  <Lock size={20} style={{ color: colors.primaryBlue }} />
                  <div>
                    <p className="font-semibold" style={{ color: colors.primaryText }}>Reset Password</p>
                    <p className="text-sm" style={{ color: colors.secondaryText }}>Set a new password for your account</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg transition-colors"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
                border: `1px solid ${colors.border}`,
              }}
            >
              Cancel
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>
                We sent a 6-digit verification code to: <span className="font-medium" style={{ color: colors.primaryText }}>{currentEmail}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                Verification Code
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value.slice(-1);
                      if (!/^\d*$/.test(value)) return;
                      const newOtp = [...otp];
                      newOtp[index] = value;
                      setOtp(newOtp);
                      if (value && index < 5) {
                        const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        const prevInput = e.target.parentElement?.children[index - 1] as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `2px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    disabled={isSubmitting || isLoading}
                  />
                ))}
              </div>
            </div>

            {isOtpValid && (
              <div className="mb-6 space-y-4">
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  showPassword={showPassword}
                  onToggleShowPassword={() => setShowPassword(!showPassword)}
                  placeholder="Enter new password"
                  colors={colors}
                  autoComplete="new-password"
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  showPassword={showConfirmPassword}
                  onToggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  placeholder="Confirm new password"
                  colors={colors}
                  autoComplete="new-password"
                />
                {newPassword && !isPasswordValid && (
                  <p className="text-xs" style={{ color: colors.errorRed }}>
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                )}
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs" style={{ color: colors.errorRed }}>
                    Passwords do not match
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                }}
                disabled={isSubmitting || isLoading}
              >
                Back
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!isOtpValid || !isPasswordValid || !passwordsMatch || isSubmitting || isLoading}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: !isOtpValid || !isPasswordValid || !passwordsMatch || isSubmitting || isLoading ? colors.inputBackground : colors.primaryBlue,
                  color: !isOtpValid || !isPasswordValid || !passwordsMatch || isSubmitting || isLoading ? colors.tertiaryText : 'white',
                  opacity: !isOtpValid || !isPasswordValid || !passwordsMatch || isSubmitting || isLoading ? 0.5 : 1,
                }}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </>
        )}


        {step === 'reset' && (
          <div className="text-center py-4">
            <p className="text-lg font-semibold mb-2" style={{ color: colors.successGreen }}>
              Password Reset Successful!
            </p>
            <p className="text-sm mb-4" style={{ color: colors.secondaryText }}>
              Your password has been reset. You can now log in with your new password.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg transition-colors"
              style={{
                background: colors.primaryBlue,
                color: 'white',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

