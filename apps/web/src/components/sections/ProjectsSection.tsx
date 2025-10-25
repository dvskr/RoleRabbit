import React from 'react';
import { Eye, Sparkles, GripVertical, Plus, X, Trash2 } from 'lucide-react';
import { ResumeData, ProjectItem, CustomField } from '../../types/resume';

interface ProjectsSectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
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
    <div className="mb-8 p-1 sm:p-2 lg:p-4">
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl  duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="text-gray-400 cursor-move" />
          <h3 className="text-lg font-bold text-black uppercase tracking-wide">
            PROJECTS
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={addProject}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 "
          >
            <Plus size={18} />
            Add
          </button>
          <button 
            onClick={() => onHideSection('projects')}
            className="p-2 hover:bg-gray-100 rounded-xl "
            title={sectionVisibility.projects ? "Hide projects section" : "Show projects section"}
          >
            <Eye size={18} className={sectionVisibility.projects ? "text-gray-600" : "text-gray-400"} />
          </button>
        </div>
      </div>

      {resumeData.projects.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 ">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Plus size={32} className="text-white" />
          </div>
          <p className="text-gray-600 mb-4 font-semibold">No projects added yet</p>
          <button 
            onClick={addProject}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 inline-flex items-center gap-2 font-bold "
          >
            <Plus size={18} />
            Add Project
          </button>
        </div>
      )}

      {resumeData.projects.map((project) => (
        <div key={project.id} className="mb-6 group p-3 sm:p-4 lg:p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10  duration-300 bg-white max-w-full overflow-hidden">
          <div className="flex items-start gap-3 mb-4">
            <GripVertical size={18} className="text-gray-400 cursor-move mt-2" />
            <div className="flex-1 space-y-3">
              <input
                className="font-bold text-sm text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                value={project.name}
                onChange={(e) => updateProject(project.id, { name: e.target.value })}
                placeholder="Project Name"
              />
              <textarea
                className="text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere resize-none"
                rows={2}
                value={project.description}
                onChange={(e) => updateProject(project.id, { description: e.target.value })}
                placeholder="Project Description"
              />
              <input
                className="text-sm text-blue-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                value={project.link}
                onChange={(e) => updateProject(project.id, { link: e.target.value })}
                placeholder="Project Link/URL"
              />
              
              {/* Custom Fields */}
              {(project.customFields || []).map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-3 py-2  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                    value={field.value || ''}
                    onChange={(e) => updateCustomFieldInProject(project.id, field.id, e.target.value)}
                    placeholder={field.name}
                  />
                  <button
                    onClick={() => deleteCustomFieldFromProject(project.id, field.id)}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete field"
                  >
                    <Trash2 size={14} className="text-red-600" />
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
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50  flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add Field
                </button>
              </div>
            </div>
            <button
              onClick={() => deleteProject(project.id)}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-xl "
              title="Delete project"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>

          {/* Bullets */}
          <div className="ml-6 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Key Features</h4>
              <button
                onClick={() => addBullet(project.id)}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50  flex items-center gap-1"
              >
                <Plus size={12} />
                Add Feature
              </button>
            </div>
            {project.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <input
                  className="flex-1 text-sm text-gray-700 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-3 py-2  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                  value={bullet}
                  onChange={(e) => updateBullet(project.id, bulletIndex, e.target.value)}
                  placeholder="Describe a key feature..."
                />
                <button
                  onClick={() => deleteBullet(project.id, bulletIndex)}
                  className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete bullet"
                >
                  <X size={14} className="text-red-600" />
                </button>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="ml-6 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Technologies Used</h4>
              <button
                onClick={() => addSkill(project.id)}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50  flex items-center gap-1"
              >
                <Plus size={12} />
                Add Tech
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill, skillIndex) => (
                <div key={skillIndex} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                  <input
                    className="text-xs text-gray-700 bg-transparent border-none outline-none min-w-0 max-w-full break-words overflow-wrap-anywhere"
                    value={skill}
                    onChange={(e) => updateSkill(project.id, skillIndex, e.target.value)}
                    placeholder="Technology"
                  />
                  <button
                    onClick={() => deleteSkill(project.id, skillIndex)}
                    className="hover:text-red-600 transition-colors"
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
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold px-3 py-2 rounded-lg hover:bg-purple-50 "
          >
            <Sparkles size={16} />
            AI Generate
          </button>
        </div>
      </div>
    </div>
  );
}
