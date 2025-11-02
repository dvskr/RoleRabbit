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
  qrCode,
  secret,
  backupCodes = [],
  isVerifying = false,
  errorMessage,
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
    if (code.length === 6 && !isVerifying) {
      onVerify(code);
    }
  };

  const isCodeValid = code.length === 6;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
      style={{ 
        background: MODAL_BACKDROP_STYLE,
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

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm font-medium">
            {errorMessage}
          </div>
        )}

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

          {(qrCode || secret) && (
            <div
              className="rounded-lg p-4"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: colors.primaryText }}
              >
                Scan the QR code with your authenticator app
              </h4>
              {qrCode && (
                <div className="flex justify-center mb-3">
                  <img src={qrCode} alt="2FA QR code" className="w-40 h-40 object-contain" />
                </div>
              )}
              {secret && (
                <div
                  className="text-xs rounded-md px-3 py-2 break-all"
                  style={{
                    background: colors.cardBackground,
                    border: `1px dashed ${colors.border}`,
                    color: colors.secondaryText,
                  }}
                >
                  Can’t scan? Enter this key manually:&nbsp;
                  <span className="font-semibold" style={{ color: colors.primaryText }}>{secret}</span>
                </div>
              )}
            </div>
          )}

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

          {backupCodes.length > 0 && (
            <div 
              className="rounded-lg p-3"
              style={{
                background: colors.badgeWarningBg,
                border: `1px solid ${colors.badgeWarningBorder}`,
              }}
            >
              <p 
                className="text-sm mb-2"
                style={{ color: colors.badgeWarningText }}
              >
                <strong>Backup Codes:</strong> Store these codes securely. Each code can be used once if you cannot access your authenticator app.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {backupCodes.map((backupCode) => (
                  <div
                    key={backupCode}
                    className="px-2 py-1 rounded-md"
                    style={{
                      background: colors.cardBackground,
                      border: `1px solid ${colors.badgeWarningBorder}`,
                      color: colors.primaryText,
                    }}
                  >
                    {backupCode}
                  </div>
                ))}
              </div>
            </div>
          )}
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
            disabled={!isCodeValid || isVerifying}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: !isCodeValid || isVerifying ? colors.inputBackground : colors.primaryBlue,
              color: !isCodeValid || isVerifying ? colors.tertiaryText : 'white',
              opacity: !isCodeValid || isVerifying ? 0.5 : 1,
              cursor: !isCodeValid || isVerifying ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (isCodeValid && !isVerifying) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (isCodeValid && !isVerifying) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {isVerifying ? 'Verifying…' : 'Verify & Enable'}
          </button>
        </div>
      </div>
    </div>
  );
};

