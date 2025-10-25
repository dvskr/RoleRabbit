import React from 'react';
import { Eye, Sparkles, GripVertical, X, Plus } from 'lucide-react';
import { ResumeData } from '../../types/resume';

interface SkillsSectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
  onOpenAIGenerateModal: (section: string) => void;
}

export default function SkillsSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection,
  onOpenAIGenerateModal
}: SkillsSectionProps) {
  return (
    <div className="mb-8 p-1 sm:p-2 lg:p-4">
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl  duration-300">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <GripVertical size={18} className="text-gray-400 cursor-move" />
            <h3 className="text-lg font-bold text-black uppercase tracking-wide">
              SKILLS
            </h3>
          </div>
          <button
            onClick={() => onHideSection('skills')}
            className="p-2 hover:bg-gray-100 rounded-xl "
            title={sectionVisibility.skills ? "Hide skills section" : "Show skills section"}
          >
            <Eye size={18} className={sectionVisibility.skills ? "text-gray-600" : "text-gray-400"} />
          </button>
        </div>
        
        {/* Skills Container */}
        <div className="p-1 sm:p-2 lg:p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Skills</h4>
          </div>
          
          <div className="flex flex-wrap gap-2 min-w-0 w-full">
            {resumeData.skills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-black hover:border-gray-600  group min-w-0 max-w-full flex-shrink-0">
                <span className="text-xs text-black font-medium break-words overflow-wrap-anywhere min-w-0">{skill}</span>
                <button
                  onClick={() => {
                    const updatedSkills = resumeData.skills.filter((_, index) => index !== idx);
                    setResumeData(prev => ({ ...prev, skills: updatedSkills }));
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700  flex-shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {/* Inline skill input */}
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border-2 border-black min-w-0 max-w-full flex-shrink-0">
              <input
                type="text"
                placeholder="Enter skill..."
                className="text-xs text-black font-medium bg-transparent border-none outline-none w-24 min-w-0 max-w-full break-words overflow-wrap-anywhere"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if ((e.target as HTMLInputElement).value.trim()) {
                      setResumeData(prev => ({ ...prev, skills: [...prev.skills, (e.target as HTMLInputElement).value.trim()] }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                onBlur={(e) => {
                  if ((e.target as HTMLInputElement).value.trim()) {
                    setResumeData(prev => ({ ...prev, skills: [...prev.skills, (e.target as HTMLInputElement).value.trim()] }));
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    setResumeData(prev => ({ ...prev, skills: [...prev.skills, input.value.trim()] }));
                    input.value = '';
                  }
                }}
                className="text-black hover:text-gray-600  flex-shrink-0"
              >
                <Plus size={12} />
              </button>
            </div>
            
            {resumeData.skills.length === 0 && (
              <span className="text-xs text-gray-500 italic">No skills added yet</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-3">
          <button 
            onClick={() => onOpenAIGenerateModal('skills')}
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
