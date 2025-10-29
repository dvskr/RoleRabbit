'use client';

import React from 'react';
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
      <div className="mb-4">
        <h2 
          className="text-2xl font-bold mb-1"
          style={{ color: colors.primaryText }}
        >
          Personal Information
        </h2>
        <p 
          className="text-sm"
          style={{ color: colors.secondaryText }}
        >
          Update your personal details and profile information
        </p>
      </div>
      
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
          className="backdrop-blur-sm rounded-xl p-4 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: colors.primaryText }}
          >
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              value={userData.firstName}
              onChange={(value) => onUserDataChange({ firstName: value })}
              disabled={!isEditing}
              placeholder="Enter your first name"
            />
            <FormField
              label="Last Name"
              value={userData.lastName}
              onChange={(value) => onUserDataChange({ lastName: value })}
              disabled={!isEditing}
              placeholder="Enter your last name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              label="Email Address"
              type="email"
              value={userData.email}
              onChange={(value) => onUserDataChange({ email: value })}
              disabled={!isEditing}
              placeholder="Enter your email address"
            />
            <FormField
              label="Phone Number"
              type="tel"
              value={userData.phone}
              onChange={(value) => onUserDataChange({ phone: value })}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="mt-6">
            <FormField
              label="Location"
              value={userData.location}
              onChange={(value) => onUserDataChange({ location: value })}
              disabled={!isEditing}
              placeholder="Enter your location"
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
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Professional Bio
          </h3>
          <div className="space-y-2">
            <FormField
              label="Tell us about yourself"
              type="textarea"
              value={userData.bio || ''}
              onChange={(value) => onUserDataChange({ bio: value })}
              disabled={!isEditing}
              rows={4}
              placeholder="Write a compelling bio that highlights your experience, skills, and career goals..."
            />
            <div 
              className="flex justify-between items-center text-sm"
              style={{ color: colors.tertiaryText }}
            >
              <span>This will be visible to recruiters and potential employers</span>
              <span>{(userData.bio || '').length}/500 characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
