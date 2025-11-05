'use client';

import React from 'react';
import { X } from 'lucide-react';
import { PasswordChangeModalProps } from '../types';
import { MODAL_BACKDROP_STYLE, MODAL_MAX_WIDTH, PASSWORD_REQUIREMENTS_TEXT } from '../constants';
import { PasswordInput } from './PasswordInput';

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  colors,
  isSubmitting = false,
  errorMessage,
  successMessage,
}) => {
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  React.useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword,
    });
  };

  const isFormValid = passwordData.currentPassword && 
                       passwordData.newPassword && 
                       passwordData.confirmPassword;

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
            Change Password
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
            aria-label="Close password change modal"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(value) => setPasswordData(prev => ({ ...prev, currentPassword: value }))}
            showPassword={passwordData.showCurrentPassword}
            onToggleShowPassword={() => setPasswordData(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
            placeholder="Enter current password"
            colors={colors}
            autoComplete="current-password"
          />

          <PasswordInput
            label="New Password"
            value={passwordData.newPassword}
            onChange={(value) => setPasswordData(prev => ({ ...prev, newPassword: value }))}
            showPassword={passwordData.showNewPassword}
            onToggleShowPassword={() => setPasswordData(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
            placeholder="Enter new password (min. 8 characters)"
            colors={colors}
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(value) => setPasswordData(prev => ({ ...prev, confirmPassword: value }))}
            showPassword={passwordData.showConfirmPassword}
            onToggleShowPassword={() => setPasswordData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
            placeholder="Confirm new password"
            colors={colors}
            autoComplete="new-password"
          />

          <div 
            className="rounded-lg p-3"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
            }}
          >
            <p 
              className="text-sm"
              style={{ color: colors.badgeInfoText }}
            >
              <strong>Password Requirements:</strong>
              <ul className="mt-1 ml-4 list-disc text-xs">
                {PASSWORD_REQUIREMENTS_TEXT.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
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
            disabled={!isFormValid || isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: !isFormValid || isSubmitting ? colors.inputBackground : colors.successGreen,
              color: !isFormValid || isSubmitting ? colors.tertiaryText : 'white',
              opacity: !isFormValid || isSubmitting ? 0.5 : 1,
              cursor: !isFormValid || isSubmitting ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (isFormValid && !isSubmitting) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid && !isSubmitting) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {isSubmitting ? 'Updating…' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

