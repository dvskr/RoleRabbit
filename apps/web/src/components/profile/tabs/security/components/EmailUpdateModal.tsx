'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { ThemeColors } from '../../../../contexts/ThemeContext';

interface EmailUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendOTPToCurrent: () => Promise<void>;
  onVerifyCurrentOTP: (otp: string, newEmail: string) => Promise<void>;
  onSendOTPToNew: (newEmail: string) => Promise<void>;
  onVerifyNewOTP: (otp: string, newEmail: string) => Promise<void>;
  colors: ThemeColors;
  currentEmail: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
}

export const EmailUpdateModal: React.FC<EmailUpdateModalProps> = ({
  isOpen,
  onClose,
  onSendOTPToCurrent,
  onVerifyCurrentOTP,
  onSendOTPToNew,
  onVerifyNewOTP,
  colors,
  currentEmail,
  isLoading = false,
  errorMessage,
  successMessage,
}) => {
  const [step, setStep] = useState<'enter-email' | 'verify-current' | 'verify-new' | 'success'>('enter-email');
  const [newEmail, setNewEmail] = useState('');
  const [currentOtp, setCurrentOtp] = useState(['', '', '', '', '', '']);
  const [newOtp, setNewOtp] = useState(['', '', '', '', '', '']);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('enter-email');
      setNewEmail('');
      setCurrentOtp(['', '', '', '', '', '']);
      setNewOtp(['', '', '', '', '', '']);
      setIsSendingOTP(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSendOTPToCurrent = async () => {
    if (!newEmail.trim()) return;
    
    setIsSendingOTP(true);
    try {
      await onSendOTPToCurrent();
      setStep('verify-current');
    } catch (error) {
      // Error handled by parent component via errorMessage prop
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyCurrentOTP = async () => {
    const otpString = currentOtp.join('');
    if (otpString.length !== 6 || !newEmail.trim()) return;

    setIsSubmitting(true);
    try {
      await onVerifyCurrentOTP(otpString, newEmail);
      setStep('verify-new');
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleSendOTPToNew = async () => {
    setIsSendingOTP(true);
    try {
      await onSendOTPToNew(newEmail);
    } catch (error) {
      // Error handled by parent component
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyNewOTP = async () => {
    const otpString = newOtp.join('');
    if (otpString.length !== 6 || !newEmail.trim()) return;

    setIsSubmitting(true);
    try {
      await onVerifyNewOTP(otpString, newEmail);
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-send OTP to new email when step changes to verify-new
  useEffect(() => {
    if (step === 'verify-new' && newEmail && !isSendingOTP) {
      onSendOTPToNew(newEmail).catch(() => {
        // Error handled by parent component
      });
    }
  }, [step, newEmail]);

  if (!isOpen) return null;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
  const currentOtpString = currentOtp.join('');
  const newOtpString = newOtp.join('');
  const isCurrentOtpValid = currentOtpString.length === 6;
  const isNewOtpValid = newOtpString.length === 6;

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
            Update Login Email
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.secondaryText }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Enter New Email */}
        {step === 'enter-email' && (
          <>
            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>
                Current email: <span className="font-medium" style={{ color: colors.primaryText }}>{currentEmail}</span>
              </p>
              <p className="text-sm mb-4" style={{ color: colors.secondaryText }}>
                Enter your new email address. We'll verify your identity and then confirm the new email address.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
                New Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${isEmailValid && newEmail ? colors.successGreen : colors.border}`,
                  color: colors.primaryText,
                }}
                placeholder="newemail@example.com"
                disabled={isSendingOTP || isLoading}
              />
              {newEmail && !isEmailValid && (
                <p className="text-xs mt-1" style={{ color: colors.errorRed }}>
                  Please enter a valid email address
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendOTPToCurrent}
                disabled={!isEmailValid || isSendingOTP || isLoading}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: !isEmailValid || isSendingOTP || isLoading ? colors.inputBackground : colors.primaryBlue,
                  color: !isEmailValid || isSendingOTP || isLoading ? colors.tertiaryText : 'white',
                  opacity: !isEmailValid || isSendingOTP || isLoading ? 0.5 : 1,
                }}
              >
                {isSendingOTP ? 'Sending...' : 'Continue'}
              </button>
            </div>
          </>
        )}

        {/* Step 2: Verify Current Email OTP */}
        {step === 'verify-current' && (
          <>
            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>
                Step 1 of 2: Verify your identity
              </p>
              <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>
                We sent a 6-digit verification code to: <span className="font-medium" style={{ color: colors.primaryText }}>{currentEmail}</span>
              </p>
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                New email: <span className="font-medium" style={{ color: colors.primaryText }}>{newEmail}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                Verification Code
              </label>
              <div className="flex gap-2 justify-center">
                {currentOtp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value.slice(-1);
                      if (!/^\d*$/.test(value)) return;
                      const newOtpArray = [...currentOtp];
                      newOtpArray[index] = value;
                      setCurrentOtp(newOtpArray);
                      if (value && index < 5) {
                        const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !currentOtp[index] && index > 0) {
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

            <div className="flex gap-3">
              <button
                onClick={() => setStep('enter-email')}
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
                onClick={handleVerifyCurrentOTP}
                disabled={!isCurrentOtpValid || isSubmitting || isLoading}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: !isCurrentOtpValid || isSubmitting || isLoading ? colors.inputBackground : colors.primaryBlue,
                  color: !isCurrentOtpValid || isSubmitting || isLoading ? colors.tertiaryText : 'white',
                  opacity: !isCurrentOtpValid || isSubmitting || isLoading ? 0.5 : 1,
                }}
              >
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </>
        )}

        {/* Step 3: Verify New Email OTP */}
        {step === 'verify-new' && (
          <>
            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: colors.successGreen }}>
                ✓ Identity verified
              </p>
              <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>
                Step 2 of 2: Verify new email ownership
              </p>
              <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>
                We sent a 6-digit verification code to: <span className="font-medium" style={{ color: colors.primaryText }}>{newEmail}</span>
              </p>
              {isSendingOTP && (
                <p className="text-xs" style={{ color: colors.tertiaryText }}>
                  Sending verification code...
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3" style={{ color: colors.primaryText }}>
                Verification Code
              </label>
              <div className="flex gap-2 justify-center">
                {newOtp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value.slice(-1);
                      if (!/^\d*$/.test(value)) return;
                      const newOtpArray = [...newOtp];
                      newOtpArray[index] = value;
                      setNewOtp(newOtpArray);
                      if (value && index < 5) {
                        const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !newOtp[index] && index > 0) {
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
                    disabled={isSubmitting || isLoading || isSendingOTP}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('verify-current')}
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
                onClick={() => handleSendOTPToNew()}
                className="px-4 py-2 rounded-lg transition-colors text-sm"
                style={{
                  background: colors.inputBackground,
                  color: colors.primaryBlue,
                  border: `1px solid ${colors.border}`,
                }}
                disabled={isSendingOTP || isLoading}
              >
                {isSendingOTP ? 'Sending...' : 'Resend'}
              </button>
              <button
                onClick={handleVerifyNewOTP}
                disabled={!isNewOtpValid || isSubmitting || isLoading}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: !isNewOtpValid || isSubmitting || isLoading ? colors.inputBackground : colors.primaryBlue,
                  color: !isNewOtpValid || isSubmitting || isLoading ? colors.tertiaryText : 'white',
                  opacity: !isNewOtpValid || isSubmitting || isLoading ? 0.5 : 1,
                }}
              >
                {isSubmitting ? 'Updating...' : 'Update Email'}
              </button>
            </div>
          </>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="mb-4 flex justify-center">
              <div 
                className="p-3 rounded-full"
                style={{ background: colors.badgeSuccessBg }}
              >
                <CheckCircle size={32} style={{ color: colors.successGreen }} />
              </div>
            </div>
            <p className="text-lg font-semibold mb-2" style={{ color: colors.successGreen }}>
              Email Updated Successfully!
            </p>
            <p className="text-sm mb-4" style={{ color: colors.secondaryText }}>
              Your login email has been changed to <span className="font-medium" style={{ color: colors.primaryText }}>{newEmail}</span>. 
              Confirmation emails have been sent to both addresses.
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

