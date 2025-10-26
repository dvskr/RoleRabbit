'use client';

import React, { useState } from 'react';
import { FileText, ExternalLink, Github, Award, Trophy, Link2, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { UserData } from '../types/profile';

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
      case 'Award': return <Trophy className="text-yellow-500" size={20} />;
      case 'Publication': return <FileText className="text-blue-500" size={20} />;
      case 'Speaking': return <FileText className="text-purple-500" size={20} />;
      case 'Certification': return <Award className="text-green-500" size={20} />;
      default: return <Trophy className="text-gray-500" size={20} />;
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-2">
          Portfolio & Achievements
        </h2>
        <p className="text-gray-600">Showcase your work, projects, and professional achievements</p>
      </div>
      
      <div className="space-y-8">
        {/* Social Links */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Link2 className="text-indigo-600" />
              Professional Links
            </h3>
            {isEditing && (
              <button
                onClick={() => setShowAddLinkModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
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
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    editingLinkIndex === index 
                      ? 'bg-indigo-50 border-indigo-300' 
                      : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/50 hover:shadow-md'
                  }`}
                >
                  {editingLinkIndex === index ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={tempLink.platform}
                        onChange={(e) => setTempLink({ ...tempLink, platform: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Platform"
                      />
                      <input
                        type="url"
                        value={tempLink.url}
                        onChange={(e) => setTempLink({ ...tempLink, url: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="URL"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditLink(index)}
                          className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setEditingLinkIndex(null)}
                          className="flex-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {getPlatformIcon(link.platform)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{link.platform}</p>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 truncate hover:text-indigo-600"
                        >
                          {link.url}
                        </a>
                      </div>
                      <ExternalLink size={16} className="text-gray-400" />
                      {isEditing && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setTempLink(link);
                              setEditingLinkIndex(index);
                            }}
                            className="p-1 hover:bg-blue-100 rounded"
                            title="Edit"
                          >
                            <Edit size={14} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this link?')) handleDeleteLink(index);
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No professional links yet
            </div>
          )}
        </div>

        {/* Projects Showcase */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Featured Projects
            </h3>
            {isEditing && (
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Project
              </button>
            )}
          </div>
          {userData.projects && userData.projects.length > 0 ? (
            <div className="space-y-6">
              {userData.projects.map((project, index) => (
                <div key={index} className={`p-6 rounded-xl border transition-all ${
                  editingProjectIndex === index 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-md'
                }`}>
                  {editingProjectIndex === index ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={tempProject.title}
                        onChange={(e) => setTempProject({ ...tempProject, title: e.target.value })}
                        placeholder="Project Title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <textarea
                        value={tempProject.description}
                        onChange={(e) => setTempProject({ ...tempProject, description: e.target.value })}
                        placeholder="Description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex flex-wrap gap-2">
                        {tempProject.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded flex items-center gap-1 text-xs">
                            {tech}
                            <button onClick={() => removeTechnology(i)}>
                              <X size={12} className="text-red-600" />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={newTech}
                          onChange={(e) => setNewTech(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                          placeholder="Add tech"
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <button onClick={addTechnology} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                          Add
                        </button>
                      </div>
                      <input
                        type="text"
                        value={tempProject.date}
                        onChange={(e) => setTempProject({ ...tempProject, date: e.target.value })}
                        placeholder="Date (YYYY-MM)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="url"
                        value={tempProject.link || ''}
                        onChange={(e) => setTempProject({ ...tempProject, link: e.target.value })}
                        placeholder="Live Demo URL (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="url"
                        value={tempProject.github || ''}
                        onChange={(e) => setTempProject({ ...tempProject, github: e.target.value })}
                        placeholder="GitHub URL (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleEditProject(index)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                          <Check size={16} /> Save
                        </button>
                        <button onClick={() => setEditingProjectIndex(null)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center justify-center gap-2">
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies.map((tech, techIndex) => (
                              <span key={techIndex} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {tech}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
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
                              className="p-2 hover:bg-blue-100 rounded"
                              title="Edit"
                            >
                              <Edit size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this project?')) handleDeleteProject(index);
                              }}
                              className="p-2 hover:bg-red-100 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-red-600" />
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
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
                              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
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
            <div className="text-center py-8 text-gray-500">
              No projects yet
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="text-yellow-600" />
              Awards & Achievements
            </h3>
            {isEditing && (
              <button
                onClick={() => setShowAddAchievementModal(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Achievement
              </button>
            )}
          </div>
          {userData.achievements && userData.achievements.length > 0 ? (
            <div className="space-y-4">
              {userData.achievements.map((achievement, index) => (
                <div key={index} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  editingAchievementIndex === index 
                    ? 'bg-yellow-50 border-yellow-300' 
                    : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200/50 hover:shadow-md'
                }`}>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    {getAchievementIcon(achievement.type)}
                  </div>
                  {editingAchievementIndex === index ? (
                    <div className="flex-1 space-y-2">
                      <select
                        value={tempAchievement.type}
                        onChange={(e) => setTempAchievement({ ...tempAchievement, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Award">Award</option>
                        <option value="Publication">Publication</option>
                        <option value="Speaking">Speaking Engagement</option>
                        <option value="Certification">Certification</option>
                      </select>
                      <input
                        type="text"
                        value={tempAchievement.title}
                        onChange={(e) => setTempAchievement({ ...tempAchievement, title: e.target.value })}
                        placeholder="Achievement Title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <textarea
                        value={tempAchievement.description}
                        onChange={(e) => setTempAchievement({ ...tempAchievement, description: e.target.value })}
                        placeholder="Description"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={tempAchievement.date}
                        onChange={(e) => setTempAchievement({ ...tempAchievement, date: e.target.value })}
                        placeholder="Date (YYYY-MM)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="url"
                        value={tempAchievement.link || ''}
                        onChange={(e) => setTempAchievement({ ...tempAchievement, link: e.target.value })}
                        placeholder="Link (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleEditAchievement(index)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                          <Check size={16} /> Save
                        </button>
                        <button onClick={() => setEditingAchievementIndex(null)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center justify-center gap-2">
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500">{achievement.date}</span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                            {achievement.type}
                          </span>
                          {achievement.link && (
                            <a
                              href={achievement.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
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
                            className="p-2 hover:bg-blue-100 rounded"
                            title="Edit"
                          >
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this achievement?')) handleDeleteAchievement(index);
                            }}
                            className="p-2 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No achievements yet
            </div>
          )}
        </div>

        {/* Basic Portfolio Links (Backward Compatibility) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Links</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Website</label>
              <input
                type="url"
                value={userData.portfolio}
                onChange={(e) => onUserDataChange({ portfolio: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="https://yourportfolio.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              <input
                type="url"
                value={userData.linkedin}
                onChange={(e) => onUserDataChange({ linkedin: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
              <input
                type="url"
                value={userData.github}
                onChange={(e) => onUserDataChange({ github: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="https://github.com/yourusername"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Personal Website</label>
              <input
                type="url"
                value={userData.website}
                onChange={(e) => onUserDataChange({ website: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Link Modal */}
      {showAddLinkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add Professional Link</h3>
              <button onClick={() => setShowAddLinkModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <input
                  type="text"
                  value={tempLink.platform}
                  onChange={(e) => setTempLink({ ...tempLink, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., LinkedIn, GitHub"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={tempLink.url}
                  onChange={(e) => setTempLink({ ...tempLink, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddLinkModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                disabled={!tempLink.url.trim()}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${!tempLink.url.trim() ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add Project</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={tempProject.title}
                onChange={(e) => setTempProject({ ...tempProject, title: e.target.value })}
                placeholder="Project Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                value={tempProject.description}
                onChange={(e) => setTempProject({ ...tempProject, description: e.target.value })}
                placeholder="Description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tempProject.technologies.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1 text-sm">
                      {tech}
                      <button onClick={() => removeTechnology(i)}>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button onClick={addTechnology} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Add
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={tempProject.date}
                onChange={(e) => setTempProject({ ...tempProject, date: e.target.value })}
                placeholder="Date (YYYY-MM)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="url"
                value={tempProject.link || ''}
                onChange={(e) => setTempProject({ ...tempProject, link: e.target.value })}
                placeholder="Live Demo URL (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="url"
                value={tempProject.github || ''}
                onChange={(e) => setTempProject({ ...tempProject, github: e.target.value })}
                placeholder="GitHub URL (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                disabled={!tempProject.title.trim()}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${!tempProject.title.trim() ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {showAddAchievementModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add Achievement</h3>
              <button onClick={() => setShowAddAchievementModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={tempAchievement.type}
                  onChange={(e) => setTempAchievement({ ...tempAchievement, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Award">Award</option>
                  <option value="Publication">Publication</option>
                  <option value="Speaking">Speaking Engagement</option>
                  <option value="Certification">Certification</option>
                </select>
              </div>
              <input
                type="text"
                value={tempAchievement.title}
                onChange={(e) => setTempAchievement({ ...tempAchievement, title: e.target.value })}
                placeholder="Achievement Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                value={tempAchievement.description}
                onChange={(e) => setTempAchievement({ ...tempAchievement, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={tempAchievement.date}
                onChange={(e) => setTempAchievement({ ...tempAchievement, date: e.target.value })}
                placeholder="Date (YYYY-MM)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="url"
                value={tempAchievement.link || ''}
                onChange={(e) => setTempAchievement({ ...tempAchievement, link: e.target.value })}
                placeholder="Link (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddAchievementModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAchievement}
                disabled={!tempAchievement.title.trim()}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${!tempAchievement.title.trim() ? 'bg-gray-300' : 'bg-yellow-600 hover:bg-yellow-700'}`}
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
