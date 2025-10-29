'use client';

import React, { useState } from 'react';
import { FileText, ExternalLink, Github, Award, Trophy, Link2, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { UserData } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

interface PortfolioTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function PortfolioTab({
  userData,
  isEditing,
  onUserDataChange
}: PortfolioTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [editingAchievementIndex, setEditingAchievementIndex] = useState<number | null>(null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddAchievementModal, setShowAddAchievementModal] = useState(false);

  // Temp state for editing
  const [tempLink, setTempLink] = useState<{ platform: string; url: string }>({ platform: 'LinkedIn', url: '' });
  const [tempProject, setTempProject] = useState<{ title: string; description: string; technologies: string[]; date: string; link?: string; github?: string }>({ 
    title: '', description: '', technologies: [], date: '', link: '', github: '' 
  });
  const [tempAchievement, setTempAchievement] = useState<{ type: string; title: string; description: string; date: string; link?: string }>({
    type: 'Award', title: '', description: '', date: '', link: ''
  });
  const [newTech, setNewTech] = useState('');

  const getPlatformIcon = (platform: string) => {
    const iconClass = "w-5 h-5";
    switch (platform) {
      case 'LinkedIn': return <Link2 className={iconClass} />;
      case 'GitHub': return <Github className={iconClass} />;
      case 'Twitter': return <FileText className={iconClass} />;
      case 'Medium': return <FileText className={iconClass} />;
      default: return <ExternalLink className={iconClass} />;
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'Award': return <Trophy size={20} style={{ color: colors.badgeWarningText }} />;
      case 'Publication': return <FileText size={20} style={{ color: colors.primaryBlue }} />;
      case 'Speaking': return <FileText size={20} style={{ color: colors.badgePurpleText }} />;
      case 'Certification': return <Award size={20} style={{ color: colors.successGreen }} />;
      default: return <Trophy size={20} style={{ color: colors.tertiaryText }} />;
    }
  };

  const handleAddLink = () => {
    if (tempLink.url.trim()) {
      const links = [...(userData.socialLinks || []), tempLink];
      onUserDataChange({ socialLinks: links });
      setTempLink({ platform: 'LinkedIn', url: '' });
      setShowAddLinkModal(false);
    }
  };

  const handleEditLink = (index: number) => {
    const links = [...(userData.socialLinks || [])];
    links[index] = tempLink;
    onUserDataChange({ socialLinks: links });
    setEditingLinkIndex(null);
  };

  const handleDeleteLink = (index: number) => {
    const links = userData.socialLinks?.filter((_, i) => i !== index) || [];
    onUserDataChange({ socialLinks: links });
  };

  const handleAddProject = () => {
    if (tempProject.title.trim()) {
      const projects = [...(userData.projects || []), tempProject];
      onUserDataChange({ projects });
      setTempProject({ title: '', description: '', technologies: [], date: '', link: '', github: '' });
      setShowAddProjectModal(false);
    }
  };

  const handleEditProject = (index: number) => {
    const projects = [...(userData.projects || [])];
    projects[index] = tempProject;
    onUserDataChange({ projects });
    setEditingProjectIndex(null);
  };

  const handleDeleteProject = (index: number) => {
    const projects = userData.projects?.filter((_, i) => i !== index) || [];
    onUserDataChange({ projects });
  };

  const handleAddAchievement = () => {
    if (tempAchievement.title.trim()) {
      const achievements = [...(userData.achievements || []), tempAchievement];
      onUserDataChange({ achievements });
      setTempAchievement({ type: 'Award', title: '', description: '', date: '', link: '' });
      setShowAddAchievementModal(false);
    }
  };

  const handleEditAchievement = (index: number) => {
    const achievements = [...(userData.achievements || [])];
    achievements[index] = tempAchievement;
    onUserDataChange({ achievements });
    setEditingAchievementIndex(null);
  };

  const handleDeleteAchievement = (index: number) => {
    const achievements = userData.achievements?.filter((_, i) => i !== index) || [];
    onUserDataChange({ achievements });
  };

  const addTechnology = () => {
    if (newTech.trim()) {
      setTempProject({ ...tempProject, technologies: [...tempProject.technologies, newTech.trim()] });
      setNewTech('');
    }
  };

  const removeTechnology = (index: number) => {
    setTempProject({ ...tempProject, technologies: tempProject.technologies.filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Portfolio & Achievements
        </h2>
        <p 
          style={{ color: colors.secondaryText }}
        >
          Showcase your work, projects, and professional achievements
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Social Links */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <Link2 style={{ color: colors.primaryBlue }} />
              Professional Links
            </h3>
            {isEditing && (
              <button
                onClick={() => setShowAddLinkModal(true)}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
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
                <Plus size={16} />
                Add Link
              </button>
            )}
          </div>
          {userData.socialLinks && userData.socialLinks.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {userData.socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl border transition-all"
                  style={{
                    background: editingLinkIndex === index ? colors.badgeInfoBg : colors.inputBackground,
                    border: `1px solid ${editingLinkIndex === index ? colors.badgeInfoBorder : colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    if (editingLinkIndex !== index) {
                      e.currentTarget.style.background = colors.hoverBackground;
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (editingLinkIndex !== index) {
                      e.currentTarget.style.background = colors.inputBackground;
                      e.currentTarget.style.borderColor = colors.border;
                    }
                  }}
                >
                  {editingLinkIndex === index ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={tempLink.platform}
                        onChange={(e) => setTempLink({ ...tempLink, platform: e.target.value })}
                        className="w-full px-2 py-1 rounded text-sm transition-all"
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
                        placeholder="Platform"
                      />
                      <input
                        type="url"
                        value={tempLink.url}
                        onChange={(e) => setTempLink({ ...tempLink, url: e.target.value })}
                        className="w-full px-2 py-1 rounded text-sm transition-all"
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
                        placeholder="URL"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditLink(index)}
                          className="flex-1 px-2 py-1 text-white text-xs rounded transition-all"
                          style={{
                            background: colors.successGreen,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          aria-label="Save link"
                          title="Save link"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setEditingLinkIndex(null)}
                          className="flex-1 px-2 py-1 text-xs rounded transition-all"
                          style={{
                            background: colors.inputBackground,
                            color: colors.secondaryText,
                            border: `1px solid ${colors.border}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.hoverBackgroundStrong;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = colors.inputBackground;
                          }}
                          aria-label="Cancel editing link"
                          title="Cancel editing link"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ color: colors.tertiaryText }}>
                      {getPlatformIcon(link.platform)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p 
                          className="font-medium"
                          style={{ color: colors.primaryText }}
                        >
                          {link.platform}
                        </p>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs truncate transition-colors"
                          style={{ color: colors.secondaryText }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.primaryBlue;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.secondaryText;
                          }}
                        >
                          {link.url}
                        </a>
                      </div>
                      <ExternalLink size={16} style={{ color: colors.tertiaryText }} />
                      {isEditing && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setTempLink(link);
                              setEditingLinkIndex(index);
                            }}
                            className="p-1 rounded transition-colors"
                            style={{ color: colors.primaryBlue }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = colors.badgeInfoBg;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                            title="Edit"
                            aria-label={`Edit ${link.platform}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this link?')) handleDeleteLink(index);
                            }}
                            className="p-1 rounded transition-colors"
                            style={{ color: colors.errorRed }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = colors.badgeErrorBg;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                            title="Delete"
                            aria-label={`Delete ${link.platform}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-8"
              style={{ color: colors.tertiaryText }}
            >
              No professional links yet
            </div>
          )}
        </div>

        {/* Projects Showcase */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <FileText style={{ color: colors.primaryBlue }} />
              Featured Projects
            </h3>
            {isEditing && (
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
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
                <Plus size={16} />
                Add Project
              </button>
            )}
          </div>
          {userData.projects && userData.projects.length > 0 ? (
            <div className="space-y-6">
              {userData.projects.map((project, index) => (
                <div 
                  key={index} 
                  className="p-6 rounded-xl border transition-all"
                  style={{
                    background: editingProjectIndex === index ? colors.badgeInfoBg : colors.inputBackground,
                    border: `1px solid ${editingProjectIndex === index ? colors.badgeInfoBorder : colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    if (editingProjectIndex !== index) {
                      e.currentTarget.style.background = colors.hoverBackground;
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (editingProjectIndex !== index) {
                      e.currentTarget.style.background = colors.inputBackground;
                      e.currentTarget.style.borderColor = colors.border;
                    }
                  }}
                >
                  {editingProjectIndex === index ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={tempProject.title}
                        onChange={(e) => setTempProject({ ...tempProject, title: e.target.value })}
                        placeholder="Project Title"
                        className="w-full px-3 py-2 rounded-lg transition-all"
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
                      />
                      <textarea
                        value={tempProject.description}
                        onChange={(e) => setTempProject({ ...tempProject, description: e.target.value })}
                        placeholder="Description"
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg transition-all resize-none"
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
                      />
                      <div className="flex flex-wrap gap-2">
                        {tempProject.technologies.map((tech, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 rounded flex items-center gap-1 text-xs"
                            style={{
                              background: colors.badgeInfoBg,
                              color: colors.badgeInfoText,
                              border: `1px solid ${colors.badgeInfoBorder}`,
                            }}
                          >
                            {tech}
                            <button 
                              onClick={() => removeTechnology(i)}
                              style={{ color: colors.errorRed }}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={newTech}
                          onChange={(e) => setNewTech(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                          placeholder="Add tech"
                          className="px-2 py-1 rounded text-xs transition-all"
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
                        />
                        <button 
                          onClick={addTechnology} 
                          className="px-2 py-1 text-white rounded text-xs transition-all"
                          style={{
                            background: colors.primaryBlue,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          Add
                        </button>
                      </div>
                      <input
                        type="text"
                        value={tempProject.date}
                        onChange={(e) => setTempProject({ ...tempProject, date: e.target.value })}
                        placeholder="Date (YYYY-MM)"
                        className="w-full px-3 py-2 rounded-lg transition-all"
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
                      />
                      <input
                        type="url"
                        value={tempProject.link || ''}
                        onChange={(e) => setTempProject({ ...tempProject, link: e.target.value })}
                        placeholder="Live Demo URL (optional)"
                        className="w-full px-3 py-2 rounded-lg transition-all"
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
                      />
                      <input
                        type="url"
                        value={tempProject.github || ''}
                        onChange={(e) => setTempProject({ ...tempProject, github: e.target.value })}
                        placeholder="GitHub URL (optional)"
                        className="w-full px-3 py-2 rounded-lg transition-all"
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
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditProject(index)} 
                          className="flex-1 px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
                          style={{
                            background: colors.successGreen,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          <Check size={16} /> Save
                        </button>
                        <button 
                          onClick={() => setEditingProjectIndex(null)} 
                          className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                          style={{
                            background: colors.inputBackground,
                            color: colors.secondaryText,
                            border: `1px solid ${colors.border}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.hoverBackgroundStrong;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = colors.inputBackground;
                          }}
                        >
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 
                            className="font-semibold mb-2"
                            style={{ color: colors.primaryText }}
                          >
                            {project.title}
                          </h4>
                          <p 
                            className="text-sm mb-3"
                            style={{ color: colors.secondaryText }}
                          >
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies.map((tech, techIndex) => (
                              <span 
                                key={techIndex} 
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  background: colors.badgeInfoBg,
                                  color: colors.badgeInfoText,
                                  border: `1px solid ${colors.badgeInfoBorder}`,
                                }}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div 
                            className="flex items-center gap-4 text-xs"
                            style={{ color: colors.tertiaryText }}
                          >
                            <span>{project.date}</span>
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setTempProject(project);
                                setEditingProjectIndex(index);
                              }}
                              className="p-2 rounded transition-colors"
                              style={{ color: colors.primaryBlue }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.badgeInfoBg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                              title="Edit"
                              aria-label={`Edit ${project.title}`}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this project?')) handleDeleteProject(index);
                              }}
                              className="p-2 rounded transition-colors"
                              style={{ color: colors.errorRed }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.badgeErrorBg;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                              title="Delete"
                              aria-label={`Delete ${project.title}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      {(project.link || project.github) && (
                        <div className="flex gap-3 mt-4">
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm"
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
                              <ExternalLink size={14} />
                              Live Demo
                            </a>
                          )}
                          {project.github && (
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm"
                              style={{
                                background: colors.inputBackground,
                                color: colors.primaryText,
                                border: `1px solid ${colors.border}`,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                                e.currentTarget.style.borderColor = colors.borderFocused;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = colors.inputBackground;
                                e.currentTarget.style.borderColor = colors.border;
                              }}
                            >
                              <Github size={14} />
                              View Code
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-8"
              style={{ color: colors.tertiaryText }}
            >
              No projects yet
            </div>
          )}
        </div>

        {/* Achievements */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <Trophy style={{ color: colors.badgeWarningText }} />
              Awards & Achievements
            </h3>
            {isEditing && (
              <button
                onClick={() => setShowAddAchievementModal(true)}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
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
                <Plus size={16} />
                Add Achievement
              </button>
            )}
          </div>
          {userData.achievements && userData.achievements.length > 0 ? (
            <div className="space-y-4">
              {userData.achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-xl border transition-all"
                  style={{
                    background: editingAchievementIndex === index ? colors.badgeWarningBg : colors.inputBackground,
                    border: `1px solid ${editingAchievementIndex === index ? colors.badgeWarningBorder : colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    if (editingAchievementIndex !== index) {
                      e.currentTarget.style.background = colors.hoverBackground;
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (editingAchievementIndex !== index) {
                      e.currentTarget.style.background = colors.inputBackground;
                      e.currentTarget.style.borderColor = colors.border;
                    }
                  }}
                >
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: colors.badgeWarningBg }}
                  >
                    {getAchievementIcon(achievement.type)}
                  </div>
                  {editingAchievementIndex === index ? (
                    <div className="flex-1 space-y-2">
                      <select
                        value={tempAchievement.type}
                        onChange={(e) => setTempAchievement({ ...tempAchievement, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg transition-all"
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
                        <option value="Award" style={{ background: colors.background, color: colors.secondaryText }}>Award</option>
                        <option value="Publication" style={{ background: colors.background, color: colors.secondaryText }}>Publication</option>
                        <option value="Speaking" style={{ background: colors.background, color: colors.secondaryText }}>Speaking Engagement</option>
                        <option value="Certification" style={{ background: colors.background, color: colors.secondaryText }}>Certification</option>
                      </select>
                      <input
                        type="text"
                        value={tempAchievement.title}
                        onChange={(e) => setTempAchievement({ ...tempAchievement, title: e.target.value })}
                        placeholder="Achievement Title"
                        className="w-full px-3 py-2 rounded-lg transition-all"
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
                      />
                      <textarea
                        value={tempAchievement.description}
                        onChange={(e) => setTempAchievement({ ...tempAchievement, description: e.target.value })}
                        placeholder="Description"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg transition-all resize-none"
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
                      />
                      <input
                        type="text"
                        value={tempAchievement.date}
                        onChange={(e) => setTempAchievement({ ...tempAchievement, date: e.target.value })}
                        placeholder="Date (YYYY-MM)"
                        className="w-full px-3 py-2 rounded-lg transition-all"
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
                      />
                      <input
                        type="url"
                        value={tempAchievement.link || ''}
                        onChange={(e) => setTempAchievement({ ...tempAchievement, link: e.target.value })}
                        placeholder="Link (optional)"
                        className="w-full px-3 py-2 rounded-lg transition-all"
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
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditAchievement(index)} 
                          className="flex-1 px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
                          style={{
                            background: colors.successGreen,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          <Check size={16} /> Save
                        </button>
                        <button 
                          onClick={() => setEditingAchievementIndex(null)} 
                          className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                          style={{
                            background: colors.inputBackground,
                            color: colors.secondaryText,
                            border: `1px solid ${colors.border}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.hoverBackgroundStrong;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = colors.inputBackground;
                          }}
                        >
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <h4 
                          className="font-semibold mb-1"
                          style={{ color: colors.primaryText }}
                        >
                          {achievement.title}
                        </h4>
                        <p 
                          className="text-sm mb-2"
                          style={{ color: colors.secondaryText }}
                        >
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <span 
                            className="text-xs"
                            style={{ color: colors.tertiaryText }}
                          >
                            {achievement.date}
                          </span>
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              background: colors.badgeWarningBg,
                              color: colors.badgeWarningText,
                              border: `1px solid ${colors.badgeWarningBorder}`,
                            }}
                          >
                            {achievement.type}
                          </span>
                          {achievement.link && (
                            <a
                              href={achievement.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs transition-colors"
                              style={{ color: colors.primaryBlue }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = colors.primaryBlueHover;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = colors.primaryBlue;
                              }}
                            >
                              View Details
                            </a>
                          )}
                        </div>
                      </div>
                      {isEditing && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setTempAchievement(achievement);
                              setEditingAchievementIndex(index);
                            }}
                            className="p-2 rounded transition-colors"
                            style={{ color: colors.primaryBlue }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = colors.badgeInfoBg;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                            title="Edit"
                            aria-label={`Edit ${achievement.title}`}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this achievement?')) handleDeleteAchievement(index);
                            }}
                            className="p-2 rounded transition-colors"
                            style={{ color: colors.errorRed }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = colors.badgeErrorBg;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                            title="Delete"
                            aria-label={`Delete ${achievement.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-8"
              style={{ color: colors.tertiaryText }}
            >
              No achievements yet
            </div>
          )}
        </div>

        {/* Basic Portfolio Links (Backward Compatibility) */}
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
            Quick Links
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                Portfolio Website
              </label>
              <input
                type="url"
                value={userData.portfolio}
                onChange={(e) => onUserDataChange({ portfolio: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl transition-all duration-200"
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
                placeholder="https://yourportfolio.com"
              />
            </div>
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                LinkedIn
              </label>
              <input
                type="url"
                value={userData.linkedin}
                onChange={(e) => onUserDataChange({ linkedin: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl transition-all duration-200"
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
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                GitHub
              </label>
              <input
                type="url"
                value={userData.github}
                onChange={(e) => onUserDataChange({ github: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl transition-all duration-200"
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
                placeholder="https://github.com/yourusername"
              />
            </div>
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                Personal Website
              </label>
              <input
                type="url"
                value={userData.website}
                onChange={(e) => onUserDataChange({ website: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl transition-all duration-200"
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
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Link Modal */}
      {showAddLinkModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-md"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                Add Professional Link
              </h3>
              <button 
                onClick={() => setShowAddLinkModal(false)} 
                className="p-2 rounded transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Platform
                </label>
                <input
                  type="text"
                  value={tempLink.platform}
                  onChange={(e) => setTempLink({ ...tempLink, platform: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg transition-all"
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
                  placeholder="e.g., LinkedIn, GitHub"
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  URL
                </label>
                <input
                  type="url"
                  value={tempLink.url}
                  onChange={(e) => setTempLink({ ...tempLink, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg transition-all"
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
                  placeholder="https://"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddLinkModal(false)}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                disabled={!tempLink.url.trim()}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: !tempLink.url.trim() ? colors.inputBackground : colors.primaryBlue,
                  color: !tempLink.url.trim() ? colors.tertiaryText : 'white',
                  opacity: !tempLink.url.trim() ? 0.5 : 1,
                  cursor: !tempLink.url.trim() ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (tempLink.url.trim()) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tempLink.url.trim()) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                Add Project
              </h3>
              <button 
                onClick={() => setShowAddProjectModal(false)} 
                className="p-2 rounded transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={tempProject.title}
                onChange={(e) => setTempProject({ ...tempProject, title: e.target.value })}
                placeholder="Project Title"
                className="w-full px-3 py-2 rounded-lg transition-all"
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
              />
              <textarea
                value={tempProject.description}
                onChange={(e) => setTempProject({ ...tempProject, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="w-full px-3 py-2 rounded-lg transition-all resize-none"
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
              />
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Technologies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tempProject.technologies.map((tech, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                      style={{
                        background: colors.badgeInfoBg,
                        color: colors.badgeInfoText,
                        border: `1px solid ${colors.badgeInfoBorder}`,
                      }}
                    >
                      {tech}
                      <button 
                        onClick={() => removeTechnology(i)}
                        style={{ color: colors.errorRed }}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    placeholder="Add technology"
                    className="flex-1 px-3 py-2 rounded-lg text-sm transition-all"
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
                  />
                  <button 
                    onClick={addTechnology} 
                    className="px-4 py-2 rounded-lg text-sm transition-all"
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
                    Add
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={tempProject.date}
                onChange={(e) => setTempProject({ ...tempProject, date: e.target.value })}
                placeholder="Date (YYYY-MM)"
                className="w-full px-3 py-2 rounded-lg transition-all"
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
              />
              <input
                type="url"
                value={tempProject.link || ''}
                onChange={(e) => setTempProject({ ...tempProject, link: e.target.value })}
                placeholder="Live Demo URL (optional)"
                className="w-full px-3 py-2 rounded-lg transition-all"
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
              />
              <input
                type="url"
                value={tempProject.github || ''}
                onChange={(e) => setTempProject({ ...tempProject, github: e.target.value })}
                placeholder="GitHub URL (optional)"
                className="w-full px-3 py-2 rounded-lg transition-all"
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
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                disabled={!tempProject.title.trim()}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: !tempProject.title.trim() ? colors.inputBackground : colors.primaryBlue,
                  color: !tempProject.title.trim() ? colors.tertiaryText : 'white',
                  opacity: !tempProject.title.trim() ? 0.5 : 1,
                  cursor: !tempProject.title.trim() ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (tempProject.title.trim()) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tempProject.title.trim()) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {showAddAchievementModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-md"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                Add Achievement
              </h3>
              <button 
                onClick={() => setShowAddAchievementModal(false)} 
                className="p-2 rounded transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Type
                </label>
                <select
                  value={tempAchievement.type}
                  onChange={(e) => setTempAchievement({ ...tempAchievement, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg transition-all"
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
                  <option value="Award" style={{ background: colors.background, color: colors.secondaryText }}>Award</option>
                  <option value="Publication" style={{ background: colors.background, color: colors.secondaryText }}>Publication</option>
                  <option value="Speaking" style={{ background: colors.background, color: colors.secondaryText }}>Speaking Engagement</option>
                  <option value="Certification" style={{ background: colors.background, color: colors.secondaryText }}>Certification</option>
                </select>
              </div>
              <input
                type="text"
                value={tempAchievement.title}
                onChange={(e) => setTempAchievement({ ...tempAchievement, title: e.target.value })}
                placeholder="Achievement Title"
                className="w-full px-3 py-2 rounded-lg transition-all"
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
              />
              <textarea
                value={tempAchievement.description}
                onChange={(e) => setTempAchievement({ ...tempAchievement, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full px-3 py-2 rounded-lg transition-all resize-none"
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
              />
              <input
                type="text"
                value={tempAchievement.date}
                onChange={(e) => setTempAchievement({ ...tempAchievement, date: e.target.value })}
                placeholder="Date (YYYY-MM)"
                className="w-full px-3 py-2 rounded-lg transition-all"
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
              />
              <input
                type="url"
                value={tempAchievement.link || ''}
                onChange={(e) => setTempAchievement({ ...tempAchievement, link: e.target.value })}
                placeholder="Link (optional)"
                className="w-full px-3 py-2 rounded-lg transition-all"
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
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddAchievementModal(false)}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddAchievement}
                disabled={!tempAchievement.title.trim()}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: !tempAchievement.title.trim() ? colors.inputBackground : colors.badgeWarningText,
                  color: !tempAchievement.title.trim() ? colors.tertiaryText : 'white',
                  opacity: !tempAchievement.title.trim() ? 0.5 : 1,
                  cursor: !tempAchievement.title.trim() ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (tempAchievement.title.trim()) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tempAchievement.title.trim()) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                Add Achievement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
