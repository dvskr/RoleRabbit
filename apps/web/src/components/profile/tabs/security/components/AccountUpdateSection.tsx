'use client';

import React from 'react';
import { Lock, Mail, ArrowRight, HelpCircle } from 'lucide-react';
import { SecurityCard } from './SecurityCard';
import { ThemeColors } from '../../../../contexts/ThemeContext';

interface AccountUpdateSectionProps {
  colors: ThemeColors;
  currentEmail: string;
  onOpenPasswordModal: () => void;
  onOpenEmailModal: () => void;
  onOpenForgotFlow: () => void;
}

export const AccountUpdateSection: React.FC<AccountUpdateSectionProps> = ({
  colors,
  currentEmail,
  onOpenPasswordModal,
  onOpenEmailModal,
  onOpenForgotFlow,
}) => {
  return (
    <SecurityCard colors={colors} title="Account & Security">
      <div className="space-y-4">
        {/* Login Email */}
        <div 
          className="p-5 rounded-xl transition-all cursor-pointer group"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.primaryBlue;
            e.currentTarget.style.background = colors.badgeInfoBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.background = colors.inputBackground;
          }}
          onClick={onOpenEmailModal}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div 
                className="p-3 rounded-lg flex-shrink-0 mt-0.5"
                style={{ 
                  background: colors.badgeInfoBg,
                  border: `1px solid ${colors.badgeInfoBorder}`,
                }}
              >
                <Mail size={20} style={{ color: colors.primaryBlue }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 
                  className="font-semibold text-base mb-1"
                  style={{ color: colors.primaryText }}
                >
                  Login Email
                </h4>
                <p 
                  className="text-sm truncate mb-1"
                  style={{ color: colors.secondaryText }}
                  title={currentEmail}
                >
                  {currentEmail}
                </p>
                <p 
                  className="text-xs"
                  style={{ color: colors.tertiaryText }}
                >
                  Used to sign in to your account
                </p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onOpenEmailModal();
              }}
              className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
              style={{
                background: colors.primaryBlue,
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span>Update</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Password */}
        <div 
          className="p-5 rounded-xl transition-all cursor-pointer group"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.successGreen;
            e.currentTarget.style.background = colors.badgeSuccessBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.background = colors.inputBackground;
          }}
          onClick={onOpenPasswordModal}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div 
                className="p-3 rounded-lg flex-shrink-0 mt-0.5"
                style={{ 
                  background: colors.badgeSuccessBg,
                  border: `1px solid ${colors.badgeSuccessBorder}`,
                }}
              >
                <Lock size={20} style={{ color: colors.successGreen }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 
                  className="font-semibold text-base mb-1"
                  style={{ color: colors.primaryText }}
                >
                  Password
                </h4>
                <p 
                  className="text-sm mb-1"
                  style={{ color: colors.secondaryText }}
                >
                  ••••••••••••
                </p>
                <p 
                  className="text-xs"
                  style={{ color: colors.tertiaryText }}
                >
                  Change your password when you know your current password
                </p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onOpenPasswordModal();
              }}
              className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 flex-shrink-0"
              style={{
                background: colors.successGreen,
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span>Change</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: `1px solid ${colors.border}` }}></div>
          </div>
          <div className="relative flex justify-center">
            <span 
              className="px-3 text-xs font-medium"
              style={{ background: colors.cardBackground, color: colors.tertiaryText }}
            >
              OR
            </span>
          </div>
        </div>

        {/* Forgot Password Option */}
        <div 
          className="p-5 rounded-xl transition-all"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-lg flex-shrink-0"
              style={{ 
                background: colors.badgeWarningBg,
                border: `1px solid ${colors.badgeWarningBorder}`,
              }}
            >
              <HelpCircle size={20} style={{ color: colors.badgeWarningText }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 
                className="font-semibold text-base mb-1"
                style={{ color: colors.primaryText }}
              >
                Forgot Your Password?
              </h4>
              <p 
                className="text-sm mb-3 leading-relaxed"
                style={{ color: colors.secondaryText }}
              >
                If you've forgotten your password, we can help you reset it using a verification code sent to your registered email address.
              </p>
              <button 
                onClick={onOpenForgotFlow}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <Lock size={16} />
                <span>Reset Password</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </SecurityCard>
  );
};

