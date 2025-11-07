'use client';

import React, { useMemo } from 'react';
import { Eye, GripVertical, Plus, Trash2 } from 'lucide-react';
import { ResumeData, EducationItem, CustomField } from '../../types/resume';
import { useTheme } from '../../contexts/ThemeContext';

interface EducationSectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
}

const EducationSection = React.memo(function EducationSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection
}: EducationSectionProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Memoize education array
  const education = useMemo(() => {
    return Array.isArray(resumeData.education) ? resumeData.education : [];
  }, [resumeData.education]);
  const addEducation = () => {
    const newEducation: EducationItem = {
      id: Date.now(),
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
      customFields: []
    };
    setResumeData(prev => ({ ...prev, education: [...prev.education, newEducation] }));
  };

  const updateEducation = (id: number, updates: Partial<EducationItem>) => {
    setResumeData((prev: any) => {
      const updatedEducation = (prev.education || []).map((item: any) => 
        item.id === id ? { ...item, ...updates } : item
      );
      return {...prev, education: updatedEducation};
    });
  };

  const deleteEducation = (id: number) => {
    setResumeData((prev: any) => {
      const updatedEducation = (prev.education || []).filter((item: any) => item.id !== id);
      return {...prev, education: updatedEducation};
    });
  };

  const addCustomFieldToEducation = (eduId: number, field: CustomField) => {
    const edu = resumeData.education.find(e => e.id === eduId)!;
    const currentFields = edu.customFields || [];
    updateEducation(eduId, { customFields: [...currentFields, field] });
  };

  const updateCustomFieldInEducation = (eduId: number, fieldId: string, value: string) => {
    const edu = resumeData.education.find(e => e.id === eduId)!;
    const currentFields = edu.customFields || [];
    const updatedFields = currentFields.map(f => f.id === fieldId ? { ...f, value } : f);
    updateEducation(eduId, { customFields: updatedFields });
  };

  const deleteCustomFieldFromEducation = (eduId: number, fieldId: string) => {
    const edu = resumeData.education.find(e => e.id === eduId)!;
    const currentFields = edu.customFields || [];
    const updatedFields = currentFields.filter(f => f.id !== fieldId);
    updateEducation(eduId, { customFields: updatedFields });
  };

  return (
    <div className="mb-4 p-1 sm:p-2 lg:p-4" style={{ contentVisibility: 'auto' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="cursor-move" style={{ color: colors.tertiaryText }} />
          <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: colors.primaryText }}>
            EDUCATION
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={addEducation}
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
            onClick={() => onHideSection('education')}
            className="p-2 rounded-xl transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title={sectionVisibility.education ? "Hide education section" : "Show education section"}
          >
            <Eye size={18} style={{ color: sectionVisibility.education ? colors.secondaryText : colors.tertiaryText }} />
          </button>
        </div>
      </div>

      {education.length === 0 && (
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
          <p className="mb-4 font-semibold" style={{ color: colors.secondaryText }}>No education added yet</p>
          <button 
            onClick={addEducation}
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
            Add Education
          </button>
        </div>
      )}

      {education.map((edu) => (
        <div 
          key={edu.id} 
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
                value={edu.school}
                onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                placeholder="School/University Name"
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
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                placeholder="Degree/Program"
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primaryBlue;
                  e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.outline = 'none';
                }}
              />
              <div className="flex items-center gap-2 text-xs" style={{ color: colors.secondaryText }}>
                <input 
                  className="border-2 outline-none rounded-lg px-2 py-1.5 font-medium flex-1 min-w-0 transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `2px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
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
                  className="border-2 outline-none rounded-lg px-2 py-1.5 font-medium flex-1 min-w-0 transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `2px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
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
              
              {/* Custom Fields */}
              {(edu.customFields || []).map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 text-xs border-2 outline-none rounded-lg px-2 py-1.5 min-w-0 transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `2px solid ${colors.border}`,
                      color: colors.secondaryText,
                    }}
                    value={field.value || ''}
                    onChange={(e) => updateCustomFieldInEducation(edu.id, field.id, e.target.value)}
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
                    onClick={() => deleteCustomFieldFromEducation(edu.id, field.id)}
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
                    addCustomFieldToEducation(edu.id, newField);
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
              onClick={() => deleteEducation(edu.id)}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all"
              style={{ color: colors.errorRed }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgeErrorBg;
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Delete education"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

export default EducationSection;
