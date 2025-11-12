'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { PasswordManagementSectionProps } from '../types';
import { SecurityCard } from './SecurityCard';
import { PASSWORD_LAST_CHANGED } from '../constants';

export const PasswordManagementSection: React.FC<PasswordManagementSectionProps> = ({
  colors,
  onOpenPasswordModal,
}) => {
  return (
    <SecurityCard colors={colors} title="Password Management">
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
      </div>
    </SecurityCard>
  );
};

