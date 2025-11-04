'use client';

import React, { useEffect, useState } from 'react';
import { Award, Globe, Trash2, Edit2, X, Plus, GraduationCap, ArrowLeft } from 'lucide-react';
import { UserData, Skill, Certification, Education } from '../types/profile';
import { sanitizeSkills } from '../../Profile';
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
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isEditing) {
      setEditingSkillId(null);
      setEditingCertId(null);
      setEditingEducationId(null);
    }
  }, [isEditing]);
  
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
  const sanitizedSkills = sanitizeSkills(skills, { keepDrafts: true });

  const addSkill = (skillNameOrList: string) => {
    // Support comma-separated skills: "Python, JavaScript, React" or single skill: "Python"
    const skillNames = skillNameOrList
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (skillNames.length === 0) return;
    
    // Add all skills that don't already exist (case-insensitive)
    const newSkills: Skill[] = [];
    const existingSkillNames = new Set(sanitizedSkills.map(s => s.name.toLowerCase()));
    
    skillNames.forEach(skillName => {
      if (!existingSkillNames.has(skillName.toLowerCase())) {
        newSkills.push({
          name: skillName,
          proficiency: 'Beginner',
          verified: false
        });
        existingSkillNames.add(skillName.toLowerCase()); // Prevent duplicates in the same batch
      }
    });
    
    if (newSkills.length > 0) {
      onUserDataChange({ skills: sanitizeSkills([...sanitizedSkills, ...newSkills], { keepDrafts: true }) });
    }
  };

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const updated = sanitizedSkills.map((skill, i) =>
      i === index ? { ...skill, ...updates } : skill
    );
    onUserDataChange({ skills: sanitizeSkills(updated, { keepDrafts: true }) });
  };

  const removeSkill = (index: number) => {
    const updatedSkills = sanitizedSkills.filter((_, i) => i !== index);
    onUserDataChange({ skills: sanitizeSkills(updatedSkills, { keepDrafts: true }) });
    // Reset editing state if the removed skill was being edited
    if (editingSkillId === index) {
      setEditingSkillId(null);
    } else if (editingSkillId !== null && editingSkillId > index) {
      // Adjust editing index if a skill before the edited one was removed
      setEditingSkillId(editingSkillId - 1);
    }
  };

  // Normalize certifications to always be an array
  const normalizeCertifications = (certs: any): Certification[] => {
    if (!certs) return [];
    if (Array.isArray(certs)) {
      return certs.map(cert => ({
        id: cert.id || cert._id || cert.uuid || cert.tempId || undefined,
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '', // Optional - allow blank
        expiryDate: cert.expiryDate || '',
        credentialUrl: cert.credentialUrl || '',
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
      id: `temp-cert-${Date.now()}-${Math.random()}`,
      name: '',
      issuer: '',
      date: '', // Optional - allow blank
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
  
  const addLanguage = (langNameOrList: string) => {
    // Support comma-separated languages: "English, Spanish, French" or single language: "English"
    const langNames = langNameOrList
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (langNames.length === 0) return;
    
    // Add all languages that don't already exist (case-insensitive)
    const newLanguages: any[] = [];
    const existingLangNames = new Set(languages.map(l => l.name.toLowerCase()));
    
    langNames.forEach(langName => {
      if (!existingLangNames.has(langName.toLowerCase())) {
        newLanguages.push({
          name: langName,
          proficiency: 'Native' // Keep for data structure, but won't display
        });
        existingLangNames.add(langName.toLowerCase()); // Prevent duplicates in the same batch
      }
    });
    
    if (newLanguages.length > 0) {
      onUserDataChange({ languages: [...languages, ...newLanguages] });
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

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const normalizeEducation = (educationInput: any): Education[] => {
    const toArray = (input: any): any[] => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      if (typeof input === 'string') {
        try {
          const parsed = JSON.parse(input);
          return toArray(parsed);
        } catch {
          return [];
        }
      }
      if (input instanceof Map || input instanceof Set) {
        return Array.from((input as Map<any, any> | Set<any>).values());
      }
      if (typeof input === 'object') {
        return Object.values(input);
      }
      return [];
    };

    const toStringValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      return typeof value === 'string' ? value : String(value);
    };

    return toArray(educationInput).map((edu: any, index) => {
      if (!edu || typeof edu !== 'object') {
        const institutionValue = typeof edu === 'string' ? edu : '';
        return {
          id: `edu-${index}`,
          institution: toStringValue(institutionValue),
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
          honors: '',
          location: '',
          description: '',
        };
      }

      const idSource = edu.id ?? edu._id ?? edu.uuid ?? edu.tempId ?? edu.educationId;
      const id = typeof idSource === 'string'
        ? idSource
        : (idSource !== undefined && idSource !== null ? String(idSource) : `edu-${index}`);

      return {
        id,
        institution: toStringValue(edu.institution ?? edu.school ?? edu.university ?? ''),
        degree: toStringValue(edu.degree ?? edu.program ?? ''),
        field: toStringValue(edu.field ?? edu.major ?? ''),
        startDate: toStringValue(edu.startDate ?? edu.start ?? ''),
        endDate: toStringValue(edu.endDate ?? edu.graduationDate ?? edu.completionDate ?? ''),
        gpa: toStringValue(edu.gpa ?? ''),
        honors: toStringValue(edu.honors ?? edu.awards ?? ''),
        location: toStringValue(edu.location ?? ''),
        description: toStringValue(edu.description ?? edu.summary ?? ''),
      } as Education;
    });
  };

  const education = normalizeEducation(userData.education);

  useEffect(() => {
    if (!isEditing && editingEducationId) {
      setEditingEducationId(null);
    }
  }, [isEditing, editingEducationId]);

  useEffect(() => {
    if (editingEducationId && !education.some((edu) => edu.id === editingEducationId)) {
      setEditingEducationId(null);
    }
  }, [education, editingEducationId]);

  const addEducation = () => {
    const newId = `temp-edu-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const newEducation: Education = {
      id: newId,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: '',
      location: '',
      description: '',
    };
    onUserDataChange({ education: [...education, newEducation] });
    setEditingEducationId(newId);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    const updated = education.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu));
    onUserDataChange({ education: updated });
  };

  const removeEducation = (id: string) => {
    const updated = education.filter((edu) => edu.id !== id);
    onUserDataChange({ education: updated });
    if (editingEducationId === id) {
      setEditingEducationId(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="space-y-8">

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
            <div className="flex flex-wrap gap-2 mb-6" style={{ maxWidth: '100%' }}>
              {skills.map((skill, index) => {
                return (
                  <div 
                    key={index} 
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all group flex-shrink-0"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  >
                    <span 
                      className="font-medium text-sm break-words"
                      style={{ 
                        color: colors.primaryText,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                      }}
                    >
                      {skill.name}
                    </span>
                    {isEditing && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeSkill(index);
                        }}
                        className="opacity-70 group-hover:opacity-100 transition-opacity ml-1 p-0.5 rounded flex-shrink-0"
                        style={{ 
                          color: colors.errorRed,
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.badgeErrorBg;
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.opacity = '0.7';
                        }}
                        aria-label={`Remove ${skill.name}`}
                        title={`Remove ${skill.name}`}
                        type="button"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
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
                id="add-skill-input"
                name="add-skill-input"
                type="text"
                placeholder="Add skills (comma-separated: Python, JavaScript, React or single: Python)"
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = e.target as HTMLInputElement;
                    const skillInput = target.value.trim();
                    if (skillInput) {
                      addSkill(skillInput);
                      target.value = '';
                    }
                  }
                }}
              />
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const input = document.getElementById('add-skill-input') as HTMLInputElement;
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addCertification();
                }}
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
              const isEditingCert = isEditing && editingCertId === index;
              // Use cert.id if available, otherwise fallback to index (for new certs)
              // This ensures unique IDs even when certs are reordered
              const certId = cert.id || `temp-cert-${index}`;
              
              return (
                <div 
                  key={certId} 
                  className="p-5 rounded-xl transition-all"
                  style={{
                    background: colors.cardBackground,
                    border: `1px solid ${isEditingCert ? colors.border : colors.border}`,
                    boxShadow: isEditingCert ? '0 0 0 1px rgba(255,255,255,0.04)' : undefined,
                  }}
                >
                  {isEditingCert ? (
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
                          id={`cert-${certId}-name`}
                          name={`cert-${certId}-name`}
                          label="Certification Name"
                          value={cert.name}
                          onChange={(value) => updateCertification(index, { name: value })}
                          disabled={false}
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                        <FormField
                          id={`cert-${certId}-issuer`}
                          name={`cert-${certId}-issuer`}
                          label="Issuing Organization"
                          value={cert.issuer}
                          onChange={(value) => updateCertification(index, { issuer: value })}
                          disabled={false}
                          placeholder="e.g., Amazon Web Services"
                        />
                        <FormField
                          id={`cert-${certId}-date`}
                          name={`cert-${certId}-date`}
                          label="Issue Date (Optional)"
                          type="date"
                          value={cert.date || ''}
                          onChange={(value) => updateCertification(index, { date: value || null })}
                          disabled={false}
                        />
                        <FormField
                          id={`cert-${certId}-expiry-date`}
                          name={`cert-${certId}-expiry-date`}
                          label="Expiry Date (Optional)"
                          type="date"
                          value={cert.expiryDate || ''}
                          onChange={(value) => updateCertification(index, { expiryDate: value || null })}
                          disabled={false}
                        />
                        <FormField
                          id={`cert-${certId}-credential-url`}
                          name={`cert-${certId}-credential-url`}
                          label="Credential URL (Optional)"
                          type="url"
                          value={cert.credentialUrl || ''}
                          onChange={(value) => updateCertification(index, { credentialUrl: value || null })}
                          disabled={false}
                          placeholder="https://credential-url.com"
                          className="md:col-span-2"
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingCertId(null);
                          }}
                          className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                          style={{
                            background: colors.inputBackground,
                            color: colors.secondaryText,
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          <ArrowLeft size={14} />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeCertification(index);
                          }}
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
                      <p className="text-xs mt-2 pt-2 border-t" style={{ color: colors.secondaryText, borderColor: colors.border }}>
                        Changes will be saved when you click "Save" in the header
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: colors.inputBackground,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <Award size={20} style={{ color: colors.primaryText }} />
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
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addCertification();
                    }}
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
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold"
              style={{ color: colors.primaryText }}
            >
              Languages
            </h3>
            {isEditing && languages.length === 0 && (
              <span className="text-sm" style={{ color: colors.secondaryText }}>
                Add your first language to get started
              </span>
            )}
          </div>
          
          {languages.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-6" style={{ maxWidth: '100%' }}>
              {languages.map((lang, index) => {
                return (
                  <div 
                    key={index} 
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all group flex-shrink-0"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  >
                    <span 
                      className="font-medium text-sm break-words"
                      style={{ 
                        color: colors.primaryText,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                      }}
                    >
                      {lang.name}
                    </span>
                    {isEditing && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeLanguage(index);
                        }}
                        className="opacity-70 group-hover:opacity-100 transition-opacity ml-1 p-0.5 rounded flex-shrink-0"
                        style={{ 
                          color: colors.errorRed,
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.badgeErrorBg;
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.opacity = '0.7';
                        }}
                        aria-label={`Remove ${lang.name}`}
                        title={`Remove ${lang.name}`}
                        type="button"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: colors.tertiaryText }}>
              <Globe size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText, opacity: 0.5 }} />
              <p>No languages added yet</p>
            </div>
          )}
          
          {isEditing && (
            <div className="flex gap-3">
              <input
                id="add-language-input"
                name="add-language-input"
                type="text"
                placeholder="Add languages (comma-separated: English, Spanish, French or single: English)"
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = e.target as HTMLInputElement;
                    const langInput = target.value.trim();
                    if (langInput) {
                      addLanguage(langInput);
                      target.value = '';
                    }
                  }
                }}
              />
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const input = document.getElementById('add-language-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    addLanguage(input.value.trim());
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

        {/* Education */}
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
              Education
            </h3>
            {isEditing && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addEducation();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus size={16} />
                Add Education
              </button>
            )}
          </div>

          {education.length === 0 ? (
            <div className="text-center py-8" style={{ color: colors.tertiaryText }}>
              <GraduationCap size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText, opacity: 0.5 }} />
              <p>No education entries added yet</p>
              {isEditing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addEducation();
                  }}
                  className="mt-4 px-6 py-3 rounded-xl"
                  style={{
                    background: colors.primaryBlue,
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Plus size={16} className="inline mr-2" />
                  Add Your First Education
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {education.map((edu, index) => {
                const entryId = edu.id || `edu-${index}`;
                const isEditingEducation = isEditing && editingEducationId === entryId;
                const degreeField = [edu.degree, edu.field].filter((value) => value && value.length > 0).join(' • ');
                const dateRange = [edu.startDate, edu.endDate]
                  .filter((value) => value && value.length > 0)
                  .join(' - ');

                return (
                  <div
                    key={entryId}
                    className="p-6 rounded-xl transition-all"
                    style={{
                      background: colors.cardBackground,
                      border: `1px solid ${isEditingEducation ? colors.primaryBlue : colors.border}`,
                    }}
                  >
                    {isEditingEducation ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id={`education-${entryId}-institution`}
                            name={`education-${entryId}-institution`}
                            label="Institution"
                            value={edu.institution || ''}
                            onChange={(value) => updateEducation(entryId, { institution: value })}
                            disabled={false}
                            placeholder="e.g., Stanford University"
                          />
                          <FormField
                            id={`education-${entryId}-location`}
                            name={`education-${entryId}-location`}
                            label="Location (Optional)"
                            value={edu.location || ''}
                            onChange={(value) => updateEducation(entryId, { location: value })}
                            disabled={false}
                            placeholder="e.g., Stanford, CA"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id={`education-${entryId}-degree`}
                            name={`education-${entryId}-degree`}
                            label="Degree"
                            value={edu.degree || ''}
                            onChange={(value) => updateEducation(entryId, { degree: value })}
                            disabled={false}
                            placeholder="e.g., Bachelor of Science"
                          />
                          <FormField
                            id={`education-${entryId}-field`}
                            name={`education-${entryId}-field`}
                            label="Field of Study"
                            value={edu.field || ''}
                            onChange={(value) => updateEducation(entryId, { field: value })}
                            disabled={false}
                            placeholder="e.g., Computer Science"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id={`education-${entryId}-start`}
                            name={`education-${entryId}-start`}
                            label="Start Date"
                            value={edu.startDate || ''}
                            onChange={(value) => updateEducation(entryId, { startDate: value })}
                            disabled={false}
                            placeholder="e.g., 2015-09 or Sep 2015"
                          />
                          <FormField
                            id={`education-${entryId}-end`}
                            name={`education-${entryId}-end`}
                            label="End Date"
                            value={edu.endDate || ''}
                            onChange={(value) => updateEducation(entryId, { endDate: value })}
                            disabled={false}
                            placeholder="e.g., 2019-05 or Present"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id={`education-${entryId}-gpa`}
                            name={`education-${entryId}-gpa`}
                            label="GPA (Optional)"
                            value={edu.gpa || ''}
                            onChange={(value) => updateEducation(entryId, { gpa: value })}
                            disabled={false}
                            placeholder="e.g., 3.8"
                          />
                          <FormField
                            id={`education-${entryId}-honors`}
                            name={`education-${entryId}-honors`}
                            label="Honors & Awards (Optional)"
                            value={edu.honors || ''}
                            onChange={(value) => updateEducation(entryId, { honors: value })}
                            disabled={false}
                            placeholder="e.g., Summa Cum Laude"
                          />
                        </div>

                        <FormField
                          id={`education-${entryId}-description`}
                          name={`education-${entryId}-description`}
                          label="Description (Optional)"
                          type="textarea"
                          value={edu.description || ''}
                          onChange={(value) => updateEducation(entryId, { description: value })}
                          disabled={false}
                          placeholder="Key courses, achievements, activities..."
                          rows={4}
                          autoResize={true}
                          allowBullets={true}
                        />

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeEducation(entryId);
                            }}
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
                        <p className="text-xs mt-2 pt-2 border-t" style={{ color: colors.secondaryText, borderColor: colors.border }}>
                          Changes will be saved when you click "Save" in the header
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-3">
                          <div>
                            <h4 className="font-semibold" style={{ color: colors.primaryText }}>
                              {edu.institution || 'Institution not specified'}
                            </h4>
                            <p className="text-sm" style={{ color: colors.secondaryText }}>
                              {degreeField || 'Degree information not provided'}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs" style={{ color: colors.tertiaryText }}>
                            <span>
                              {dateRange || 'Dates not specified'}
                            </span>
                            {edu.location && (
                              <span>Location: {edu.location}</span>
                            )}
                            {edu.gpa && (
                              <span>GPA: {edu.gpa}</span>
                            )}
                            {edu.honors && (
                              <span>Honors: {edu.honors}</span>
                            )}
                          </div>
                          {edu.description && (
                            <p className="text-sm" style={{ color: colors.secondaryText }}>
                              {edu.description}
                            </p>
                          )}
                        </div>
                        {isEditing && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingEducationId(entryId)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: colors.primaryBlue }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.badgeInfoBg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                              aria-label="Edit education"
                              title="Edit education"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeEducation(entryId)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: colors.errorRed }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.badgeErrorBg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                              aria-label="Remove education"
                              title="Remove education"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
