'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Briefcase, Plus, Trash2, Edit2, X, Calendar, MapPin, Building2, FileText, CheckCircle, AlertCircle, FolderKanban, ExternalLink, Github } from 'lucide-react';
import FormField from '../components/FormField';
import { UserData, WorkExperience, Project } from '../types/profile';
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
  
  const VALID_PROJECT_TYPES: WorkExperience['projectType'][] = ['Client Project', 'Full-time', 'Part-time', 'Contract', 'Freelance', 'Consulting', 'Internship'];

  // Normalize work experiences array
  const normalizeWorkExperiences = (experiences: any): WorkExperience[] => {
    if (!experiences) return [];

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
      if (input instanceof Map) {
        return Array.from(input.values());
      }
      if (typeof input === 'object') {
        return Object.values(input);
      }
      return [];
    };

    const items = toArray(experiences);

    return items.map((exp: any) => {
      const id = exp?.id || exp?._id || exp?.uuid || exp?.tempId || `exp-${Date.now()}-${Math.random()}`;
      const rawEndDate = exp?.endDate ?? exp?.end ?? '';
      const normalizedEndDateValue = typeof rawEndDate === 'string' ? rawEndDate.trim() : rawEndDate;
      const startDate = exp?.startDate ?? exp?.start ?? '';
      const isCurrent = Boolean(exp?.isCurrent) || normalizedEndDateValue === '' || normalizedEndDateValue === null || normalizedEndDateValue === 'Present';
      const normalizeProjectType = (value: any): WorkExperience['projectType'] => {
        if (typeof value === 'string') {
          const match = VALID_PROJECT_TYPES.find(
            (type) => type.toLowerCase() === value.toLowerCase()
          );
          if (match) {
            return match;
          }
        }
        return 'Full-time';
      };
      const projectType = normalizeProjectType(exp?.projectType ?? exp?.type);

      return {
        id,
        company: exp?.company || '',
        role: exp?.role || exp?.title || '',
        location: exp?.location || '',
        startDate,
        endDate: isCurrent ? '' : (normalizedEndDateValue || ''),
        isCurrent,
        description: exp?.description || '',
        projectType
      } as WorkExperience;
    });
  };
  
  const workExperiences = normalizeWorkExperiences(userData.workExperiences);

  const createEmptyExperience = (): WorkExperience => ({
    id: `exp-${Date.now()}-${Math.random()}`,
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    projectType: 'Full-time'
  });

  const createEmptyProject = (): Project => ({
    id: `proj-${Date.now()}-${Math.random()}`,
    title: '',
    description: '',
    technologies: [],
    date: '',
    link: '',
    github: '',
    media: []
  });
  
  // Debug logging
  // eslint-disable-next-line no-console
  console.log('ProfessionalTab - workExperiences:', {
    raw: userData.workExperiences,
    normalized: workExperiences,
    count: workExperiences.length,
    userDataKeys: Object.keys(userData)
  });
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editingExp, setEditingExp] = useState<WorkExperience | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectTechnologiesRaw, setProjectTechnologiesRaw] = useState<Record<string, string>>({});

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
    const newExp = createEmptyExperience();
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

  // Normalize projects array
  // Note: We don't trim values here to preserve spaces during editing
  // Trimming should only happen when saving/validating, not during user input
  const normalizeProjects = (projects: any): Project[] => {
    if (!projects) return [];
    if (Array.isArray(projects)) {
      return projects.map((proj: any) => ({
        id: proj?.id || proj?._id || proj?.uuid || proj?.tempId || `proj-${Date.now()}-${Math.random()}`,
        title: typeof proj?.title === 'string' ? proj.title : '',
        description: typeof proj?.description === 'string' ? proj.description : '',
        technologies: (() => {
          if (!proj?.technologies) return [];
          if (Array.isArray(proj.technologies)) return proj.technologies;
          if (typeof proj.technologies === 'string') {
            // Try to parse as JSON first (handles JSON array strings like '["React", "TypeScript"]')
            try {
              const parsed = JSON.parse(proj.technologies);
              if (Array.isArray(parsed)) {
                return parsed.filter((t: any) => t && String(t).trim().length > 0);
              }
            } catch {
              // Not JSON, treat as comma-separated string
            }
            // Split by comma for comma-separated strings
            return proj.technologies.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
          }
          return [];
        })(),
        date: typeof proj?.date === 'string' ? proj.date : '',
        link: typeof proj?.link === 'string' ? proj.link : '',
        github: typeof proj?.github === 'string' ? proj.github : '',
        media: Array.isArray(proj?.media) ? proj.media : []
      }));
    }
    return [];
  };

  const projects = normalizeProjects(userData.projects || []);

  // Project management functions
  const addProject = () => {
    const newProject = createEmptyProject();
    onUserDataChange({ projects: [...projects, newProject] });
    // Immediately open the new project in edit mode
    setEditingProjectId(newProject.id || null);
    // Initialize raw technologies string for the new project
    if (newProject.id) {
      setProjectTechnologiesRaw(prev => ({ ...prev, [newProject.id]: '' }));
    }
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    const updated = projects.map(proj =>
      proj.id === projectId ? { ...proj, ...updates } : proj
    );
    onUserDataChange({ projects: updated });
  };

  const deleteProject = (projectId: string) => {
    const updated = projects.filter(proj => proj.id !== projectId);
    onUserDataChange({ projects: updated });
  };

  const updateProjectTechnologies = (projectId: string, techString: string) => {
    // Store raw string while typing to allow comma and space
    setProjectTechnologiesRaw(prev => ({ ...prev, [projectId]: techString }));
  };

  const handleTechnologiesBlur = (projectId: string) => {
    // Only split and process when user finishes typing (on blur)
    const rawString = projectTechnologiesRaw[projectId];
    if (rawString !== undefined) {
      const technologies = rawString.split(',').map(t => t.trim()).filter(t => t.length > 0);
      updateProject(projectId, { technologies });
      // Clear raw string after processing
      setProjectTechnologiesRaw(prev => {
        const updated = { ...prev };
        delete updated[projectId];
        return updated;
      });
    }
  };

  const autoCreateExperienceRef = useRef(false);

  useEffect(() => {
    if (!isEditing) {
      autoCreateExperienceRef.current = false;
      setEditingProjectId(null);
      return;
    }

    if (workExperiences.length === 0 && !autoCreateExperienceRef.current) {
      autoCreateExperienceRef.current = true;
      const newExp = createEmptyExperience();
      onUserDataChange({ workExperiences: [newExp] });
      startEditing(newExp);
    } else if (workExperiences.length > 0) {
      autoCreateExperienceRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, workExperiences.length]);


  return (
    <div className="max-w-4xl">
      {/* Professional Bio Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
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
            id="profile-bio"
            name="bio"
            label=""
            type="textarea"
            value={userData.professionalBio ?? userData.bio ?? ''}
            onChange={(value) => onUserDataChange({ professionalBio: value, bio: value })}
            disabled={!isEditing}
            rows={5}
            maxLength={5000}
            showCounter={false}
            autoResize={true}
            placeholder="Write a compelling bio that highlights your experience, skills, and career goals..."
          />
          <div className="space-y-2">
            {(((userData.professionalBio ?? userData.bio) || '').length > 0) && (((userData.professionalBio ?? userData.bio) || '').length < 50) && isEditing && (
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
            // Ensure we have a stable, unique ID for form fields
            // exp.id is guaranteed unique: `exp-${Date.now()}-${Math.random()}` from addWorkExperience
            // Always use exp.id (from the array item) to ensure consistency across renders
            const stableId = exp.id || `temp-exp-${index}-${Math.random().toString(36).substr(2, 9)}`;
            
            return (
              <div
                key={exp.id || `work-exp-${index}`}
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
                      id={`work-exp-${stableId}-role`}
                      name={`workExp-${stableId}-role`}
                      label="Job Title"
                      value={displayExp.role}
                      onChange={(value) => updateWorkExperience(displayExp.id || stableId, { role: value })}
                      disabled={false}
                      placeholder="e.g., Software Engineer"
                    />
                    <FormField
                      id={`work-exp-${stableId}-company`}
                      name={`workExp-${stableId}-company`}
                      label="Company"
                      value={displayExp.company}
                      onChange={(value) => updateWorkExperience(displayExp.id || stableId, { company: value })}
                      disabled={false}
                      placeholder="e.g., Google"
                    />
                  </div>

                  {/* Location & Employment Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id={`work-exp-${stableId}-location`}
                      name={`workExp-${stableId}-location`}
                      label="Location"
                      value={displayExp.location || ''}
                      onChange={(value) => updateWorkExperience(displayExp.id || stableId, { location: value })}
                      disabled={false}
                      placeholder="e.g., San Francisco, CA"
                    />
                    <div className="space-y-2">
                      <label 
                        htmlFor={`employment-type-${stableId}`}
                        className="block text-sm font-semibold" 
                        style={{ color: colors.primaryText }}
                      >
                        Employment Type
                      </label>
                      <select
                        id={`employment-type-${stableId}`}
                        value={displayExp.projectType || 'Full-time'}
                        onChange={(e) => updateWorkExperience(displayExp.id || stableId, { projectType: e.target.value as any })}
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
                      id={`work-exp-${stableId}-start-date`}
                      name={`workExp-${stableId}-startDate`}
                      label="Start Date"
                      type="text"
                      value={displayExp.startDate}
                      onChange={(value) => updateWorkExperience(displayExp.id || stableId, { startDate: value })}
                      disabled={false}
                      placeholder="MM/YYYY"
                    />
                    <FormField
                      id={`work-exp-${stableId}-end-date`}
                      name={`workExp-${stableId}-endDate`}
                      label="End Date"
                      type="text"
                      value={displayExp.isCurrent ? 'Present' : (displayExp.endDate || '')}
                      onChange={(value) => {
                        if (value !== 'Present') {
                          updateWorkExperience(displayExp.id || stableId, { endDate: value, isCurrent: false });
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
                        id={`current-${stableId}`}
                        checked={displayExp.isCurrent || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          const isCurrent = e.target.checked;
                          updateWorkExperience(displayExp.id || stableId, { 
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
                    id={`work-exp-${stableId}-description`}
                    name={`workExp-${stableId}-description`}
                    label="Description"
                    type="textarea"
                    value={displayExp.description || ''}
                    onChange={(value) => updateWorkExperience(displayExp.id || stableId, { description: value })}
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
                      type="button"
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
                      type="button"
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
                  <p className="text-xs mt-2 pt-2 border-t" style={{ color: colors.secondaryText, borderColor: colors.border }}>
                    Changes will be saved when you click "Save" in the header
                  </p>
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
                            {exp.projectType && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: colors.badgeInfoBg, color: colors.primaryBlue }}>
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

      {/* Projects Section - Separate section under Work Experience */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: colors.primaryText }}>
            Projects
          </h2>
          {isEditing && (
            <button
              onClick={addProject}
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
              Add Project
            </button>
          )}
        </div>

        {projects.length === 0 && !editingProjectId ? (
          <div 
            className="text-center py-16 rounded-xl"
            style={{
              background: colors.cardBackground,
              border: `2px dashed ${colors.border}`,
            }}
          >
            <FolderKanban size={48} className="mx-auto mb-4" style={{ color: colors.secondaryText, opacity: 0.5 }} />
            <p className="mb-2" style={{ color: colors.secondaryText }}>No projects added yet</p>
            {isEditing && (
              <button
                type="button"
                onClick={addProject}
                className="mt-4 px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-all"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                <Plus size={18} />
                Add Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => {
              const projId = project.id || `proj-${index}`;
              const isEditingProject = editingProjectId === projId && isEditing;
              
              return (
                <div
                  key={projId}
                  className="rounded-lg transition-all"
                  style={{
                    background: colors.cardBackground,
                    border: `1px solid ${isEditingProject ? colors.primaryBlue : colors.border}`,
                  }}
                >
                  {isEditingProject ? (
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.primaryText }}>
                          <FolderKanban size={20} style={{ color: colors.primaryBlue }} />
                          Edit Project
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            // Clear raw technologies string when closing project editor
                            if (editingProjectId) {
                              setProjectTechnologiesRaw(prev => {
                                const updated = { ...prev };
                                delete updated[editingProjectId];
                                return updated;
                              });
                            }
                            setEditingProjectId(null);
                          }}
                          className="p-1 rounded"
                          style={{ color: colors.secondaryText }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          id={`project-${projId}-title`}
                          name={`project-${projId}-title`}
                          label="Project Title"
                          value={project.title || ''}
                          onChange={(value) => updateProject(projId, { title: value })}
                          disabled={false}
                          placeholder="e.g., E-commerce Platform"
                        />
                        <FormField
                          id={`project-${projId}-date`}
                          name={`project-${projId}-date`}
                          label="Date"
                          type="text"
                          value={project.date || ''}
                          onChange={(value) => updateProject(projId, { date: value })}
                          disabled={false}
                          placeholder="MM/YYYY"
                        />
                      </div>
                      <FormField
                        id={`project-${projId}-description`}
                        name={`project-${projId}-description`}
                        label="Description"
                        type="textarea"
                        value={project.description || ''}
                        onChange={(value) => updateProject(projId, { description: value })}
                        disabled={false}
                        rows={3}
                        placeholder="Describe the project..."
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          id={`project-${projId}-technologies`}
                          name={`project-${projId}-technologies`}
                          label="Technologies (comma-separated)"
                          value={projectTechnologiesRaw[projId] !== undefined 
                            ? projectTechnologiesRaw[projId] 
                            : (project.technologies || []).join(', ')}
                          onChange={(value) => updateProjectTechnologies(projId, value)}
                          onBlur={() => handleTechnologiesBlur(projId)}
                          disabled={false}
                          placeholder="React, Node.js, PostgreSQL"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            id={`project-${projId}-link`}
                            name={`project-${projId}-link`}
                            label="Project URL"
                            type="url"
                            value={project.link || ''}
                            onChange={(value) => updateProject(projId, { link: value })}
                            disabled={false}
                            placeholder="https://..."
                          />
                          <FormField
                            id={`project-${projId}-github`}
                            name={`project-${projId}-github`}
                            label="GitHub URL"
                            type="url"
                            value={project.github || ''}
                            onChange={(value) => updateProject(projId, { github: value })}
                            disabled={false}
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Clear raw technologies string when closing project editor
                            if (editingProjectId) {
                              setProjectTechnologiesRaw(prev => {
                                const updated = { ...prev };
                                delete updated[editingProjectId];
                                return updated;
                              });
                            }
                            setEditingProjectId(null);
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-medium"
                          style={{
                            background: colors.inputBackground,
                            color: colors.secondaryText,
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProject(projId)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-medium ml-auto"
                          style={{
                            background: 'transparent',
                            color: colors.errorRed,
                            border: `1px solid ${colors.errorRed}`,
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                      <p className="text-xs mt-2 pt-2 border-t" style={{ color: colors.secondaryText, borderColor: colors.border }}>
                        Changes will be saved when you click "Save" in the header
                      </p>
                    </div>
                  ) : (
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1" style={{ color: colors.primaryText }}>
                            {project.title || 'Untitled Project'}
                          </h3>
                          {project.description && (
                            <p className="text-sm mb-3 leading-relaxed" style={{ color: colors.secondaryText }}>
                              {project.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                            {project.date && (
                              <div className="flex items-center gap-1.5" style={{ color: colors.secondaryText }}>
                                <Calendar size={14} />
                                <span>{project.date}</span>
                              </div>
                            )}
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.technologies.map((tech, techIndex) => {
                                  // Ensure tech is a string and clean it (remove any array brackets that might be in the string)
                                  const techString = String(tech || '').trim();
                                  // Remove array brackets if they exist in the string itself
                                  const cleanTech = techString.replace(/^\[|\]$/g, '').replace(/^"|"$/g, '').trim();
                                  if (!cleanTech) return null;
                                  return (
                                    <span
                                      key={techIndex}
                                      className="px-2 py-0.5 rounded text-xs"
                                      style={{
                                        background: colors.badgeInfoBg,
                                        color: colors.primaryBlue,
                                      }}
                                    >
                                      {cleanTech}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {project.link && (
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm transition-colors"
                                style={{ color: colors.primaryBlue }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = colors.primaryBlueHover || colors.primaryBlue;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = colors.primaryBlue;
                                }}
                              >
                                <ExternalLink size={14} />
                                View Project
                              </a>
                            )}
                            {project.github && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm transition-colors"
                                style={{ color: colors.primaryBlue }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = colors.primaryBlueHover || colors.primaryBlue;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = colors.primaryBlue;
                                }}
                              >
                                <Github size={14} />
                                GitHub
                              </a>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProjectId(projId);
                                // Initialize raw technologies string when opening for editing
                                if (!projectTechnologiesRaw[projId]) {
                                  setProjectTechnologiesRaw(prev => ({ 
                                    ...prev, 
                                    [projId]: (project.technologies || []).join(', ') 
                                  }));
                                }
                              }}
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
                              type="button"
                              onClick={() => deleteProject(projId)}
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
    </div>
  );
}
