'use client';

import React, { useState } from 'react';
import { Plus, Edit, Save, X, Trash2 } from 'lucide-react';
import { Project } from '../../../types/resume';

interface ProjectSectionProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (id: number, updates: Partial<Project>) => void;
  onRemoveProject: (id: number) => void;
}

export default function ProjectSection({
  projects,
  onAddProject,
  onUpdateProject,
  onRemoveProject
}: ProjectSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    subtitle: '',
    link: '',
    description: '',
    skills: [],
    bullets: []
  });

  const handleAddProject = () => {
    if (newProject.name) {
      onAddProject({
        id: Date.now(),
        name: newProject.name!,
        subtitle: newProject.subtitle || '',
        link: newProject.link || '',
        description: newProject.description || '',
        skills: newProject.skills || [],
        bullets: newProject.bullets || []
      });
      setNewProject({
        name: '',
        subtitle: '',
        link: '',
        description: '',
        skills: [],
        bullets: []
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Project
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Add Project Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Project</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={newProject.subtitle}
                  onChange={(e) => setNewProject({ ...newProject, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
              <input
                type="url"
                value={newProject.link}
                onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Add Project
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                <p className="text-gray-700">{project.subtitle}</p>
                {project.link && (
                  <a href={project.link} className="text-blue-600 text-sm hover:underline">
                    {project.link}
                  </a>
                )}
                <p className="text-gray-600 mt-2">{project.description}</p>
              </div>
              {isEditing && (
                <button
                  onClick={() => onRemoveProject(project.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              )}
            </div>

            {/* Skills */}
            {project.skills.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {project.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bullet Points */}
            {project.bullets.length > 0 && (
              <ul className="space-y-1">
                {project.bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No projects added yet</p>
          <p className="text-sm">Click "Add Project" to get started</p>
        </div>
      )}
    </div>
  );
}
