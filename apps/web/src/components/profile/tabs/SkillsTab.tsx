'use client';

import React, { useState } from 'react';
import { Award, Globe, Trash2, Edit2, Save, X, Plus } from 'lucide-react';
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
  
  const addSkill = (skillNameOrList: string) => {
    // Support comma-separated skills: "Python, JavaScript, React" or single skill: "Python"
    const skillNames = skillNameOrList
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (skillNames.length === 0) return;
    
    // Add all skills that don't already exist (case-insensitive)
    const newSkills: Skill[] = [];
    const existingSkillNames = new Set(skills.map(s => s.name.toLowerCase()));
    
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
      onUserDataChange({ skills: [...skills, ...newSkills] });
    }
  };

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const updated = skills.map((skill, i) => 
      i === index ? { ...skill, ...updates } : skill
    );
    onUserDataChange({ skills: updated });
  };

  const removeSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onUserDataChange({ skills: updatedSkills });
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
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '', // Optional - allow blank
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
                          id={`cert-${index}-name`}
                          name={`cert-${index}-name`}
                          label="Certification Name"
                          value={cert.name}
                          onChange={(value) => updateCertification(index, { name: value })}
                          disabled={false}
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                        <FormField
                          id={`cert-${index}-issuer`}
                          name={`cert-${index}-issuer`}
                          label="Issuing Organization"
                          value={cert.issuer}
                          onChange={(value) => updateCertification(index, { issuer: value })}
                          disabled={false}
                          placeholder="e.g., Amazon Web Services"
                        />
                        <FormField
                          id={`cert-${index}-date`}
                          name={`cert-${index}-date`}
                          label="Issue Date (Optional)"
                          type="date"
                          value={cert.date || ''}
                          onChange={(value) => updateCertification(index, { date: value || null })}
                          disabled={false}
                        />
                        <FormField
                          id={`cert-${index}-expiry-date`}
                          name={`cert-${index}-expiry-date`}
                          label="Expiry Date (Optional)"
                          type="date"
                          value={cert.expiryDate || ''}
                          onChange={(value) => updateCertification(index, { expiryDate: value || null })}
                          disabled={false}
                        />
                        <FormField
                          id={`cert-${index}-credential-url`}
                          name={`cert-${index}-credential-url`}
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
                            background: colors.primaryBlue,
                            color: 'white',
                          }}
                        >
                          <Save size={14} />
                          Save
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
      </div>
    </div>
  );
}
