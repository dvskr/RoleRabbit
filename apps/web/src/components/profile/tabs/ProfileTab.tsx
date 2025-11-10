'use client';

import React from 'react';
import { UserCircle, Mail, Phone, MapPin, AlertCircle, Linkedin, Github, Link2, Globe } from 'lucide-react';
import FormField from '../components/FormField';
import ProfilePicture from '../components/ProfilePicture';
import { SocialLinkField } from '../components/SocialLinkField';
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
                id="profile-first-name"
                name="firstName"
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
                id="profile-last-name"
                name="lastName"
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
                id="profile-email"
                name="email"
                label={
                  <span className="flex items-center gap-2">
                    <Mail size={16} style={{ color: colors.secondaryText }} />
                    Login Email (Username)
                  </span>
                }
                type="email"
                value={userData.email}
                onChange={() => {}} // Read-only, cannot be changed
                disabled={true}
                placeholder="Login email"
              />
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.secondaryText }}>
                <AlertCircle size={12} />
                This is your login email and cannot be changed
              </p>
            </div>
            <div>
              <FormField
                id="profile-personal-email"
                name="personalEmail"
                label={
                  <span className="flex items-center gap-2">
                    <Mail size={16} style={{ color: colors.secondaryText }} />
                    Personal Email
                  </span>
                }
                type="email"
                value={userData.personalEmail || ''}
                onChange={(value) => onUserDataChange({ personalEmail: value })}
                disabled={!isEditing}
                placeholder="Enter your personal/contact email"
              />
              <p className="text-xs mt-1" style={{ color: colors.secondaryText }}>
                Optional: Your personal or contact email (different from login email)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <FormField
                id="profile-phone"
                name="phone"
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
            <div>
              <FormField
                id="profile-location"
                name="location"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <SocialLinkField
              label="LinkedIn"
              icon={Linkedin}
              value={userData.linkedin}
              isEditing={isEditing}
              colors={colors}
              onChange={(value) => onUserDataChange({ linkedin: value })}
              placeholder="https://linkedin.com/in/yourname"
              fieldId="profile-linkedin"
              fieldName="linkedin"
            />
            <SocialLinkField
              label="GitHub"
              icon={Github}
              value={userData.github}
              isEditing={isEditing}
              colors={colors}
              onChange={(value) => onUserDataChange({ github: value })}
              placeholder="https://github.com/username"
              fieldId="profile-github"
              fieldName="github"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <SocialLinkField
              label="Portfolio URL"
              icon={Link2}
              value={userData.portfolio}
              isEditing={isEditing}
              colors={colors}
              onChange={(value) => onUserDataChange({ portfolio: value })}
              placeholder="https://yourportfolio.com"
              fieldId="profile-portfolio"
              fieldName="portfolio"
            />
            <SocialLinkField
              label="Personal Website"
              icon={Globe}
              value={userData.website}
              isEditing={isEditing}
              colors={colors}
              onChange={(value) => onUserDataChange({ website: value })}
              placeholder="https://yourwebsite.com"
              fieldId="profile-website"
              fieldName="website"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
