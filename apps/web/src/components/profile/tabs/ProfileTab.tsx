'use client';

import React from 'react';
import { UserCircle, Mail, Phone, MapPin, AlertCircle, Linkedin, Github, Link2, Globe, ExternalLink } from 'lucide-react';
import FormField from '../components/FormField';
import ProfilePicture from '../components/ProfilePicture';
import { UserData } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

// Helper function to normalize URL for display and clicking
const normalizeUrl = (url: string | null | undefined): string | null => {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  // If it already has a protocol, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // If it starts with //, assume https
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  // Otherwise, prepend https://
  return `https://${trimmed}`;
};

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
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: colors.primaryText }}>
                <Linkedin size={16} style={{ color: colors.secondaryText }} />
                LinkedIn
              </label>
              {isEditing ? (
                <FormField
                  id="profile-linkedin"
                  name="linkedin"
                  label=""
                  type="url"
                  value={userData.linkedin || ''}
                  onChange={(value) => onUserDataChange({ linkedin: value })}
                  disabled={false}
                  placeholder="https://linkedin.com/in/yourname"
                />
              ) : userData.linkedin ? (
                <a
                  href={normalizeUrl(userData.linkedin) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryBlue,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primaryBlue;
                    e.currentTarget.style.background = colors.badgeInfoBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.inputBackground;
                  }}
                >
                  <span className="flex-1 truncate">{userData.linkedin}</span>
                  <ExternalLink size={14} />
                </a>
              ) : (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: colors.inputBackground, border: `1px solid ${colors.border}`, color: colors.tertiaryText }}>
                  No LinkedIn URL provided
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: colors.primaryText }}>
                <Github size={16} style={{ color: colors.secondaryText }} />
                GitHub
              </label>
              {isEditing ? (
                <FormField
                  id="profile-github"
                  name="github"
                  label=""
                  type="url"
                  value={userData.github || ''}
                  onChange={(value) => onUserDataChange({ github: value })}
                  disabled={false}
                  placeholder="https://github.com/username"
                />
              ) : userData.github ? (
                <a
                  href={normalizeUrl(userData.github) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryBlue,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primaryBlue;
                    e.currentTarget.style.background = colors.badgeInfoBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.inputBackground;
                  }}
                >
                  <span className="flex-1 truncate">{userData.github}</span>
                  <ExternalLink size={14} />
                </a>
              ) : (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: colors.inputBackground, border: `1px solid ${colors.border}`, color: colors.tertiaryText }}>
                  No GitHub URL provided
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: colors.primaryText }}>
                <Link2 size={16} style={{ color: colors.secondaryText }} />
                Portfolio URL
              </label>
              {isEditing ? (
                <FormField
                  id="profile-portfolio"
                  name="portfolio"
                  label=""
                  type="url"
                  value={userData.portfolio || ''}
                  onChange={(value) => onUserDataChange({ portfolio: value })}
                  disabled={false}
                  placeholder="https://yourportfolio.com"
                />
              ) : userData.portfolio ? (
                <a
                  href={normalizeUrl(userData.portfolio) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryBlue,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primaryBlue;
                    e.currentTarget.style.background = colors.badgeInfoBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.inputBackground;
                  }}
                >
                  <span className="flex-1 truncate">{userData.portfolio}</span>
                  <ExternalLink size={14} />
                </a>
              ) : (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: colors.inputBackground, border: `1px solid ${colors.border}`, color: colors.tertiaryText }}>
                  No Portfolio URL provided
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: colors.primaryText }}>
                <Globe size={16} style={{ color: colors.secondaryText }} />
                Personal Website
              </label>
              {isEditing ? (
                <FormField
                  id="profile-website"
                  name="website"
                  label=""
                  type="url"
                  value={userData.website || ''}
                  onChange={(value) => onUserDataChange({ website: value })}
                  disabled={false}
                  placeholder="https://yourwebsite.com"
                />
              ) : userData.website ? (
                <a
                  href={normalizeUrl(userData.website) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryBlue,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primaryBlue;
                    e.currentTarget.style.background = colors.badgeInfoBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.inputBackground;
                  }}
                >
                  <span className="flex-1 truncate">{userData.website}</span>
                  <ExternalLink size={14} />
                </a>
              ) : (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: colors.inputBackground, border: `1px solid ${colors.border}`, color: colors.tertiaryText }}>
                  No Personal Website URL provided
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
