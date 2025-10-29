'use client';

import React from 'react';
import { Award, Globe, Trash2 } from 'lucide-react';
import { UserData, Skill, Certification } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

interface SkillsTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function SkillsTab({
  userData,
  isEditing,
  onUserDataChange
}: SkillsTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const addSkill = (skillName: string) => {
    const skill: Skill = {
      name: skillName,
      proficiency: 'Beginner',
      verified: false
    };
    if (skillName && !userData.skills.some(s => s.name === skillName)) {
      onUserDataChange({ skills: [...userData.skills, skill] });
    }
  };

  const removeSkill = (index: number) => {
    onUserDataChange({ skills: userData.skills.filter((_, i) => i !== index) });
  };

  const addCertification = (certName: string) => {
    const cert: Certification = {
      name: certName,
      issuer: '',
      date: new Date().toISOString().split('T')[0],
      verified: false
    };
    if (certName && !userData.certifications.some(c => c.name === certName)) {
      onUserDataChange({ certifications: [...userData.certifications, cert] });
    }
  };

  const removeCertification = (index: number) => {
    onUserDataChange({ certifications: userData.certifications.filter((_, i) => i !== index) });
  };

  const addLanguage = (langName: string) => {
    const lang = {
      name: langName,
      proficiency: 'Native'
    };
    if (langName && !userData.languages.some(l => l.name === langName)) {
      onUserDataChange({ languages: [...userData.languages, lang] });
    }
  };

  const removeLanguage = (index: number) => {
    onUserDataChange({ languages: userData.languages.filter((_, i) => i !== index) });
  };

  const getProficiencyBadgeStyle = (proficiency: string) => {
    switch (proficiency) {
      case 'Expert':
        return {
          background: colors.badgeSuccessBg,
          color: colors.badgeSuccessText,
          border: colors.badgeSuccessBorder,
        };
      case 'Advanced':
        return {
          background: colors.badgeInfoBg,
          color: colors.badgeInfoText,
          border: colors.badgeInfoBorder,
        };
      case 'Intermediate':
        return {
          background: colors.badgeWarningBg,
          color: colors.badgeWarningText,
          border: colors.badgeWarningBorder,
        };
      default:
        return {
          background: colors.badgeNeutralBg,
          color: colors.badgeNeutralText,
          border: colors.badgeNeutralBorder,
        };
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Skills & Expertise
        </h2>
        <p 
          style={{ color: colors.secondaryText }}
        >
          Showcase your technical skills, certifications, and language abilities
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Technical Skills */}
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
            Technical Skills
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {(userData.skills || []).map((skill, index) => {
              const badgeStyle = getProficiencyBadgeStyle(skill.proficiency);
              return (
                <div 
                  key={index} 
                  className="p-4 rounded-xl transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.inputBackground;
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="font-semibold"
                      style={{ color: colors.primaryText }}
                    >
                      {skill.name}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(index)}
                        className="transition-colors"
                        style={{ color: colors.errorRed }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.badgeErrorText;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colors.errorRed;
                        }}
                        aria-label={`Remove ${skill.name}`}
                        title={`Remove ${skill.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: badgeStyle.background,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`,
                      }}
                    >
                      {skill.proficiency}
                    </span>
                    {skill.yearsOfExperience && (
                      <span 
                        className="text-xs"
                        style={{ color: colors.secondaryText }}
                      >
                        {skill.yearsOfExperience} years
                      </span>
                    )}
                    {skill.verified && (
                      <span 
                        className="ml-auto text-xs flex items-center gap-1"
                        style={{ color: colors.badgeInfoText }}
                      >
                        <Award size={12} /> Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {isEditing && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add a technical skill"
                className="flex-1 px-4 py-3 rounded-xl transition-all duration-200"
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const skill = target.value.trim();
                    addSkill(skill);
                    target.value = '';
                  }
                }}
              />
              <button 
                className="px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryBlueHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.primaryBlue;
                }}
              >
                Add Skill
              </button>
            </div>
          )}
        </div>

        {/* Certifications */}
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
            Certifications
          </h3>
          <div className="space-y-4">
            {(userData.certifications || []).map((cert, index) => (
              <div 
                key={index} 
                className="p-4 rounded-xl transition-all"
                style={{
                  background: colors.badgeWarningBg,
                  border: `1px solid ${colors.badgeWarningBorder}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.badgeWarningBorder;
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{
                      background: colors.badgeWarningBg,
                    }}
                  >
                    <Award size={20} style={{ color: colors.badgeWarningText }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 
                        className="font-semibold"
                        style={{ color: colors.primaryText }}
                      >
                        {cert.name}
                      </h4>
                      {isEditing && (
                        <button
                          onClick={() => removeCertification(index)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: colors.errorRed }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.badgeErrorBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                          aria-label={`Remove ${cert.name}`}
                          title={`Remove ${cert.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <p 
                      className="text-sm"
                      style={{ color: colors.secondaryText }}
                    >
                      {cert.issuer}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span 
                        className="text-xs"
                        style={{ color: colors.tertiaryText }}
                      >
                        {cert.date}
                      </span>
                      {cert.verified && (
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            background: colors.badgeSuccessBg,
                            color: colors.badgeSuccessText,
                            border: `1px solid ${colors.badgeSuccessBorder}`,
                          }}
                        >
                          Verified
                        </span>
                      )}
                      {cert.credentialUrl && (
                        <a 
                          href={cert.credentialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs hover:underline"
                          style={{ color: colors.primaryBlue }}
                        >
                          View Credential
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-3 mt-4">
              <input
                type="text"
                placeholder="Add certification"
                className="flex-1 px-4 py-3 rounded-xl transition-all duration-200"
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const cert = target.value.trim();
                    addCertification(cert);
                    target.value = '';
                  }
                }}
              />
              <button 
                className="px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{
                  background: colors.badgeWarningText,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Add Certification
              </button>
            </div>
          )}
        </div>

        {/* Languages */}
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
            Languages
          </h3>
          <div className="space-y-4">
            {(userData.languages || []).map((lang, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 rounded-xl transition-all"
                style={{
                  background: colors.badgeSuccessBg,
                  border: `1px solid ${colors.badgeSuccessBorder}`,
                }}
              >
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    background: colors.badgeSuccessBg,
                  }}
                >
                  <Globe size={20} style={{ color: colors.badgeSuccessText }} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span 
                    className="font-medium"
                    style={{ color: colors.primaryText }}
                  >
                    {lang.name}
                  </span>
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: colors.badgeSuccessBg,
                      color: colors.badgeSuccessText,
                      border: `1px solid ${colors.badgeSuccessBorder}`,
                    }}
                  >
                    {lang.proficiency}
                  </span>
                </div>
                {isEditing && (
                  <button
                    onClick={() => removeLanguage(index)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: colors.errorRed }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.badgeErrorBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    aria-label={`Remove ${lang.name}`}
                    title={`Remove ${lang.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-3 mt-4">
              <input
                type="text"
                placeholder="Add language"
                className="flex-1 px-4 py-3 rounded-xl transition-all duration-200"
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const lang = target.value.trim();
                    addLanguage(lang);
                    target.value = '';
                  }
                }}
              />
              <button 
                className="px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                Add Language
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
