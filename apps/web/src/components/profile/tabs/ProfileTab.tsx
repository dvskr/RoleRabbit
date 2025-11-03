'use client';

import React from 'react';
import { UserCircle, Mail, Phone, MapPin, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import FormField from '../components/FormField';
import ProfilePicture from '../components/ProfilePicture';
import { UserData } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

interface ProfileTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
  onChangePhoto: () => void;
}

export default function ProfileTab({
  userData,
  isEditing,
  onUserDataChange,
  onChangePhoto
}: ProfileTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="max-w-5xl">
      <div className="space-y-4">
        {/* Enhanced Profile Picture */}
        <ProfilePicture
          firstName={userData.firstName}
          lastName={userData.lastName}
          profilePicture={userData.profilePicture}
          onChangePhoto={onChangePhoto}
        />

        {/* Enhanced Basic Information */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <UserCircle size={24} style={{ color: colors.primaryBlue }} />
            <h3 
              className="text-xl font-semibold"
              style={{ color: colors.primaryText }}
            >
              Basic Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormField
                label="First Name"
                value={userData.firstName}
                onChange={(value) => onUserDataChange({ firstName: value })}
                disabled={!isEditing}
                placeholder="Enter your first name"
              />
              {!userData.firstName && isEditing && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.errorRed }}>
                  <AlertCircle size={12} />
                  Required field
                </p>
              )}
            </div>
            <div>
              <FormField
                label="Last Name"
                value={userData.lastName}
                onChange={(value) => onUserDataChange({ lastName: value })}
                disabled={!isEditing}
                placeholder="Enter your last name"
              />
              {!userData.lastName && isEditing && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.errorRed }}>
                  <AlertCircle size={12} />
                  Required field
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <FormField
                label={
                  <span className="flex items-center gap-2">
                    <Mail size={16} style={{ color: colors.secondaryText }} />
                    Email Address
                  </span>
                }
                type="email"
                value={userData.email}
                onChange={(value) => onUserDataChange({ email: value })}
                disabled={!isEditing}
                placeholder="Enter your email address"
              />
              {!userData.email && isEditing && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.errorRed }}>
                  <AlertCircle size={12} />
                  Required field
                </p>
              )}
            </div>
            <div>
              <FormField
                label={
                  <span className="flex items-center gap-2">
                    <Phone size={16} style={{ color: colors.secondaryText }} />
                    Phone Number
                  </span>
                }
                type="tel"
                value={userData.phone}
                onChange={(value) => onUserDataChange({ phone: value })}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="mt-6">
            <FormField
              label={
                <span className="flex items-center gap-2">
                  <MapPin size={16} style={{ color: colors.secondaryText }} />
                  Location
                </span>
              }
              value={userData.location}
              onChange={(value) => onUserDataChange({ location: value })}
              disabled={!isEditing}
              placeholder="Enter your location (City, Country)"
            />
          </div>
        </div>

        {/* Enhanced Bio Section */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <FileText size={24} style={{ color: colors.primaryBlue }} />
            <h3 
              className="text-xl font-semibold"
              style={{ color: colors.primaryText }}
            >
              Professional Bio
            </h3>
          </div>
          <div className="space-y-3">
            <FormField
              label="Tell us about yourself"
              type="textarea"
              value={userData.bio || ''}
              onChange={(value) => onUserDataChange({ bio: value })}
              disabled={!isEditing}
              rows={5}
              placeholder="Write a compelling bio that highlights your experience, skills, and career goals. Aim for 50-500 characters for best results..."
            />
            <div className="space-y-2">
              <div 
                className="flex justify-between items-center text-sm"
                style={{ color: colors.tertiaryText }}
              >
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} style={{ color: colors.secondaryText }} />
                  This will be visible to recruiters and potential employers
                </span>
                <span 
                  className={`font-medium ${
                    (userData.bio || '').length > 500 ? 'text-red-500' : 
                    (userData.bio || '').length >= 50 ? 'text-green-500' : ''
                  }`}
                >
                  {(userData.bio || '').length}/500 characters
                </span>
              </div>
              {(userData.bio || '').length > 0 && (userData.bio || '').length < 50 && isEditing && (
                <div 
                  className="p-3 rounded-lg flex items-start gap-2"
                  style={{
                    background: colors.badgeWarningBg,
                    border: `1px solid ${colors.badgeWarningBorder}`,
                  }}
                >
                  <AlertCircle size={16} style={{ color: colors.badgeWarningText, flexShrink: 0, marginTop: '2px' }} />
                  <p className="text-xs" style={{ color: colors.badgeWarningText }}>
                    Consider expanding your bio to at least 50 characters to better showcase your expertise. A compelling bio helps recruiters understand your value proposition.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
