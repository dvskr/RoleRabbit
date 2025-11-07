'use client';

import React, { useMemo } from 'react';
import { Eye, Sparkles, GripVertical, Plus, X, Trash2 } from 'lucide-react';
import { ResumeData, ExperienceItem, CustomField } from '../../types/resume';
import { useTheme } from '../../contexts/ThemeContext';

interface ExperienceSectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
  onOpenAIGenerateModal: (section: string) => void;
}

const ExperienceSection = React.memo(function ExperienceSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection,
  onOpenAIGenerateModal
}: ExperienceSectionProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Memoize experience array
  const experience = useMemo(() => {
    return Array.isArray(resumeData.experience) ? resumeData.experience : [];
  }, [resumeData.experience]);

  const addExperience = () => {
    const newExperience: ExperienceItem = {
      id: Date.now(),
      company: '',
      position: '',
      period: '',
      endPeriod: '',
      location: '',
      bullets: [''],
      environment: [],
      customFields: []
    };
    setResumeData(prev => ({ ...prev, experience: [...(Array.isArray(prev.experience) ? prev.experience : []), newExperience] }));
  };

  const updateExperience = (id: number, updates: Partial<ExperienceItem>) => {
    setResumeData((prev: any) => {
      const updatedExperience = (prev.experience || []).map((item: any) => 
      item.id === id ? { ...item, ...updates } : item
    );
      return {...prev, experience: updatedExperience};
    });
  };

  const deleteExperience = (id: number) => {
    setResumeData((prev: any) => {
      const updatedExperience = (prev.experience || []).filter((item: any) => item.id !== id);
      return {...prev, experience: updatedExperience};
    });
  };

  const addBullet = (expId: number) => {
    const exp = experience.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, { bullets: [...(Array.isArray(exp.bullets) ? exp.bullets : []), ''] });
    }
  };

  const updateBullet = (expId: number, bulletIndex: number, value: string) => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;
    const updatedBullets = [...(Array.isArray(exp.bullets) ? exp.bullets : [])];
    updatedBullets[bulletIndex] = value;
    updateExperience(expId, { bullets: updatedBullets });
  };

  const deleteBullet = (expId: number, bulletIndex: number) => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;
    const updatedBullets = (Array.isArray(exp.bullets) ? exp.bullets : []).filter((_, index) => index !== bulletIndex);
    updateExperience(expId, { bullets: updatedBullets });
  };

  const addEnvironment = (expId: number) => {
    const exp = experience.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, { environment: [...(Array.isArray(exp.environment) ? exp.environment : []), ''] });
    }
  };

  const updateEnvironment = (expId: number, envIndex: number, value: string) => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;
    const updatedEnvironment = [...(Array.isArray(exp.environment) ? exp.environment : [])];
    updatedEnvironment[envIndex] = value;
    updateExperience(expId, { environment: updatedEnvironment });
  };

  const deleteEnvironment = (expId: number, envIndex: number) => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;
    const updatedEnvironment = (Array.isArray(exp.environment) ? exp.environment : []).filter((_, index) => index !== envIndex);
    updateExperience(expId, { environment: updatedEnvironment });
  };

  const addCustomFieldToExperience = (expId: number, field: CustomField) => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;
    const currentFields = Array.isArray(exp.customFields) ? exp.customFields : [];
    updateExperience(expId, { customFields: [...currentFields, field] });
  };

  const updateCustomFieldInExperience = (expId: number, fieldId: string, value: string) => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;
    const currentFields = Array.isArray(exp.customFields) ? exp.customFields : [];
    const updatedFields = currentFields.map(f => f.id === fieldId ? { ...f, value } : f);
    updateExperience(expId, { customFields: updatedFields });
  };

  const deleteCustomFieldFromExperience = (expId: number, fieldId: string) => {
    const exp = experience.find(e => e.id === expId);
    if (!exp) return;
    const currentFields = Array.isArray(exp.customFields) ? exp.customFields : [];
    const updatedFields = currentFields.filter(f => f.id !== fieldId);
    updateExperience(expId, { customFields: updatedFields });
  };

  return (
    <div className="mb-4 p-1 sm:p-2 lg:p-4" style={{ contentVisibility: 'auto' }}>
        <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="cursor-move" style={{ color: colors.tertiaryText }} />
          <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: colors.primaryText }}>
            EXPERIENCE
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={addExperience}
            className="flex items-center gap-2 font-semibold px-4 py-2 rounded-xl transition-colors"
            style={{ color: colors.primaryBlue }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.badgeInfoBg;
              e.currentTarget.style.color = colors.primaryBlue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.primaryBlue;
            }}
          >
            <Plus size={18} />
            Add
          </button>
          <button 
            onClick={() => onHideSection('experience')}
            className="p-2 rounded-xl transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title={sectionVisibility.experience ? "Hide experience section" : "Show experience section"}
          >
            <Eye size={18} style={{ color: sectionVisibility.experience ? colors.secondaryText : colors.tertiaryText }} />
          </button>
        </div>
      </div>

      {experience.length === 0 && (
        <div 
          className="text-center py-12 border-2 border-dashed rounded-2xl transition-all"
          style={{
            border: `2px dashed ${colors.border}`,
            background: colors.inputBackground,
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
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
            }}
          >
            <Plus size={32} className="text-white" />
          </div>
          <p className="mb-4 font-semibold" style={{ color: colors.secondaryText }}>No experience added yet</p>
          <button 
            onClick={addExperience}
            className="px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold transition-all"
            style={{
              background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 8px 16px ${colors.primaryBlue}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={18} />
            Add Experience
          </button>
        </div>
      )}

      {experience.map((exp) => (
        <div 
          key={exp.id} 
          className="mb-6 group p-3 sm:p-4 lg:p-6 border-2 rounded-2xl transition-all"
          style={{
            background: colors.cardBackground,
            border: `2px solid ${colors.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.primaryBlue;
            e.currentTarget.style.boxShadow = `0 8px 16px ${colors.primaryBlue}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <GripVertical size={18} className="cursor-move mt-2 flex-shrink-0" style={{ color: colors.tertiaryText }} />
            <div className="flex-1 space-y-3 min-w-0">
              <input
                className="font-bold text-xs border-2 outline-none rounded-lg px-2 py-1.5 w-full transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `2px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                placeholder="Company Name"
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primaryBlue;
                  e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.outline = 'none';
                }}
              />
              <div className="flex items-center gap-2 text-sm" style={{ color: colors.secondaryText }}>
                <input 
                  className="border-2 outline-none rounded-lg px-2 py-1.5 text-xs font-medium flex-1 min-w-0 transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `2px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  value={exp.period}
                  onChange={(e) => updateExperience(exp.id, { period: e.target.value })}
                  placeholder="Start Date"
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryBlue;
                    e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.outline = 'none';
                  }}
                />
                <span className="font-bold flex-shrink-0" style={{ color: colors.tertiaryText }}>→</span>
                <input 
                  className="border-2 outline-none rounded-lg px-2 py-1.5 text-xs font-medium flex-1 min-w-0 transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `2px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  value={exp.endPeriod}
                  onChange={(e) => updateExperience(exp.id, { endPeriod: e.target.value })}
                  placeholder="End Date"
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryBlue;
                    e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.outline = 'none';
                  }}
                />
              </div>
              <input
                className="text-xs border-2 outline-none rounded-lg px-2 py-1.5 w-full transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `2px solid ${colors.border}`,
                  color: colors.secondaryText,
                }}
                value={exp.location}
                onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                placeholder="Location"
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primaryBlue;
                  e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.outline = 'none';
                }}
              />
              <input
                className="font-semibold text-xs border-2 outline-none rounded-lg px-2 py-1.5 w-full transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `2px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                value={exp.position}
                onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                placeholder="Job Title"
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primaryBlue;
                  e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.outline = 'none';
                }}
              />
              
              {/* Custom Fields */}
              {(exp.customFields || []).map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 text-xs border-2 outline-none rounded-lg px-2 py-1.5 min-w-0 transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `2px solid ${colors.border}`,
                      color: colors.secondaryText,
                    }}
                    value={field.value || ''}
                    onChange={(e) => updateCustomFieldInExperience(exp.id, field.id, e.target.value)}
                    placeholder={field.name}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primaryBlue;
                      e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.border;
                      e.target.style.outline = 'none';
                    }}
                  />
                  <button
                    onClick={() => deleteCustomFieldFromExperience(exp.id, field.id)}
                    className="p-1 rounded-lg transition-colors"
                    style={{ color: colors.errorRed }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.badgeErrorBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Delete field"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              {/* Add Custom Field Button */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const newField: CustomField = {
                      id: `custom-${Date.now()}`,
                      name: 'Custom Field',
                      value: ''
                    };
                    addCustomFieldToExperience(exp.id, newField);
                  }}
                  className="text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  style={{ color: colors.primaryBlue }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.badgeInfoBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Plus size={12} />
                  Add Field
                </button>
              </div>
            </div>
            <button
              onClick={() => deleteExperience(exp.id)}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all"
              style={{ color: colors.errorRed }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgeErrorBg;
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Delete experience"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Bullets */}
          <div className="ml-6 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold" style={{ color: colors.secondaryText }}>Responsibilities</h4>
              <button
                onClick={() => addBullet(exp.id)}
                className="text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                style={{ color: colors.primaryBlue }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.badgeInfoBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Plus size={12} />
                Add Responsibility
              </button>
            </div>
            {exp.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex items-start gap-2">
                <span className="mt-1 flex-shrink-0 text-xs resume-bullet" data-bullet style={{ color: colors.tertiaryText }}>•</span>
                <input
                  className="flex-1 text-xs border-2 outline-none rounded-lg px-2 py-1.5 min-w-0 transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `2px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  value={bullet}
                  onChange={(e) => updateBullet(exp.id, bulletIndex, e.target.value)}
                  placeholder="Describe your responsibility..."
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryBlue;
                    e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.outline = 'none';
                  }}
                />
                <button
                  onClick={() => deleteBullet(exp.id, bulletIndex)}
                  className="p-1 rounded-lg transition-colors flex-shrink-0"
                  style={{ color: colors.errorRed }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.badgeErrorBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Delete bullet"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Environment */}
          <div className="ml-6 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold" style={{ color: colors.secondaryText }}>Technologies</h4>
              <button
                onClick={() => addEnvironment(exp.id)}
                className="text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                style={{ color: colors.primaryBlue }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.badgeInfoBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Plus size={12} />
                Add Tech
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {exp.environment.map((tech, techIndex) => (
                <div 
                  key={techIndex} 
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
                  style={{ 
                    width: 'fit-content',
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <input
                    type="text"
                    className="text-xs bg-transparent border-none outline-none transition-all"
                    style={{
                      color: colors.primaryText,
                    }}
                    value={tech}
                    onChange={(e) => {
                      updateEnvironment(exp.id, techIndex, e.target.value);
                      // Auto-resize the input
                      const input = e.target;
                      input.style.width = `${Math.max(e.target.value.length * 7 + 16, 60)}px`;
                    }}
                    placeholder="Technology"
                    autoComplete="off"
                    style={{ 
                      width: `${Math.max(tech.length * 7 + 16, 60)}px`,
                      maxWidth: '300px',
                      minWidth: '60px'
                    }}
                  />
                  <button
                    onClick={() => deleteEnvironment(exp.id, techIndex)}
                    className="transition-colors flex-shrink-0"
                    style={{ color: colors.tertiaryText }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.errorRed;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.tertiaryText;
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      
        <div className="flex justify-end mt-3">
          <button 
            onClick={() => onOpenAIGenerateModal('experience')}
            className="text-sm flex items-center gap-2 font-semibold px-3 py-2 rounded-lg transition-colors"
            style={{
              color: colors.badgePurpleText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.badgePurpleBg;
              e.currentTarget.style.color = colors.badgePurpleText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.badgePurpleText;
            }}
          >
            <Sparkles size={16} />
            AI Generate
          </button>
      </div>
    </div>
  );
});

export default ExperienceSection;
