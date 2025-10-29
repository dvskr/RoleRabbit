'use client';

import React from 'react';
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
      
      <div className="space-y-6">
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
            Notification Preferences
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
                  Job Alerts
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  Receive notifications about new job opportunities
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={userData.jobAlerts}
                  onChange={(e) => onUserDataChange({ jobAlerts: e.target.checked })}
                  disabled={!isEditing}
                />
                <div 
                  className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    background: userData.jobAlerts ? colors.primaryBlue : colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </label>
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
                  Email Notifications
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  Receive updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={userData.emailNotifications}
                  onChange={(e) => onUserDataChange({ emailNotifications: e.target.checked })}
                  disabled={!isEditing}
                />
                <div 
                  className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    background: userData.emailNotifications ? colors.primaryBlue : colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </label>
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
                  SMS Notifications
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  Receive updates via SMS
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={userData.smsNotifications}
                  onChange={(e) => onUserDataChange({ smsNotifications: e.target.checked })}
                  disabled={!isEditing}
                />
                <div 
                  className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    background: userData.smsNotifications ? colors.primaryBlue : colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                />
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
                value={userData.profileVisibility}
                onChange={(e) => onUserDataChange({ profileVisibility: e.target.value })}
                disabled={!isEditing}
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
                <option value="Public" style={{ background: colors.background, color: colors.secondaryText }}>Public</option>
                <option value="Recruiters Only" style={{ background: colors.background, color: colors.secondaryText }}>Recruiters Only</option>
                <option value="Private" style={{ background: colors.background, color: colors.secondaryText }}>Private</option>
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
                  Privacy Level
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.secondaryText }}
                >
                  Control how much information is shared
                </p>
              </div>
              <select 
                value={userData.privacyLevel}
                onChange={(e) => onUserDataChange({ privacyLevel: e.target.value })}
                disabled={!isEditing}
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
                <option value="Professional" style={{ background: colors.background, color: colors.secondaryText }}>Professional</option>
                <option value="Limited" style={{ background: colors.background, color: colors.secondaryText }}>Limited</option>
                <option value="Minimal" style={{ background: colors.background, color: colors.secondaryText }}>Minimal</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
