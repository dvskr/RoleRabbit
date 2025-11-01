'use client';

import React from 'react';
import { X, Shield } from 'lucide-react';
import { TwoFASetupModalProps } from '../types';
import { MODAL_BACKDROP_STYLE, MODAL_MAX_WIDTH } from '../constants';

export const TwoFASetupModal: React.FC<TwoFASetupModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  colors,
}) => {
  const [code, setCode] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) {
      setCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(newCode);
  };

  const handleSubmit = () => {
    if (code.length === 6) {
      onVerify(code);
    }
  };

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
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`rounded-2xl p-6 w-full ${MODAL_MAX_WIDTH}`}
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          position: 'relative',
          zIndex: 1,
        }}
        onClick={(e) => {
          // Prevent clicks inside modal from closing it
          e.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 
            className="text-xl font-semibold"
            style={{ color: colors.primaryText }}
          >
            Enable Two-Factor Authentication
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
            aria-label="Close 2FA setup modal"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div 
            className="rounded-lg p-4"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield size={20} style={{ color: colors.primaryBlue }} />
              <h4 
                className="font-semibold"
                style={{ color: colors.primaryText }}
              >
                How 2FA Works
              </h4>
            </div>
            <p 
              className="text-sm"
              style={{ color: colors.badgeInfoText }}
            >
              After enabling, you'll need to enter a 6-digit code from your authenticator app when logging in. This adds an extra layer of security to your account.
            </p>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.primaryText }}
            >
              Enter 6-digit code from your authenticator app
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                className="w-full px-3 py-2 rounded-lg text-center text-2xl tracking-widest transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <p 
              className="text-xs mt-2"
              style={{ color: colors.tertiaryText }}
            >
              Use an authenticator app like Google Authenticator or Authy
            </p>
          </div>

          <div 
            className="rounded-lg p-3"
            style={{
              background: colors.badgeWarningBg,
              border: `1px solid ${colors.badgeWarningBorder}`,
            }}
          >
            <p 
              className="text-sm"
              style={{ color: colors.badgeWarningText }}
            >
              <strong>Note:</strong> Make sure to save your backup codes in a safe place. You'll need them if you lose access to your authenticator app.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: colors.inputBackground,
              color: colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={code.length !== 6}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: code.length !== 6 ? colors.inputBackground : colors.primaryBlue,
              color: code.length !== 6 ? colors.tertiaryText : 'white',
              opacity: code.length !== 6 ? 0.5 : 1,
              cursor: code.length !== 6 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (code.length === 6) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (code.length === 6) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            Verify & Enable
          </button>
        </div>
      </div>
    </div>
  );
};

