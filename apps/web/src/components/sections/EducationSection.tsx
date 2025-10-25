import React from 'react';
import { Eye, GripVertical, Plus, Trash2 } from 'lucide-react';
import { ResumeData, EducationItem, CustomField } from '../../types/resume';

interface EducationSectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
}

export default function EducationSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection
}: EducationSectionProps) {
  const addEducation = () => {
    const newEducation: EducationItem = {
      id: Date.now(),
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
      customFields: []
    };
    setResumeData(prev => ({ ...prev, education: [...prev.education, newEducation] }));
  };

  const updateEducation = (id: number, updates: Partial<EducationItem>) => {
    const updatedEducation = resumeData.education.map((item) => 
      item.id === id ? { ...item, ...updates } : item
    );
    setResumeData({...resumeData, education: updatedEducation});
  };

  const deleteEducation = (id: number) => {
    const updatedEducation = resumeData.education.filter(item => item.id !== id);
    setResumeData({...resumeData, education: updatedEducation});
  };

  const addCustomFieldToEducation = (eduId: number, field: CustomField) => {
    const edu = resumeData.education.find(e => e.id === eduId)!;
    const currentFields = edu.customFields || [];
    updateEducation(eduId, { customFields: [...currentFields, field] });
  };

  const updateCustomFieldInEducation = (eduId: number, fieldId: string, value: string) => {
    const edu = resumeData.education.find(e => e.id === eduId)!;
    const currentFields = edu.customFields || [];
    const updatedFields = currentFields.map(f => f.id === fieldId ? { ...f, value } : f);
    updateEducation(eduId, { customFields: updatedFields });
  };

  const deleteCustomFieldFromEducation = (eduId: number, fieldId: string) => {
    const edu = resumeData.education.find(e => e.id === eduId)!;
    const currentFields = edu.customFields || [];
    const updatedFields = currentFields.filter(f => f.id !== fieldId);
    updateEducation(eduId, { customFields: updatedFields });
  };

  return (
    <div className="mb-8 p-1 sm:p-2 lg:p-4">
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl  duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="text-gray-400 cursor-move" />
          <h3 className="text-lg font-bold text-black uppercase tracking-wide">
            EDUCATION
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={addEducation}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 "
          >
            <Plus size={18} />
            Add
          </button>
          <button 
            onClick={() => onHideSection('education')}
            className="p-2 hover:bg-gray-100 rounded-xl "
            title={sectionVisibility.education ? "Hide education section" : "Show education section"}
          >
            <Eye size={18} className={sectionVisibility.education ? "text-gray-600" : "text-gray-400"} />
          </button>
        </div>
      </div>

      {resumeData.education.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 ">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Plus size={32} className="text-white" />
          </div>
          <p className="text-gray-600 mb-4 font-semibold">No education added yet</p>
          <button 
            onClick={addEducation}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 inline-flex items-center gap-2 font-bold "
          >
            <Plus size={18} />
            Add Education
          </button>
        </div>
      )}

      {resumeData.education.map((edu) => (
        <div key={edu.id} className="mb-6 group p-3 sm:p-4 lg:p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10  duration-300 bg-white max-w-full overflow-hidden">
          <div className="flex items-start gap-3 mb-4">
            <GripVertical size={18} className="text-gray-400 cursor-move mt-2" />
            <div className="flex-1 space-y-3">
              <input
                className="font-bold text-sm text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                value={edu.school}
                onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                placeholder="School/University Name"
              />
              <input
                className="font-semibold text-sm text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                placeholder="Degree/Program"
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm text-gray-600 min-w-0">
                <input 
                  className="border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-3 py-2  font-medium w-full sm:w-auto min-w-0 max-w-full break-words overflow-wrap-anywhere" 
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                  placeholder="Start Date"
                />
                <span className="font-bold text-gray-400 hidden sm:inline flex-shrink-0">→</span>
                <input 
                  className="border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-3 py-2  font-medium w-full sm:w-auto min-w-0 max-w-full break-words overflow-wrap-anywhere" 
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                  placeholder="End Date"
                />
              </div>
              
              {/* Custom Fields */}
              {(edu.customFields || []).map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-3 py-2  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                    value={field.value || ''}
                    onChange={(e) => updateCustomFieldInEducation(edu.id, field.id, e.target.value)}
                    placeholder={field.name}
                  />
                  <button
                    onClick={() => deleteCustomFieldFromEducation(edu.id, field.id)}
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
                    addCustomFieldToEducation(edu.id, newField);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50  flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add Field
                </button>
              </div>
            </div>
            <button
              onClick={() => deleteEducation(edu.id)}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-xl "
              title="Delete education"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        </div>
      ))}
      
      </div>
    </div>
  );
}
