'use client';

import React from 'react';
import { Eye, Sparkles, GripVertical, Plus, X, Trash2 } from 'lucide-react';
import { ResumeData, ProjectItem, CustomField } from '../../types/resume';
import { useTheme } from '../../contexts/ThemeContext';

interface ProjectsSectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
  onOpenAIGenerateModal: (section: string) => void;
}

export default function ProjectsSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection,
  onOpenAIGenerateModal
}: ProjectsSectionProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const addProject = () => {
    const newProject: ProjectItem = {
      id: Date.now(),
      name: '',
      description: '',
      link: '',
      bullets: [''],
      skills: [],
      customFields: []
    };
    setResumeData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (id: number, updates: Partial<ProjectItem>) => {
    const updatedProjects = resumeData.projects.map((item) => 
      item.id === id ? { ...item, ...updates } : item
    );
    setResumeData({...resumeData, projects: updatedProjects});
  };

  const deleteProject = (id: number) => {
    const updatedProjects = resumeData.projects.filter(item => item.id !== id);
    setResumeData({...resumeData, projects: updatedProjects});
  };

  const addBullet = (projectId: number) => {
    const project = resumeData.projects.find(p => p.id === projectId)!;
    updateProject(projectId, { bullets: [...project.bullets, ''] });
  };

  const updateBullet = (projectId: number, bulletIndex: number, value: string) => {
    const project = resumeData.projects.find(p => p.id === projectId)!;
    const updatedBullets = [...project.bullets];
    updatedBullets[bulletIndex] = value;
    updateProject(projectId, { bullets: updatedBullets });
  };

  const deleteBullet = (projectId: number, bulletIndex: number) => {
    const project = resumeData.projects.find(p => p.id === projectId)!;
    const updatedBullets = project.bullets.filter((_, index) => index !== bulletIndex);
    updateProject(projectId, { bullets: updatedBullets });
  };

  const addSkill = (projectId: number) => {
    const project = resumeData.projects.find(p => p.id === projectId)!;
    updateProject(projectId, { skills: [...project.skills, ''] });
  };

  const updateSkill = (projectId: number, skillIndex: number, value: string) => {
    const project = resumeData.projects.find(p => p.id === projectId)!;
    const updatedSkills = [...project.skills];
    updatedSkills[skillIndex] = value;
    updateProject(projectId, { skills: updatedSkills });
  };

  const deleteSkill = (projectId: number, skillIndex: number) => {
    const project = resumeData.projects.find(p => p.id === projectId)!;
    const updatedSkills = project.skills.filter((_, index) => index !== skillIndex);
    updateProject(projectId, { skills: updatedSkills });
  };

  const addCustomFieldToProject = (projectId: number, field: CustomField) => {
    const project = resumeData.projects.find(p => p.id === projectId)!;
    const currentFields = project.customFields || [];
    updateProject(projectId, { customFields: [...currentFields, field] });
  };

  const updateCustomFieldInProject = (projectId: number, fieldId: string, value: string) => {
    const project = resumeData.projects.find(p => p.id === projectId)!;
    const currentFields = project.customFields || [];
    const updatedFields = currentFields.map(f => f.id === fieldId ? { ...f, value } : f);
    updateProject(projectId, { customFields: updatedFields });
  };

  const deleteCustomFieldFromProject = (projectId: number, fieldId: string) => {
    const project = resumeData.projects.find(p => p.id === projectId)!;
    const currentFields = project.customFields || [];
    const updatedFields = currentFields.filter(f => f.id !== fieldId);
    updateProject(projectId, { customFields: updatedFields });
  };

  return (
    <div className="mb-8 p-1 sm:p-2 lg:p-4" style={{ contentVisibility: 'auto' }}>
      <div 
        className="rounded-2xl p-6 transition-all"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 6px ${colors.border}10`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 8px 12px ${colors.border}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 4px 6px ${colors.border}10`;
        }}
      >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="cursor-move" style={{ color: colors.tertiaryText }} />
          <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: colors.primaryText }}>
            PROJECTS
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={addProject}
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
            onClick={() => onHideSection('projects')}
            className="p-2 rounded-xl transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title={sectionVisibility.projects ? "Hide projects section" : "Show projects section"}
          >
            <Eye size={18} style={{ color: sectionVisibility.projects ? colors.secondaryText : colors.tertiaryText }} />
          </button>
        </div>
      </div>

      {resumeData.projects.length === 0 && (
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
          <p className="mb-4 font-semibold" style={{ color: colors.secondaryText }}>No projects added yet</p>
          <button 
            onClick={addProject}
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
            Add Project
          </button>
        </div>
      )}

      {resumeData.projects.map((project) => (
        <div 
          key={project.id} 
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
                value={project.name}
                onChange={(e) => updateProject(project.id, { name: e.target.value })}
                placeholder="Project Name"
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primaryBlue;
                  e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.outline = 'none';
                }}
              />
              <textarea
                className="text-xs border-2 outline-none rounded-lg px-2 py-1.5 w-full resize-none min-w-0 transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `2px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                rows={2}
                value={project.description}
                onChange={(e) => updateProject(project.id, { description: e.target.value })}
                placeholder="Project Description"
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
                className="text-xs border-2 outline-none rounded-lg px-2 py-1.5 w-full transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `2px solid ${colors.border}`,
                  color: colors.primaryBlue,
                }}
                value={project.link}
                onChange={(e) => updateProject(project.id, { link: e.target.value })}
                placeholder="Project Link/URL"
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
              {(project.customFields || []).map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 text-xs border-2 outline-none rounded-lg px-2 py-1.5 min-w-0 transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `2px solid ${colors.border}`,
                      color: colors.secondaryText,
                    }}
                    value={field.value || ''}
                    onChange={(e) => updateCustomFieldInProject(project.id, field.id, e.target.value)}
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
                    onClick={() => deleteCustomFieldFromProject(project.id, field.id)}
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
                    addCustomFieldToProject(project.id, newField);
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
              onClick={() => deleteProject(project.id)}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all"
              style={{ color: colors.errorRed }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgeErrorBg;
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Delete project"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Bullets */}
          <div className="ml-6 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold" style={{ color: colors.secondaryText }}>Key Features</h4>
              <button
                onClick={() => addBullet(project.id)}
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
                Add Feature
              </button>
            </div>
            {project.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex items-start gap-2">
                <span className="mt-1 text-xs" style={{ color: colors.tertiaryText }}>•</span>
                <input
                  className="flex-1 text-xs border-2 outline-none rounded-lg px-2 py-1.5 min-w-0 transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `2px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  value={bullet}
                  onChange={(e) => updateBullet(project.id, bulletIndex, e.target.value)}
                  placeholder="Describe a key feature..."
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
                  onClick={() => deleteBullet(project.id, bulletIndex)}
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

          {/* Skills */}
          <div className="ml-6 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold" style={{ color: colors.secondaryText }}>Technologies Used</h4>
              <button
                onClick={() => addSkill(project.id)}
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
              {project.skills.map((skill, skillIndex) => (
                <div 
                  key={skillIndex} 
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
                    className="text-xs bg-transparent border-none outline-none transition-all"
                    style={{
                      color: colors.primaryText,
                    }}
                    value={skill}
                    onChange={(e) => {
                      updateSkill(project.id, skillIndex, e.target.value);
                      const input = e.target;
                      input.style.width = `${Math.max(e.target.value.length * 7 + 16, 60)}px`;
                    }}
                    placeholder="Technology"
                    autoComplete="off"
                    style={{ 
                      width: `${Math.max(skill.length * 7 + 16, 60)}px`,
                      maxWidth: '300px',
                      minWidth: '60px'
                    }}
                  />
                  <button
                    onClick={() => deleteSkill(project.id, skillIndex)}
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
            onClick={() => onOpenAIGenerateModal('projects')}
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
    </div>
  );
}
