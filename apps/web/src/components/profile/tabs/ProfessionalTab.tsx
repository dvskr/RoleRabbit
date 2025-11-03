'use client';

import React, { useState } from 'react';
import { Briefcase, Plus, Trash2, Edit2, Save, X, Calendar, MapPin, Building2 } from 'lucide-react';
import FormField from '../components/FormField';
import { UserData, WorkExperience } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

interface ProfessionalTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function ProfessionalTab({
  userData,
  isEditing,
  onUserDataChange
}: ProfessionalTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Normalize work experiences array
  const normalizeWorkExperiences = (experiences: any): WorkExperience[] => {
    if (!experiences) return [];
    if (Array.isArray(experiences)) {
      return experiences.map(exp => ({
        id: exp.id || `exp-${Date.now()}-${Math.random()}`,
        company: exp.company || '',
        role: exp.role || exp.title || '',
        location: exp.location || '',
        startDate: exp.startDate || exp.start || '',
        endDate: exp.endDate || exp.end || '',
        isCurrent: exp.isCurrent || (exp.endDate === null || exp.endDate === ''),
        description: exp.description || '',
        projectType: exp.projectType || exp.type || 'Full-time'
      }));
    }
    if (typeof experiences === 'string') {
      try {
        const parsed = JSON.parse(experiences);
        return normalizeWorkExperiences(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const workExperiences = normalizeWorkExperiences(userData.workExperiences);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editingExp, setEditingExp] = useState<WorkExperience | null>(null);

  const startEditing = (exp: WorkExperience) => {
    setEditingExpId(exp.id || null);
    setEditingExp({ ...exp });
  };

  const cancelEditing = () => {
    setEditingExpId(null);
    setEditingExp(null);
  };

  const updateWorkExperience = (id: string, updates: Partial<WorkExperience>) => {
    if (editingExpId === id && editingExp) {
      // Update local editing state immediately
      const updated = { ...editingExp, ...updates };
      setEditingExp(updated);
      
      // Update parent state
      const updatedList = workExperiences.map(exp => 
        exp.id === id ? updated : exp
      );
      onUserDataChange({ workExperiences: updatedList });
    } else {
      // Fallback for non-editing updates
      const updated = workExperiences.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      );
      onUserDataChange({ workExperiences: updated });
    }
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}-${Math.random()}`,
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      projectType: 'Full-time'
    };
    onUserDataChange({ workExperiences: [...workExperiences, newExp] });
    startEditing(newExp);
  };

  const deleteWorkExperience = (id: string) => {
    const updated = workExperiences.filter(exp => exp.id !== id);
    onUserDataChange({ workExperiences: updated });
    if (editingExpId === id) {
      cancelEditing();
    }
  };


  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: colors.primaryText }}>
          Work Experience
        </h2>
        {isEditing && (
          <button
            onClick={addWorkExperience}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
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
            <Plus size={18} />
            Add Experience
          </button>
        )}
      </div>

      {workExperiences.length === 0 ? (
        <div 
          className="text-center py-16 rounded-xl"
          style={{
            background: colors.cardBackground,
            border: `2px dashed ${colors.border}`,
          }}
        >
          <Briefcase size={48} className="mx-auto mb-4" style={{ color: colors.secondaryText, opacity: 0.5 }} />
          <p className="mb-2" style={{ color: colors.secondaryText }}>No work experience added yet</p>
          {isEditing && (
            <button
              onClick={addWorkExperience}
              className="mt-4 px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-all"
              style={{
                background: colors.primaryBlue,
                color: 'white',
              }}
            >
              <Plus size={18} />
              Add Your First Experience
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {workExperiences.map((exp, index) => {
            const isEditingThis = editingExpId === exp.id && isEditing;
            const displayExp = isEditingThis && editingExp ? editingExp : exp;
            
            return (
              <div
                key={exp.id}
                className="rounded-lg transition-all"
                style={{
                  background: colors.cardBackground,
                  border: `1px solid ${isEditingThis ? colors.primaryBlue : colors.border}`,
                }}
              >
                {isEditingThis ? (
                  <div className="p-6 space-y-5">
                  {/* Job Title & Company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id={`work-exp-${displayExp.id}-role`}
                      name={`workExp-${displayExp.id}-role`}
                      label="Job Title"
                      value={displayExp.role}
                      onChange={(value) => updateWorkExperience(displayExp.id || '', { role: value })}
                      disabled={false}
                      placeholder="e.g., Software Engineer"
                    />
                    <FormField
                      id={`work-exp-${displayExp.id}-company`}
                      name={`workExp-${displayExp.id}-company`}
                      label="Company"
                      value={displayExp.company}
                      onChange={(value) => updateWorkExperience(displayExp.id || '', { company: value })}
                      disabled={false}
                      placeholder="e.g., Google"
                    />
                  </div>

                  {/* Location & Employment Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id={`work-exp-${displayExp.id}-location`}
                      name={`workExp-${displayExp.id}-location`}
                      label="Location"
                      value={displayExp.location || ''}
                      onChange={(value) => updateWorkExperience(displayExp.id || '', { location: value })}
                      disabled={false}
                      placeholder="e.g., San Francisco, CA"
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold" style={{ color: colors.primaryText }}>
                        Employment Type
                      </label>
                      <select
                        id={`employment-type-${displayExp.id}`}
                        value={displayExp.projectType || 'Full-time'}
                        onChange={(e) => updateWorkExperience(displayExp.id || '', { projectType: e.target.value as any })}
                        className="w-full px-4 py-3 rounded-lg transition-all"
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
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id={`work-exp-${displayExp.id}-start-date`}
                      name={`workExp-${displayExp.id}-startDate`}
                      label="Start Date"
                      type="text"
                      value={displayExp.startDate}
                      onChange={(value) => updateWorkExperience(displayExp.id || '', { startDate: value })}
                      disabled={false}
                      placeholder="MM/YYYY"
                    />
                    <FormField
                      id={`work-exp-${displayExp.id}-end-date`}
                      name={`workExp-${displayExp.id}-endDate`}
                      label="End Date"
                      type="text"
                      value={displayExp.isCurrent ? 'Present' : (displayExp.endDate || '')}
                      onChange={(value) => {
                        if (value !== 'Present') {
                          updateWorkExperience(displayExp.id || '', { endDate: value, isCurrent: false });
                        }
                      }}
                      disabled={displayExp.isCurrent}
                      placeholder={displayExp.isCurrent ? "Present" : "MM/YYYY"}
                    />
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id={`current-${displayExp.id}`}
                        checked={displayExp.isCurrent || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          const isCurrent = e.target.checked;
                          updateWorkExperience(displayExp.id || '', { 
                            isCurrent: isCurrent,
                            endDate: isCurrent ? '' : (displayExp.endDate || '')
                          });
                        }}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: colors.primaryBlue }}
                      />
                      <span className="text-sm font-semibold cursor-pointer" style={{ color: colors.primaryText }}>
                        I currently work here
                      </span>
                    </label>
                  </div>

                  {/* Description */}
                  <FormField
                    id={`work-exp-${displayExp.id}-description`}
                    name={`workExp-${displayExp.id}-description`}
                    label="Description"
                    type="textarea"
                    value={displayExp.description || ''}
                    onChange={(value) => updateWorkExperience(displayExp.id || '', { description: value })}
                    disabled={false}
                    rows={6}
                    maxLength={10000}
                    showCounter={true}
                    autoResize={true}
                    allowBullets={true}
                    placeholder="Describe your responsibilities and achievements..."
                  />

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-medium"
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
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-medium"
                      style={{
                        background: colors.inputBackground,
                        color: colors.secondaryText,
                        border: `1px solid ${colors.border}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.badgeInfoBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.inputBackground;
                      }}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteWorkExperience(displayExp.id || '')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-medium ml-auto"
                      style={{
                        background: 'transparent',
                        color: colors.errorRed,
                        border: `1px solid ${colors.errorRed}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.badgeErrorBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: colors.badgeInfoBg }}>
                          <Building2 size={20} style={{ color: colors.primaryBlue }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1 truncate" style={{ color: colors.primaryText }}>
                            {exp.role || 'Untitled Position'}
                          </h3>
                          <p className="font-medium mb-2 truncate" style={{ color: colors.primaryBlue }}>
                            {exp.company || 'Untitled Company'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: colors.secondaryText }}>
                            {exp.startDate && (
                              <div className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                <span>
                                  {exp.startDate} - {exp.isCurrent ? 'Present' : (exp.endDate || 'N/A')}
                                </span>
                              </div>
                            )}
                            {exp.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin size={14} />
                                <span>{exp.location}</span>
                              </div>
                            )}
                            {exp.projectType && exp.projectType !== 'Full-time' && (
                              <span className="px-2 py-0.5 rounded text-xs" style={{ background: colors.badgeInfoBg, color: colors.primaryBlue }}>
                                {exp.projectType}
                              </span>
                            )}
                            {exp.isCurrent && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: colors.badgeSuccessBg, color: colors.successGreen }}>
                                Current
                              </span>
                            )}
                          </div>
                          {exp.description && (
                            <p 
                              className="text-sm mt-3 leading-relaxed whitespace-pre-wrap"
                              style={{ color: colors.secondaryText }}
                            >
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEditing(exp)}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: colors.primaryBlue }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.badgeInfoBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteWorkExperience(exp.id || '')}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: colors.errorRed }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.badgeErrorBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
