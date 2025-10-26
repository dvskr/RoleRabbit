'use client';

import React from 'react';
import { FileText, ExternalLink, Github, Award, Trophy, Link2 } from 'lucide-react';
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
        {userData.socialLinks && userData.socialLinks.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Link2 className="text-indigo-600" />
              Professional Links
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {userData.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200/50 hover:shadow-md transition-all"
                >
                  {getPlatformIcon(link.platform)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{link.platform}</p>
                    <p className="text-xs text-gray-500 truncate">{link.url}</p>
                  </div>
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Projects Showcase */}
        {userData.projects && userData.projects.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Featured Projects
            </h3>
            <div className="space-y-6">
              {userData.projects.map((project, index) => (
                <div key={index} className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all">
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {userData.achievements && userData.achievements.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-600" />
              Awards & Achievements
            </h3>
            <div className="space-y-4">
              {userData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/50 hover:shadow-md transition-all">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    {getAchievementIcon(achievement.type)}
                  </div>
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
                </div>
              ))}
            </div>
          </div>
        )}

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
    </div>
  );
}
