'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Mail } from 'lucide-react';
import { ThemeColors } from '../../../../contexts/ThemeContext';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  colors: ThemeColors;
  purpose: 'email_update' | 'password_reset';
  currentEmail?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  colors,
  purpose,
  currentEmail,
  isLoading = false,
  errorMessage,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setIsSubmitting(false);
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onVerify(otpString);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const otpString = otp.join('');
  const isFormValid = otpString.length === 6;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
      style={{ 
        background: 'rgba(0, 0, 0, 0.75)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
          position: 'relative',
          zIndex: 1,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {errorMessage && (
          <div
            className="mb-4 p-3 rounded-lg text-sm font-medium"
            style={{
              background: 'rgba(220, 38, 38, 0.1)',
              color: colors.errorRed,
              border: `1px solid ${colors.errorRed}`
            }}
          >
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-xl font-semibold"
            style={{ color: colors.primaryText }}
          >
            Verify Your Email
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={16} style={{ color: colors.secondaryText }} />
            <p className="text-sm" style={{ color: colors.secondaryText }}>
              We sent a 6-digit verification code to:
            </p>
          </div>
          <p className="font-medium" style={{ color: colors.primaryText }}>
            {currentEmail || 'your email'}
          </p>
          <p className="text-xs mt-2" style={{ color: colors.tertiaryText }}>
            Enter the code below to {purpose === 'email_update' ? 'update your email' : 'reset your password'}
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
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold rounded-lg transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `2px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primaryBlue;
                  e.currentTarget.style.outline = `2px solid ${colors.primaryBlue}40`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.outline = 'none';
                }}
                disabled={isSubmitting || isLoading}
              />
            ))}
          </div>
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
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || isLoading}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: !isFormValid || isSubmitting || isLoading ? colors.inputBackground : colors.primaryBlue,
              color: !isFormValid || isSubmitting || isLoading ? colors.tertiaryText : 'white',
              opacity: !isFormValid || isSubmitting || isLoading ? 0.5 : 1,
              cursor: !isFormValid || isSubmitting || isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting || isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};

