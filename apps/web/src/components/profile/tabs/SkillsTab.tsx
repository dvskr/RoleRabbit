'use client';

import React, { useState } from 'react';
import { Award, Globe, Trash2, Edit2, Save, X, TrendingUp, BarChart3, Plus, CheckCircle } from 'lucide-react';
import { UserData, Skill, Certification } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';
import FormField from '../components/FormField';

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
  
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [editingLangId, setEditingLangId] = useState<number | null>(null);
  
  // Normalize skills to always be an array
  const normalizeSkills = (skills: any): Skill[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) {
      return skills.map(skill => {
        if (typeof skill === 'string') {
          return { name: skill, proficiency: 'Beginner', verified: false };
        }
        return {
          name: skill.name || '',
          proficiency: skill.proficiency || 'Beginner',
          yearsOfExperience: skill.yearsOfExperience,
          verified: skill.verified || false
        };
      });
    }
    if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        return normalizeSkills(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const skills: Skill[] = normalizeSkills(userData.skills);
  
  const addSkill = (skillName: string) => {
    const skill: Skill = {
      name: skillName,
      proficiency: 'Beginner',
      verified: false
    };
    if (skillName && !skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      onUserDataChange({ skills: [...skills, skill] });
    }
  };

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const updated = skills.map((skill, i) => 
      i === index ? { ...skill, ...updates } : skill
    );
    onUserDataChange({ skills: updated });
  };

  const removeSkill = (index: number) => {
    onUserDataChange({ skills: skills.filter((_, i) => i !== index) });
  };

  // Normalize certifications to always be an array
  const normalizeCertifications = (certs: any): Certification[] => {
    if (!certs) return [];
    if (Array.isArray(certs)) {
      return certs.map(cert => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || new Date().toISOString().split('T')[0],
        expiryDate: cert.expiryDate || null,
        credentialUrl: cert.credentialUrl || null,
        verified: cert.verified || false
      }));
    }
    if (typeof certs === 'string') {
      try {
        const parsed = JSON.parse(certs);
        return normalizeCertifications(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const certifications: Certification[] = normalizeCertifications(userData.certifications);
  
  const addCertification = () => {
    const cert: Certification = {
      name: '',
      issuer: '',
      date: new Date().toISOString().split('T')[0],
      verified: false
    };
    onUserDataChange({ certifications: [...certifications, cert] });
    setEditingCertId(certifications.length);
  };

  const updateCertification = (index: number, updates: Partial<Certification>) => {
    const updated = certifications.map((cert, i) => 
      i === index ? { ...cert, ...updates } : cert
    );
    onUserDataChange({ certifications: updated });
  };

  const removeCertification = (index: number) => {
    onUserDataChange({ certifications: certifications.filter((_, i) => i !== index) });
    setEditingCertId(null);
  };

  // Normalize languages to always be an array
  const normalizeLanguages = (langs: any): any[] => {
    if (!langs) return [];
    if (Array.isArray(langs)) {
      return langs.map(lang => ({
        name: lang.name || '',
        proficiency: lang.proficiency || 'Native'
      }));
    }
    if (typeof langs === 'string') {
      try {
        const parsed = JSON.parse(langs);
        return normalizeLanguages(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const languages = normalizeLanguages(userData.languages);
  
  const addLanguage = (langName: string) => {
    const lang = {
      name: langName,
      proficiency: 'Native'
    };
    if (langName && !languages.some(l => l.name.toLowerCase() === langName.toLowerCase())) {
      onUserDataChange({ languages: [...languages, lang] });
    }
  };

  const updateLanguage = (index: number, updates: Partial<{ name: string; proficiency: string }>) => {
    const updated = languages.map((lang, i) => 
      i === index ? { ...lang, ...updates } : lang
    );
    onUserDataChange({ languages: updated });
  };

  const removeLanguage = (index: number) => {
    onUserDataChange({ languages: languages.filter((_, i) => i !== index) });
    setEditingLangId(null);
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

  const getProficiencyValue = (proficiency: string): number => {
    switch (proficiency) {
      case 'Expert': return 100;
      case 'Advanced': return 75;
      case 'Intermediate': return 50;
      case 'Beginner': return 25;
      default: return 25;
    }
  };

  const getLanguageProficiencyValue = (proficiency: string): number => {
    switch (proficiency) {
      case 'Native': return 100;
      case 'Fluent': return 90;
      case 'Conversational': return 70;
      case 'Basic': return 40;
      default: return 40;
    }
  };

  // Statistics
  const skillStats = {
    total: skills.length,
    expert: skills.filter(s => s.proficiency === 'Expert').length,
    advanced: skills.filter(s => s.proficiency === 'Advanced').length,
    verified: skills.filter(s => s.verified).length,
    avgExperience: skills.filter(s => s.yearsOfExperience).reduce((sum, s) => sum + (s.yearsOfExperience || 0), 0) / skills.filter(s => s.yearsOfExperience).length || 0
  };

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const languageLevels = ['Basic', 'Conversational', 'Fluent', 'Native'];

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
        {/* Statistics Summary */}
        {skills.length > 0 && (
          <div 
            className="backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} style={{ color: colors.primaryBlue }} />
              <h3 
                className="text-lg font-semibold"
                style={{ color: colors.primaryText }}
              >
                Skills Overview
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: colors.primaryBlue }}>
                  {skillStats.total}
                </div>
                <div className="text-xs" style={{ color: colors.secondaryText }}>Total Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: colors.successGreen }}>
                  {skillStats.expert + skillStats.advanced}
                </div>
                <div className="text-xs" style={{ color: colors.secondaryText }}>Advanced+</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: colors.badgeInfoText }}>
                  {skillStats.verified}
                </div>
                <div className="text-xs" style={{ color: colors.secondaryText }}>Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: colors.badgeWarningText }}>
                  {skillStats.avgExperience > 0 ? `${skillStats.avgExperience.toFixed(1)}` : 'N/A'}
                </div>
                <div className="text-xs" style={{ color: colors.secondaryText }}>Avg Years</div>
              </div>
            </div>
          </div>
        )}

        {/* Technical Skills */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
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
              Technical Skills
            </h3>
            {isEditing && skills.length === 0 && (
              <span className="text-sm" style={{ color: colors.secondaryText }}>
                Add your first skill to get started
              </span>
            )}
          </div>
          
          {skills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {skills.map((skill, index) => {
                const badgeStyle = getProficiencyBadgeStyle(skill.proficiency);
                const isEditing = editingSkillId === index;
                
                return (
                  <div 
                    key={index} 
                    className="p-4 rounded-xl transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!isEditing) {
                        e.currentTarget.style.background = colors.hoverBackground;
                        e.currentTarget.style.borderColor = colors.borderFocused;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isEditing) {
                        e.currentTarget.style.background = colors.inputBackground;
                        e.currentTarget.style.borderColor = colors.border;
                      }
                    }}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold" style={{ color: colors.primaryText }}>Edit Skill</h4>
                          <button
                            onClick={() => setEditingSkillId(null)}
                            className="p-1 rounded"
                            style={{ color: colors.secondaryText }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => updateSkill(index, { name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg"
                          style={{
                            background: colors.cardBackground,
                            border: `1px solid ${colors.border}`,
                            color: colors.primaryText,
                          }}
                          placeholder="Skill name"
                        />
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.secondaryText }}>
                            Proficiency Level
                          </label>
                          <select
                            value={skill.proficiency}
                            onChange={(e) => updateSkill(index, { proficiency: e.target.value as Skill['proficiency'] })}
                            className="w-full px-3 py-2 rounded-lg"
                            style={{
                              background: colors.cardBackground,
                              border: `1px solid ${colors.border}`,
                              color: colors.primaryText,
                            }}
                          >
                            {proficiencyLevels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.secondaryText }}>
                            Years of Experience (optional)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={skill.yearsOfExperience || ''}
                            onChange={(e) => updateSkill(index, { yearsOfExperience: e.target.value ? parseInt(e.target.value) : undefined })}
                            className="w-full px-3 py-2 rounded-lg"
                            style={{
                              background: colors.cardBackground,
                              border: `1px solid ${colors.border}`,
                              color: colors.primaryText,
                            }}
                            placeholder="e.g., 5"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`verified-${index}`}
                            checked={skill.verified || false}
                            onChange={(e) => updateSkill(index, { verified: e.target.checked })}
                            className="rounded"
                          />
                          <label htmlFor={`verified-${index}`} className="text-xs" style={{ color: colors.secondaryText }}>
                            Verified skill
                          </label>
                        </div>
                        <button
                          onClick={() => setEditingSkillId(null)}
                          className="w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                          style={{
                            background: colors.primaryBlue,
                            color: 'white',
                          }}
                        >
                          <Save size={14} />
                          Save Changes
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span 
                            className="font-semibold"
                            style={{ color: colors.primaryText }}
                          >
                            {skill.name}
                          </span>
                          <div className="flex items-center gap-2">
                            {isEditing && (
                              <>
                                <button
                                  onClick={() => setEditingSkillId(index)}
                                  className="p-1.5 rounded transition-colors"
                                  style={{ color: colors.primaryBlue }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = colors.badgeInfoBg;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                  aria-label={`Edit ${skill.name}`}
                                  title={`Edit ${skill.name}`}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => removeSkill(index)}
                                  className="p-1.5 rounded transition-colors"
                                  style={{ color: colors.errorRed }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = colors.badgeErrorBg;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                  aria-label={`Remove ${skill.name}`}
                                  title={`Remove ${skill.name}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Proficiency Progress Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span 
                              className="px-2 py-0.5 rounded text-xs font-medium"
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
                                {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}
                              </span>
                            )}
                          </div>
                          <div 
                            className="w-full rounded-full h-1.5"
                            style={{ background: colors.inputBackground }}
                          >
                            <div 
                              className="h-1.5 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${getProficiencyValue(skill.proficiency)}%`,
                                background: `linear-gradient(90deg, ${badgeStyle.border}, ${badgeStyle.color})`
                              }}
                            />
                          </div>
                        </div>
                        
                        {skill.verified && (
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle size={12} style={{ color: colors.badgeInfoText }} />
                            <span 
                              className="text-xs"
                              style={{ color: colors.badgeInfoText }}
                            >
                              Verified
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: colors.tertiaryText }}>
              <Award size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText, opacity: 0.5 }} />
              <p>No skills added yet</p>
            </div>
          )}
          
          {isEditing && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add a technical skill (e.g., JavaScript, Python, React)"
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
                    if (skill) {
                      addSkill(skill);
                      target.value = '';
                    }
                  }
                }}
              />
              <button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="Add a technical skill"]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    addSkill(input.value.trim());
                    input.value = '';
                  }
                }}
                className="px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryBlueHover || colors.primaryBlue;
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.primaryBlue;
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus size={18} className="inline mr-1" />
                Add
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
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold"
              style={{ color: colors.primaryText }}
            >
              Certifications
            </h3>
            {isEditing && (
              <button
                onClick={addCertification}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                <Plus size={16} />
                Add Certification
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {certifications.map((cert, index) => {
              const isEditing = editingCertId === index;
              
              return (
                <div 
                  key={index} 
                  className="p-5 rounded-xl transition-all"
                  style={{
                    background: colors.badgeWarningBg,
                    border: `1px solid ${colors.badgeWarningBorder}`,
                  }}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Award size={18} style={{ color: colors.badgeWarningText }} />
                          <h4 className="font-semibold" style={{ color: colors.primaryText }}>Edit Certification</h4>
                        </div>
                        <button
                          onClick={() => setEditingCertId(null)}
                          className="p-1 rounded"
                          style={{ color: colors.secondaryText }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          label="Certification Name"
                          value={cert.name}
                          onChange={(value) => updateCertification(index, { name: value })}
                          disabled={false}
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                        <FormField
                          label="Issuing Organization"
                          value={cert.issuer}
                          onChange={(value) => updateCertification(index, { issuer: value })}
                          disabled={false}
                          placeholder="e.g., Amazon Web Services"
                        />
                        <FormField
                          label="Issue Date"
                          type="date"
                          value={cert.date}
                          onChange={(value) => updateCertification(index, { date: value })}
                          disabled={false}
                        />
                        <FormField
                          label="Expiry Date (Optional)"
                          type="date"
                          value={cert.expiryDate || ''}
                          onChange={(value) => updateCertification(index, { expiryDate: value || null })}
                          disabled={false}
                        />
                        <FormField
                          label="Credential URL (Optional)"
                          type="url"
                          value={cert.credentialUrl || ''}
                          onChange={(value) => updateCertification(index, { credentialUrl: value || null })}
                          disabled={false}
                          placeholder="https://credential-url.com"
                          className="md:col-span-2"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id={`cert-verified-${index}`}
                          checked={cert.verified || false}
                          onChange={(e) => updateCertification(index, { verified: e.target.checked })}
                          className="rounded"
                        />
                        <label htmlFor={`cert-verified-${index}`} className="text-xs" style={{ color: colors.secondaryText }}>
                          This certification is verified
                        </label>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setEditingCertId(null)}
                          className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                          style={{
                            background: colors.primaryBlue,
                            color: 'white',
                          }}
                        >
                          <Save size={14} />
                          Save
                        </button>
                        <button
                          onClick={() => removeCertification(index)}
                          className="px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                          style={{
                            background: colors.errorRed,
                            color: 'white',
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: colors.badgeWarningBg,
                        }}
                      >
                        <Award size={20} style={{ color: colors.badgeWarningText }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="font-semibold mb-1"
                              style={{ color: colors.primaryText }}
                            >
                              {cert.name || 'Untitled Certification'}
                            </h4>
                            <p 
                              className="text-sm mb-2"
                              style={{ color: colors.secondaryText }}
                            >
                              {cert.issuer || 'Issuer not specified'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <span 
                                className="text-xs"
                                style={{ color: colors.tertiaryText }}
                              >
                                Issued: {cert.date || 'Not specified'}
                              </span>
                              {cert.expiryDate && (
                                <span 
                                  className="text-xs"
                                  style={{ color: colors.tertiaryText }}
                                >
                                  Expires: {cert.expiryDate}
                                </span>
                              )}
                              {cert.verified && (
                                <span 
                                  className="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
                                  style={{
                                    background: colors.badgeSuccessBg,
                                    color: colors.badgeSuccessText,
                                    border: `1px solid ${colors.badgeSuccessBorder}`,
                                  }}
                                >
                                  <CheckCircle size={12} />
                                  Verified
                                </span>
                              )}
                              {cert.credentialUrl && (
                                <a 
                                  href={cert.credentialUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs hover:underline flex items-center gap-1"
                                  style={{ color: colors.primaryBlue }}
                                >
                                  View Credential
                                </a>
                              )}
                            </div>
                          </div>
                          {isEditing && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setEditingCertId(index)}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: colors.primaryBlue }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = colors.badgeInfoBg;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                                aria-label="Edit certification"
                                title="Edit certification"
                              >
                                <Edit2 size={16} />
                              </button>
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
                                aria-label="Remove certification"
                                title="Remove certification"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {certifications.length === 0 && (
              <div className="text-center py-8" style={{ color: colors.tertiaryText }}>
                <Award size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText, opacity: 0.5 }} />
                <p>No certifications added yet</p>
                {isEditing && (
                  <button
                    onClick={addCertification}
                    className="mt-4 px-6 py-3 rounded-xl"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Your First Certification
                  </button>
                )}
              </div>
            )}
          </div>
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
            {languages.map((lang, index) => {
              const isEditing = editingLangId === index;
              
              return (
                <div 
                  key={index} 
                  className="p-4 rounded-xl transition-all"
                  style={{
                    background: colors.badgeSuccessBg,
                    border: `1px solid ${colors.badgeSuccessBorder}`,
                  }}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2" style={{ color: colors.primaryText }}>
                          <Globe size={16} />
                          Edit Language
                        </h4>
                        <button
                          onClick={() => setEditingLangId(null)}
                          className="p-1 rounded"
                          style={{ color: colors.secondaryText }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={lang.name}
                        onChange={(e) => updateLanguage(index, { name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg mb-2"
                        style={{
                          background: colors.cardBackground,
                          border: `1px solid ${colors.border}`,
                          color: colors.primaryText,
                        }}
                        placeholder="Language name"
                      />
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.secondaryText }}>
                          Proficiency Level
                        </label>
                        <select
                          value={lang.proficiency}
                          onChange={(e) => updateLanguage(index, { proficiency: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg"
                          style={{
                            background: colors.cardBackground,
                            border: `1px solid ${colors.border}`,
                            color: colors.primaryText,
                          }}
                        >
                          {languageLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => setEditingLangId(null)}
                        className="w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                        style={{
                          background: colors.primaryBlue,
                          color: 'white',
                        }}
                      >
                        <Save size={14} />
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div 
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: colors.badgeSuccessBg,
                        }}
                      >
                        <Globe size={20} style={{ color: colors.badgeSuccessText }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className="font-medium"
                            style={{ color: colors.primaryText }}
                          >
                            {lang.name}
                          </span>
                          <div className="flex items-center gap-2">
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
                            {isEditing && (
                              <>
                                <button
                                  onClick={() => setEditingLangId(index)}
                                  className="p-1.5 rounded transition-colors"
                                  style={{ color: colors.primaryBlue }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = colors.badgeInfoBg;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}
                                  aria-label={`Edit ${lang.name}`}
                                  title={`Edit ${lang.name}`}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => removeLanguage(index)}
                                  className="p-1.5 rounded transition-colors"
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
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Language Proficiency Progress Bar */}
                        <div 
                          className="w-full rounded-full h-1.5"
                          style={{ background: colors.inputBackground }}
                        >
                          <div 
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${getLanguageProficiencyValue(lang.proficiency)}%`,
                              background: `linear-gradient(90deg, ${colors.badgeSuccessBorder}, ${colors.successGreen})`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {isEditing && (
            <div className="flex gap-3 mt-4">
              <input
                type="text"
                placeholder="Add language (e.g., English, Spanish, French)"
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
                    if (lang) {
                      addLanguage(lang);
                      target.value = '';
                    }
                  }
                }}
              />
              <button 
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="Add language"]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    addLanguage(input.value.trim());
                    input.value = '';
                  }
                }}
                className="px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
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
                <Plus size={18} className="inline mr-1" />
                Add
              </button>
            </div>
          )}
          
          {languages.length === 0 && !isEditing && (
            <div className="text-center py-8" style={{ color: colors.tertiaryText }}>
              <Globe size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText, opacity: 0.5 }} />
              <p>No languages added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
