'use client';

import React, { useState } from 'react';
import { Lock, Key, CheckCircle, Smartphone, X, Eye, EyeOff, Shield, LogOut } from 'lucide-react';
import { logger } from '../../../utils/logger';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SecurityTab() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showContactInfo, setShowContactInfo] = useState(true);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  // 2FA state
  const [twoFACode, setTwoFACode] = useState('');
  const [show2FACode, setShow2FACode] = useState(false);

  const handlePasswordChange = () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      logger.debug('All password fields required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      logger.debug('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      logger.debug('Password must be at least 8 characters');
      return;
    }

    // Simulate password change
    logger.debug('Changing password...');
    setTimeout(() => {
      logger.debug('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      });
    }, 1000);
  };

  const handleEnable2FA = async () => {
    console.log('Toggle clicked, current state:', twoFAEnabled);
    
    if (twoFAEnabled) {
      // Disable 2FA
      try {
        const response = await fetch('http://localhost:3001/api/auth/2fa/disable', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            password: 'currentPassword', 
            twoFactorToken: '999999' 
          })
        });
        if (response.ok) {
          setTwoFAEnabled(false);
        }
      } catch (error) {
        console.error('Failed to disable 2FA:', error);
        alert('Failed to disable 2FA. Please try again.');
      }
    } else {
      // Enable 2FA - Show modal first
      try {
        const response = await fetch('http://localhost:3001/api/auth/2fa/setup', {
          method: 'POST',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('2FA Setup data:', data);
          setShow2FAModal(true);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to setup 2FA:', response.statusText, errorData);
          alert(`Failed to setup 2FA: ${errorData.error || response.statusText}`);
        }
      } catch (error) {
        console.error('2FA setup failed:', error);
        alert('Failed to setup 2FA. Is the API server running on port 3001?');
      }
    }
  };

  const handleVerify2FA = async () => {
    if (twoFACode.length === 6) {
      logger.debug('Verifying 2FA code...');
      setTimeout(() => {
        setTwoFAEnabled(true);
        setShow2FAModal(false);
        setTwoFACode('');
        logger.debug('2FA enabled successfully');
      }, 1000);
    }
  };

  const handleLogoutSession = (sessionId: string) => {
    logger.debug('Logging out session:', sessionId);
    // In real app, this would revoke the session
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Security Settings
        </h2>
        <p 
          style={{ color: colors.secondaryText }}
        >
          Manage your account security and privacy settings
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Password Management */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Password & Authentication
          </h3>
          <div className="space-y-6">
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
                    Last changed 3 months ago
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPasswordModal(true)}
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
                onClick={handleEnable2FA}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                style={{
                  background: twoFAEnabled ? colors.successGreen : colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
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
        </div>

        {/* Login Activity */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Recent Login Activity
          </h3>
          <div className="space-y-4">
            <div 
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div 
                className="p-2 rounded-lg"
                style={{ background: colors.badgeSuccessBg }}
              >
                <CheckCircle size={16} style={{ color: colors.successGreen }} />
              </div>
              <div className="flex-1">
                <p 
                  className="font-medium"
                  style={{ color: colors.primaryText }}
                >
                  Current Session
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  Chrome on Windows • San Francisco, CA
                </p>
              </div>
              <span 
                className="text-sm font-medium"
                style={{ color: colors.successGreen }}
              >
                Active
              </span>
            </div>
            
            <div 
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div 
                className="p-2 rounded-lg"
                style={{ background: colors.inputBackground }}
              >
                <Smartphone size={16} style={{ color: colors.tertiaryText }} />
              </div>
              <div className="flex-1">
                <p 
                  className="font-medium"
                  style={{ color: colors.primaryText }}
                >
                  Mobile App
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  iOS Safari • San Francisco, CA
                </p>
              </div>
              <span 
                className="text-sm"
                style={{ color: colors.tertiaryText }}
              >
                2 hours ago
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Privacy Settings
          </h3>
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div>
                <p 
                  className="font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  Profile Visibility
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  Control who can see your profile
                </p>
              </div>
              <select 
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="px-3 py-2 rounded-lg transition-all"
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
              >
                <option value="public" style={{ background: colors.background, color: colors.secondaryText }}>Public</option>
                <option value="recruiters" style={{ background: colors.background, color: colors.secondaryText }}>Recruiters Only</option>
                <option value="private" style={{ background: colors.background, color: colors.secondaryText }}>Private</option>
              </select>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 rounded-xl"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div>
                <p 
                  className="font-semibold"
                  style={{ color: colors.primaryText }}
                >
                  Contact Information
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  Show contact details to recruiters
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={showContactInfo}
                  onChange={(e) => setShowContactInfo(e.target.checked)}
                />
                <div 
                  className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    background: showContactInfo ? colors.primaryBlue : colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-md"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
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

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={passwordData.showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 rounded-lg transition-all"
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
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordData(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                    style={{ color: colors.tertiaryText }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.primaryText;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.tertiaryText;
                    }}
                  >
                    {passwordData.showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={passwordData.showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 rounded-lg transition-all"
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
                    placeholder="Enter new password (min. 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordData(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                    style={{ color: colors.tertiaryText }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.primaryText;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.tertiaryText;
                    }}
                  >
                    {passwordData.showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={passwordData.showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 rounded-lg transition-all"
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
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                    style={{ color: colors.tertiaryText }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.primaryText;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.tertiaryText;
                    }}
                  >
                    {passwordData.showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

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
                    <li>At least 8 characters</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Include at least one number</li>
                  </ul>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
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
                onClick={handlePasswordChange}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) 
                    ? colors.inputBackground 
                    : colors.successGreen,
                  color: (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) 
                    ? colors.tertiaryText 
                    : 'white',
                  opacity: (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) ? 0.5 : 1,
                  cursor: (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-md"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
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
                onClick={() => setShow2FAModal(false)}
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
                    value={twoFACode}
                    onChange={(e) => {
                      const code = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setTwoFACode(code);
                    }}
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
                onClick={() => setShow2FAModal(false)}
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
                onClick={handleVerify2FA}
                disabled={twoFACode.length !== 6}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: twoFACode.length !== 6 ? colors.inputBackground : colors.primaryBlue,
                  color: twoFACode.length !== 6 ? colors.tertiaryText : 'white',
                  opacity: twoFACode.length !== 6 ? 0.5 : 1,
                  cursor: twoFACode.length !== 6 ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (twoFACode.length === 6) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (twoFACode.length === 6) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                Verify & Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
