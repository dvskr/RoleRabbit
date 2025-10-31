'use client';

import React from 'react';
import { Lock, Key } from 'lucide-react';
import { PasswordManagementSectionProps } from '../types';
import { SecurityCard } from './SecurityCard';
import { PASSWORD_LAST_CHANGED } from '../constants';

export const PasswordManagementSection: React.FC<PasswordManagementSectionProps> = ({
  colors,
  onOpenPasswordModal,
  twoFAEnabled,
  onToggle2FA,
}) => {
  return (
    <SecurityCard colors={colors} title="Password & Authentication">
      <div className="space-y-6">
        {/* Password Section */}
        <div 
          className="flex items-center justify-between p-4 rounded-xl"
          style={{
            background: colors.badgeSuccessBg,
            border: `1px solid ${colors.badgeSuccessBorder}`,
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="p-2 rounded-lg"
              style={{ background: colors.badgeSuccessBg }}
            >
              <Lock size={20} style={{ color: colors.successGreen }} />
            </div>
            <div>
              <p 
                className="font-semibold"
                style={{ color: colors.primaryText }}
              >
                Password
              </p>
              <p 
                className="text-sm"
                style={{ color: colors.secondaryText }}
              >
                Last changed {PASSWORD_LAST_CHANGED}
              </p>
            </div>
          </div>
          <button 
            onClick={onOpenPasswordModal}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              background: colors.successGreen,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Change Password
          </button>
        </div>
        
        {/* 2FA Section */}
        <div 
          className="flex items-center justify-between p-4 rounded-xl"
          style={{
            background: colors.badgeInfoBg,
            border: `1px solid ${colors.badgeInfoBorder}`,
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="p-2 rounded-lg"
              style={{ background: colors.badgeInfoBg }}
            >
              <Key size={20} style={{ color: colors.primaryBlue }} />
            </div>
            <div>
              <p 
                className="font-semibold"
                style={{ color: colors.primaryText }}
              >
                Two-Factor Authentication
              </p>
              <p 
                className="text-sm"
                style={{ color: colors.secondaryText }}
              >
                {twoFAEnabled ? 'Enabled' : 'Add an extra layer of security'}
              </p>
            </div>
          </div>
          {/* Toggle Switch */}
          <button
            onClick={onToggle2FA}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
            style={{
              background: twoFAEnabled ? colors.successGreen : colors.inputBackground,
              border: `1px solid ${colors.border}`,
            }}
            aria-label={twoFAEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
            title={twoFAEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
          >
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              style={{
                transform: twoFAEnabled ? 'translateX(24px)' : 'translateX(4px)',
              }}
            />
          </button>
        </div>
      </div>
    </SecurityCard>
  );
};

