'use client';

import React from 'react';
import { PrivacySettingsSectionProps } from '../types';
import { SecurityCard } from './SecurityCard';

export const PrivacySettingsSection: React.FC<PrivacySettingsSectionProps> = ({
  colors,
  profileVisibility,
  onProfileVisibilityChange,
  showContactInfo,
  onContactInfoChange,
}) => {
  return (
    <SecurityCard colors={colors} title="Privacy Settings">
      <div className="space-y-4">
        {/* Profile Visibility */}
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
            onChange={(e) => onProfileVisibilityChange(e.target.value as typeof profileVisibility)}
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
            aria-label="Profile Visibility"
            title="Select profile visibility"
          >
            <option value="public" style={{ background: colors.background, color: colors.secondaryText }}>Public</option>
            <option value="recruiters" style={{ background: colors.background, color: colors.secondaryText }}>Recruiters Only</option>
            <option value="private" style={{ background: colors.background, color: colors.secondaryText }}>Private</option>
          </select>
        </div>
        
        {/* Contact Information */}
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
              onChange={(e) => onContactInfoChange(e.target.checked)}
              aria-label="Show contact information to recruiters"
              title={showContactInfo ? 'Hide contact information' : 'Show contact information'}
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
    </SecurityCard>
  );
};

