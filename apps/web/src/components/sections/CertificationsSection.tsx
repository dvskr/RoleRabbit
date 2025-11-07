'use client';

import React, { useMemo } from 'react';
import { Eye, GripVertical, Plus, X, Trash2 } from 'lucide-react';
import { ResumeData, CertificationItem, CustomField } from '../../types/resume';
import { useTheme } from '../../contexts/ThemeContext';

interface CertificationsSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
}

const CertificationsSection = React.memo(function CertificationsSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection
}: CertificationsSectionProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Memoize certifications array
  const certifications = useMemo(() => {
    return Array.isArray(resumeData.certifications) ? resumeData.certifications : [];
  }, [resumeData.certifications]);

  const addCertification = () => {
    const newCertification: CertificationItem = {
      id: Date.now(),
      name: '',
      issuer: '',
      link: '',
      skills: [],
      customFields: []
    };
    setResumeData((prev: ResumeData) => ({ ...prev, certifications: [...prev.certifications, newCertification] }));
  };

  const updateCertification = (id: number, updates: Partial<CertificationItem>) => {
    setResumeData((prev: ResumeData) => {
      const updatedCertifications = (prev.certifications || []).map((item: CertificationItem) => 
        item.id === id ? { ...item, ...updates } : item
      );
      return {...prev, certifications: updatedCertifications};
    });
  };

  const deleteCertification = (id: number) => {
    setResumeData((prev: ResumeData) => {
      const updatedCertifications = (prev.certifications || []).filter((item: CertificationItem) => item.id !== id);
      return {...prev, certifications: updatedCertifications};
    });
  };

  const addCustomFieldToCertification = (certId: number, field: CustomField) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    const currentFields = cert.customFields || [];
    updateCertification(certId, { customFields: [...currentFields, field] });
  };

  const updateCustomFieldInCertification = (certId: number, fieldId: string, value: string) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    const currentFields = cert.customFields || [];
    const updatedFields = currentFields.map(f => f.id === fieldId ? { ...f, value } : f);
    updateCertification(certId, { customFields: updatedFields });
  };

  const deleteCustomFieldFromCertification = (certId: number, fieldId: string) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    const currentFields = cert.customFields || [];
    const updatedFields = currentFields.filter(f => f.id !== fieldId);
    updateCertification(certId, { customFields: updatedFields });
  };

  const addSkill = (certId: number) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    updateCertification(certId, { skills: [...cert.skills, ''] });
  };

  const updateSkill = (certId: number, skillIndex: number, value: string) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    const updatedSkills = [...cert.skills];
    updatedSkills[skillIndex] = value;
    updateCertification(certId, { skills: updatedSkills });
  };

  const deleteSkill = (certId: number, skillIndex: number) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    const updatedSkills = cert.skills.filter((_, index) => index !== skillIndex);
    updateCertification(certId, { skills: updatedSkills });
  };

  return (
    <div className="mb-4 p-1 sm:p-2 lg:p-4" style={{ contentVisibility: 'auto' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="cursor-move" style={{ color: colors.tertiaryText }} />
          <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: colors.primaryText }}>
            CERTIFICATIONS
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={addCertification}
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
            onClick={() => onHideSection('certifications')}
            className="p-2 rounded-xl transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title={sectionVisibility.certifications ? "Hide certifications section" : "Show certifications section"}
          >
            <Eye size={18} style={{ color: sectionVisibility.certifications ? colors.secondaryText : colors.tertiaryText }} />
          </button>
        </div>
      </div>

      {certifications.length === 0 && (
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
          <p className="mb-4 font-semibold" style={{ color: colors.secondaryText }}>No certifications added yet</p>
          <button 
            onClick={addCertification}
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
            Add Certification
          </button>
        </div>
      )}

      {certifications.map((cert) => (
        <div 
          key={cert.id} 
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
                className="font-bold text-sm border-2 outline-none rounded-xl px-2 sm:px-4 py-2 w-full min-w-0 max-w-full break-words overflow-wrap-anywhere transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `2px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                value={cert.name}
                onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                placeholder="Certification Name"
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
                className="font-semibold text-sm border-2 outline-none rounded-xl px-2 sm:px-4 py-2 w-full min-w-0 max-w-full break-words overflow-wrap-anywhere transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `2px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                value={cert.issuer}
                onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                placeholder="Issuing Organization"
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
                className="text-sm border-2 outline-none rounded-lg px-2 sm:px-4 py-2 w-full min-w-0 max-w-full break-words overflow-wrap-anywhere transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `2px solid ${colors.border}`,
                  color: colors.primaryBlue,
                }}
                value={cert.link}
                onChange={(e) => updateCertification(cert.id, { link: e.target.value })}
                placeholder="Certification Link/URL"
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
              {(cert.customFields || []).map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 text-sm border-2 outline-none rounded-lg px-2 sm:px-3 py-2 min-w-0 max-w-full break-words overflow-wrap-anywhere transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `2px solid ${colors.border}`,
                      color: colors.secondaryText,
                    }}
                    value={field.value || ''}
                    onChange={(e) => updateCustomFieldInCertification(cert.id, field.id, e.target.value)}
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
                    onClick={() => deleteCustomFieldFromCertification(cert.id, field.id)}
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
                    addCustomFieldToCertification(cert.id, newField);
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
              onClick={() => deleteCertification(cert.id)}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all"
              style={{ color: colors.errorRed }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgeErrorBg;
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Delete certification"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Skills */}
          <div className="ml-6 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold" style={{ color: colors.secondaryText }}>Skills Covered</h4>
              <button
                onClick={() => addSkill(cert.id)}
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
                Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {cert.skills.map((skill, skillIndex) => (
                <div 
                  key={skillIndex} 
                  className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
                  style={{
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
                    className="text-xs bg-transparent border-none outline-none min-w-0 max-w-full break-words overflow-wrap-anywhere transition-all"
                    style={{
                      color: colors.primaryText,
                    }}
                    value={skill}
                    onChange={(e) => updateSkill(cert.id, skillIndex, e.target.value)}
                    placeholder="Skill"
                  />
                  <button
                    onClick={() => deleteSkill(cert.id, skillIndex)}
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
    </div>
  );
});

export default CertificationsSection;
