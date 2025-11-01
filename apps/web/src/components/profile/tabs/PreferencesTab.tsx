'use client';

import React from 'react';
import { Bell, Shield, CheckCircle, Mail, MessageSquare, Eye, EyeOff, Settings } from 'lucide-react';
import { UserData } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

interface PreferencesTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function PreferencesTab({
  userData,
  isEditing,
  onUserDataChange
}: PreferencesTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Calculate notification preferences summary
  const enabledNotifications = [
    userData.jobAlerts && 'Job Alerts',
    userData.emailNotifications && 'Email',
    userData.smsNotifications && 'SMS'
  ].filter(Boolean).length;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Preferences & Settings
        </h2>
        <p 
          style={{ color: colors.secondaryText }}
        >
          Manage your notification and privacy preferences
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Preferences Summary */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} style={{ color: colors.primaryBlue }} />
            <h3 
              className="text-lg font-semibold"
              style={{ color: colors.primaryText }}
            >
              Current Settings
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold mb-1" style={{ color: enabledNotifications > 0 ? colors.successGreen : colors.tertiaryText }}>
                {enabledNotifications}/3
              </div>
              <div className="text-xs" style={{ color: colors.secondaryText }}>Notifications</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1" style={{ color: colors.badgeInfoText }}>
                {userData.profileVisibility || 'Public'}
              </div>
              <div className="text-xs" style={{ color: colors.secondaryText }}>Visibility</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1" style={{ color: colors.badgePurpleText }}>
                {userData.privacyLevel || 'Professional'}
              </div>
              <div className="text-xs" style={{ color: colors.secondaryText }}>Privacy Level</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold mb-1" style={{ color: userData.jobAlerts ? colors.successGreen : colors.tertiaryText }}>
                {userData.jobAlerts ? '✓' : '—'}
              </div>
              <div className="text-xs" style={{ color: colors.secondaryText }}>Job Alerts</div>
            </div>
          </div>
        </div>
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Bell size={24} style={{ color: colors.primaryBlue }} />
            <h3 
              className="text-xl font-semibold"
              style={{ color: colors.primaryText }}
            >
              Notification Preferences
            </h3>
          </div>
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between p-5 rounded-xl transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${userData.jobAlerts ? colors.borderFocused : colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (isEditing) {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = userData.jobAlerts ? colors.borderFocused : colors.border;
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    background: userData.jobAlerts ? colors.badgeSuccessBg : colors.inputBackground,
                  }}
                >
                  <Bell size={18} style={{ color: userData.jobAlerts ? colors.successGreen : colors.secondaryText }} />
                </div>
                <div>
                  <p 
                    className="font-semibold flex items-center gap-2"
                    style={{ color: colors.primaryText }}
                  >
                    Job Alerts
                    {userData.jobAlerts && (
                      <CheckCircle size={14} style={{ color: colors.successGreen }} />
                    )}
                  </p>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: colors.secondaryText }}
                  >
                    Receive notifications about new job opportunities matching your profile
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={userData.jobAlerts || false}
                  onChange={(e) => onUserDataChange({ jobAlerts: e.target.checked })}
                  disabled={!isEditing}
                />
                <div 
                  className="w-11 h-6 rounded-full relative transition-all duration-200"
                  style={{
                    background: userData.jobAlerts ? colors.successGreen : colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all duration-200 bg-white shadow-sm"
                    style={{
                      transform: userData.jobAlerts ? 'translateX(20px)' : 'translateX(0)',
                    }}
                  />
                </div>
              </label>
            </div>
            
            <div 
              className="flex items-center justify-between p-5 rounded-xl transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${userData.emailNotifications ? colors.borderFocused : colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (isEditing) {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = userData.emailNotifications ? colors.borderFocused : colors.border;
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    background: userData.emailNotifications ? colors.badgeInfoBg : colors.inputBackground,
                  }}
                >
                  <Mail size={18} style={{ color: userData.emailNotifications ? colors.primaryBlue : colors.secondaryText }} />
                </div>
                <div>
                  <p 
                    className="font-semibold flex items-center gap-2"
                    style={{ color: colors.primaryText }}
                  >
                    Email Notifications
                    {userData.emailNotifications && (
                      <CheckCircle size={14} style={{ color: colors.successGreen }} />
                    )}
                  </p>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: colors.secondaryText }}
                  >
                    Receive important updates and alerts via email
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={userData.emailNotifications || false}
                  onChange={(e) => onUserDataChange({ emailNotifications: e.target.checked })}
                  disabled={!isEditing}
                />
                <div 
                  className="w-11 h-6 rounded-full relative transition-all duration-200"
                  style={{
                    background: userData.emailNotifications ? colors.primaryBlue : colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all duration-200 bg-white shadow-sm"
                    style={{
                      transform: userData.emailNotifications ? 'translateX(20px)' : 'translateX(0)',
                    }}
                  />
                </div>
              </label>
            </div>
            
            <div 
              className="flex items-center justify-between p-5 rounded-xl transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${userData.smsNotifications ? colors.borderFocused : colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (isEditing) {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = userData.smsNotifications ? colors.borderFocused : colors.border;
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    background: userData.smsNotifications ? colors.badgeWarningBg : colors.inputBackground,
                  }}
                >
                  <MessageSquare size={18} style={{ color: userData.smsNotifications ? colors.badgeWarningText : colors.secondaryText }} />
                </div>
                <div>
                  <p 
                    className="font-semibold flex items-center gap-2"
                    style={{ color: colors.primaryText }}
                  >
                    SMS Notifications
                    {userData.smsNotifications && (
                      <CheckCircle size={14} style={{ color: colors.successGreen }} />
                    )}
                  </p>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: colors.secondaryText }}
                  >
                    Receive time-sensitive updates via SMS (requires phone number)
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={userData.smsNotifications || false}
                  onChange={(e) => onUserDataChange({ smsNotifications: e.target.checked })}
                  disabled={!isEditing}
                />
                <div 
                  className="w-11 h-6 rounded-full relative transition-all duration-200"
                  style={{
                    background: userData.smsNotifications ? colors.badgeWarningText : colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div
                    className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-all duration-200 bg-white shadow-sm"
                    style={{
                      transform: userData.smsNotifications ? 'translateX(20px)' : 'translateX(0)',
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield size={24} style={{ color: colors.badgeInfoText }} />
            <h3 
              className="text-xl font-semibold"
              style={{ color: colors.primaryText }}
            >
              Privacy Settings
            </h3>
          </div>
          <div className="space-y-4">
            <div 
              className="p-5 rounded-xl transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (isEditing) {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                {userData.profileVisibility === 'Public' ? (
                  <Eye size={18} style={{ color: colors.badgeInfoText }} />
                ) : (
                  <EyeOff size={18} style={{ color: colors.secondaryText }} />
                )}
                <div className="flex-1">
                  <p 
                    className="font-semibold"
                    style={{ color: colors.primaryText }}
                  >
                    Profile Visibility
                  </p>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: colors.secondaryText }}
                  >
                    Control who can see your profile and information
                  </p>
                </div>
              </div>
              <select 
                value={userData.profileVisibility || 'Public'}
                onChange={(e) => onUserDataChange({ profileVisibility: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-lg transition-all"
                style={{
                  background: colors.cardBackground,
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
                <option value="Public" style={{ background: colors.background, color: colors.secondaryText }}>Public - Visible to everyone</option>
                <option value="Recruiters Only" style={{ background: colors.background, color: colors.secondaryText }}>Recruiters Only - Visible to verified recruiters</option>
                <option value="Private" style={{ background: colors.background, color: colors.secondaryText }}>Private - Only you can see</option>
              </select>
            </div>
            
            <div 
              className="p-5 rounded-xl transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                if (isEditing) {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield size={18} style={{ color: colors.badgePurpleText }} />
                <div className="flex-1">
                  <p 
                    className="font-semibold"
                    style={{ color: colors.primaryText }}
                  >
                    Privacy Level
                  </p>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: colors.secondaryText }}
                  >
                    Control how much profile information is shared with recruiters
                  </p>
                </div>
              </div>
              <select 
                value={userData.privacyLevel || 'Professional'}
                onChange={(e) => onUserDataChange({ privacyLevel: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-lg transition-all"
                style={{
                  background: colors.cardBackground,
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
                <option value="Professional" style={{ background: colors.background, color: colors.secondaryText }}>Professional - Share full profile</option>
                <option value="Limited" style={{ background: colors.background, color: colors.secondaryText }}>Limited - Share basic info only</option>
                <option value="Minimal" style={{ background: colors.background, color: colors.secondaryText }}>Minimal - Share contact info only</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
