'use client';

import React from 'react';
import { UserCircle, Mail, Phone, MapPin, FileText, CheckCircle, AlertCircle } from 'lucide-react';
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

  // Calculate comprehensive profile completeness across all tabs
  const calculateCompleteness = (): number => {
    let completed = 0;
    const sections: { name: string; checked: boolean }[] = [];
    
    // Personal Information (8 points)
    const personalInfo = {
      firstName: !!userData.firstName,
      lastName: !!userData.lastName,
      email: !!userData.email,
      phone: !!userData.phone,
      location: !!userData.location,
      bio: !!(userData.bio && userData.bio.length > 50),
      profilePicture: !!userData.profilePicture,
      currentRole: !!userData.currentRole
    };
    
    const personalCompleted = Object.values(personalInfo).filter(Boolean).length;
    completed += personalCompleted;
    sections.push({ name: 'Personal Info', checked: personalCompleted >= 6 });
    
    // Helper function to safely parse JSON arrays
    const safeParseArray = (data: any): any[] => {
      if (Array.isArray(data)) return data;
      if (typeof data === 'string' && data) {
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };
    
    // Skills (1 point if at least 3 skills)
    const skills = safeParseArray(userData.skills);
    const hasSkills = skills.length >= 3;
    if (hasSkills) completed++;
    sections.push({ name: 'Skills', checked: hasSkills });
    
    // Certifications (1 point if at least 1)
    const certs = safeParseArray(userData.certifications);
    const hasCerts = certs.length >= 1;
    if (hasCerts) completed++;
    sections.push({ name: 'Certifications', checked: hasCerts });
    
    // Languages (1 point if at least 1)
    const languages = safeParseArray(userData.languages);
    const hasLanguages = languages.length >= 1;
    if (hasLanguages) completed++;
    sections.push({ name: 'Languages', checked: hasLanguages });
    
    // Work Experience (1 point if at least 1)
    const workExp = safeParseArray(userData.workExperiences);
    const hasWorkExp = workExp.length >= 1;
    if (hasWorkExp) completed++;
    sections.push({ name: 'Work Experience', checked: hasWorkExp });
    
    // Projects (1 point if at least 1)
    const projects = safeParseArray(userData.projects);
    const hasProjects = projects.length >= 1;
    if (hasProjects) completed++;
    sections.push({ name: 'Projects', checked: hasProjects });
    
    // Career Goals (1 point if at least 1)
    const careerGoals = safeParseArray(userData.careerGoals);
    const hasCareerGoals = careerGoals.length >= 1;
    if (hasCareerGoals) completed++;
    sections.push({ name: 'Career Goals', checked: hasCareerGoals });
    
    // Education (1 point if present)
    const education = safeParseArray(userData.education);
    const hasEducation = education.length >= 1;
    if (hasEducation) completed++;
    sections.push({ name: 'Education', checked: hasEducation });
    
    // Social Links (1 point if at least 1)
    const socialLinks = safeParseArray(userData.socialLinks);
    const hasSocialLinks = socialLinks.length >= 1;
    if (hasSocialLinks) completed++;
    sections.push({ name: 'Social Links', checked: hasSocialLinks });
    
    // Total: 8 (personal) + 8 (other sections) = 16 points max
    const total = 16;
    const percentage = Math.round((completed / total) * 100);
    
    return percentage;
  };

  const completeness = calculateCompleteness();
  const completenessColor = completeness >= 75 ? colors.successGreen : 
                           completeness >= 50 ? colors.badgeWarningText : 
                           colors.errorRed;

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 
            className="text-3xl font-bold mb-2"
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
        
        {/* Profile Completeness Indicator - Smaller, beside heading */}
        <div 
          className="backdrop-blur-sm rounded-xl p-3 shadow-lg ml-4 flex-shrink-0"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            minWidth: '140px',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} style={{ color: completenessColor }} />
              <span 
                className="text-xs font-semibold"
                style={{ color: colors.primaryText }}
              >
                Profile
              </span>
            </div>
            <span 
              className="text-sm font-bold"
              style={{ color: completenessColor }}
            >
              {completeness}%
            </span>
          </div>
          <div 
            className="w-full rounded-full h-1.5"
            style={{ background: colors.inputBackground }}
          >
            <div 
              className="h-1.5 rounded-full transition-all duration-1000"
              style={{ 
                width: `${completeness}%`,
                background: completeness >= 75 
                  ? `linear-gradient(90deg, ${colors.successGreen}, ${colors.badgeSuccessText})`
                  : completeness >= 50
                  ? `linear-gradient(90deg, ${colors.badgeWarningText}, ${colors.badgeWarningBorder})`
                  : `linear-gradient(90deg, ${colors.errorRed}, ${colors.badgeErrorText})`
              }}
            />
          </div>
        </div>
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
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} style={{ color: colors.secondaryText }} />
                <FormField
                  label="Email Address"
                  type="email"
                  value={userData.email}
                  onChange={(value) => onUserDataChange({ email: value })}
                  disabled={!isEditing}
                  placeholder="Enter your email address"
                />
              </div>
              {!userData.email && isEditing && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.errorRed }}>
                  <AlertCircle size={12} />
                  Required field
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone size={16} style={{ color: colors.secondaryText }} />
                <FormField
                  label="Phone Number"
                  type="tel"
                  value={userData.phone}
                  onChange={(value) => onUserDataChange({ phone: value })}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} style={{ color: colors.secondaryText }} />
              <FormField
                label="Location"
                value={userData.location}
                onChange={(value) => onUserDataChange({ location: value })}
                disabled={!isEditing}
                placeholder="Enter your location (City, Country)"
              />
            </div>
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
