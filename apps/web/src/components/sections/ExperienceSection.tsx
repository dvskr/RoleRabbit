import React from 'react';
import { Eye, Sparkles, GripVertical, Plus, X, Trash2 } from 'lucide-react';
import { ResumeData, ExperienceItem, CustomField } from '../../types/resume';

interface ExperienceSectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
  onOpenAIGenerateModal: (section: string) => void;
}

export default function ExperienceSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection,
  onOpenAIGenerateModal
}: ExperienceSectionProps) {
  const addExperience = () => {
    const newExperience: ExperienceItem = {
      id: Date.now(),
      company: '',
      position: '',
      period: '',
      endPeriod: '',
      location: '',
      bullets: [''],
      environment: [],
      customFields: []
    };
    setResumeData(prev => ({ ...prev, experience: [...prev.experience, newExperience] }));
  };

  const updateExperience = (id: number, updates: Partial<ExperienceItem>) => {
    const updatedExperience = resumeData.experience.map((item) => 
      item.id === id ? { ...item, ...updates } : item
    );
    setResumeData({...resumeData, experience: updatedExperience});
  };

  const deleteExperience = (id: number) => {
    const updatedExperience = resumeData.experience.filter(item => item.id !== id);
    setResumeData({...resumeData, experience: updatedExperience});
  };

  const addBullet = (expId: number) => {
    updateExperience(expId, { bullets: [...resumeData.experience.find(e => e.id === expId)!.bullets, ''] });
  };

  const updateBullet = (expId: number, bulletIndex: number, value: string) => {
    const exp = resumeData.experience.find(e => e.id === expId)!;
    const updatedBullets = [...exp.bullets];
    updatedBullets[bulletIndex] = value;
    updateExperience(expId, { bullets: updatedBullets });
  };

  const deleteBullet = (expId: number, bulletIndex: number) => {
    const exp = resumeData.experience.find(e => e.id === expId)!;
    const updatedBullets = exp.bullets.filter((_, index) => index !== bulletIndex);
    updateExperience(expId, { bullets: updatedBullets });
  };

  const addEnvironment = (expId: number) => {
    const exp = resumeData.experience.find(e => e.id === expId)!;
    updateExperience(expId, { environment: [...exp.environment, ''] });
  };

  const updateEnvironment = (expId: number, envIndex: number, value: string) => {
    const exp = resumeData.experience.find(e => e.id === expId)!;
    const updatedEnvironment = [...exp.environment];
    updatedEnvironment[envIndex] = value;
    updateExperience(expId, { environment: updatedEnvironment });
  };

  const deleteEnvironment = (expId: number, envIndex: number) => {
    const exp = resumeData.experience.find(e => e.id === expId)!;
    const updatedEnvironment = exp.environment.filter((_, index) => index !== envIndex);
    updateExperience(expId, { environment: updatedEnvironment });
  };

  const addCustomFieldToExperience = (expId: number, field: CustomField) => {
    const exp = resumeData.experience.find(e => e.id === expId)!;
    const currentFields = exp.customFields || [];
    updateExperience(expId, { customFields: [...currentFields, field] });
  };

  const updateCustomFieldInExperience = (expId: number, fieldId: string, value: string) => {
    const exp = resumeData.experience.find(e => e.id === expId)!;
    const currentFields = exp.customFields || [];
    const updatedFields = currentFields.map(f => f.id === fieldId ? { ...f, value } : f);
    updateExperience(expId, { customFields: updatedFields });
  };

  const deleteCustomFieldFromExperience = (expId: number, fieldId: string) => {
    const exp = resumeData.experience.find(e => e.id === expId)!;
    const currentFields = exp.customFields || [];
    const updatedFields = currentFields.filter(f => f.id !== fieldId);
    updateExperience(expId, { customFields: updatedFields });
  };

  return (
    <div className="mb-8 p-1 sm:p-2 lg:p-4">
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl  duration-300">
        <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="text-gray-400 cursor-move" />
          <h3 className="text-lg font-bold text-black uppercase tracking-wide">
            EXPERIENCE
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={addExperience}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 "
          >
            <Plus size={18} />
            Add
          </button>
          <button 
            onClick={() => onHideSection('experience')}
            className="p-2 hover:bg-gray-100 rounded-xl "
            title={sectionVisibility.experience ? "Hide experience section" : "Show experience section"}
          >
            <Eye size={18} className={sectionVisibility.experience ? "text-gray-600" : "text-gray-400"} />
          </button>
        </div>
      </div>

      {resumeData.experience.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 ">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Plus size={32} className="text-white" />
          </div>
          <p className="text-gray-600 mb-4 font-semibold">No experience added yet</p>
          <button 
            onClick={addExperience}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 inline-flex items-center gap-2 font-bold "
          >
            <Plus size={18} />
            Add Experience
          </button>
        </div>
      )}

      {resumeData.experience.map((exp) => (
        <div key={exp.id} className="mb-6 group p-3 sm:p-4 lg:p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10  duration-300 bg-white max-w-full overflow-hidden">
          <div className="flex items-start gap-3 mb-4">
            <GripVertical size={18} className="text-gray-400 cursor-move mt-2" />
            <div className="flex-1 space-y-3">
              <input
                className="font-bold text-sm text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                placeholder="Company Name"
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm text-gray-600 min-w-0">
                <input 
                  className="border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-3 py-2  font-medium w-full sm:w-auto min-w-0 max-w-full break-words overflow-wrap-anywhere" 
                  value={exp.period}
                  onChange={(e) => updateExperience(exp.id, { period: e.target.value })}
                  placeholder="Start Date"
                />
                <span className="font-bold text-gray-400 hidden sm:inline flex-shrink-0">→</span>
                <input 
                  className="border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-3 py-2  font-medium w-full sm:w-auto min-w-0 max-w-full break-words overflow-wrap-anywhere" 
                  value={exp.endPeriod}
                  onChange={(e) => updateExperience(exp.id, { endPeriod: e.target.value })}
                  placeholder="End Date"
                />
              </div>
              <input
                className="text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                value={exp.location}
                onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                placeholder="Location"
              />
              <input
                className="font-semibold text-sm text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                value={exp.position}
                onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                placeholder="Job Title"
              />
              
              {/* Custom Fields */}
              {(exp.customFields || []).map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-3 py-2  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                    value={field.value || ''}
                    onChange={(e) => updateCustomFieldInExperience(exp.id, field.id, e.target.value)}
                    placeholder={field.name}
                  />
                  <button
                    onClick={() => deleteCustomFieldFromExperience(exp.id, field.id)}
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
                    addCustomFieldToExperience(exp.id, newField);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50  flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add Field
                </button>
              </div>
            </div>
            <button
              onClick={() => deleteExperience(exp.id)}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-xl "
              title="Delete experience"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>

          {/* Bullets */}
          <div className="ml-6 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Responsibilities</h4>
              <button
                onClick={() => addBullet(exp.id)}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50  flex items-center gap-1"
              >
                <Plus size={12} />
                Add Responsibility
              </button>
            </div>
            {exp.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <input
                  className="flex-1 text-sm text-gray-700 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-3 py-2  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                  value={bullet}
                  onChange={(e) => updateBullet(exp.id, bulletIndex, e.target.value)}
                  placeholder="Describe your responsibility..."
                />
                <button
                  onClick={() => deleteBullet(exp.id, bulletIndex)}
                  className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete bullet"
                >
                  <X size={14} className="text-red-600" />
                </button>
              </div>
            ))}
          </div>

          {/* Environment */}
          <div className="ml-6 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Technologies</h4>
              <button
                onClick={() => addEnvironment(exp.id)}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50  flex items-center gap-1"
              >
                <Plus size={12} />
                Add Tech
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {exp.environment.map((tech, techIndex) => (
                <div key={techIndex} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                  <input
                    className="text-xs text-gray-700 bg-transparent border-none outline-none min-w-0 max-w-full break-words overflow-wrap-anywhere"
                    value={tech}
                    onChange={(e) => updateEnvironment(exp.id, techIndex, e.target.value)}
                    placeholder="Technology"
                  />
                  <button
                    onClick={() => deleteEnvironment(exp.id, techIndex)}
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
            onClick={() => onOpenAIGenerateModal('experience')}
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
