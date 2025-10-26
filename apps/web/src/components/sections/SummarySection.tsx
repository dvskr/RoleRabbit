import React from 'react';
import { Eye, Sparkles, GripVertical } from 'lucide-react';
import { ResumeData } from '../../types/resume';

interface SummarySectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
  onOpenAIGenerateModal: (section: string) => void;
}

export default function SummarySection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection,
  onOpenAIGenerateModal
}: SummarySectionProps) {
  return (
    <div className="mb-8 p-1 sm:p-2 lg:p-4">
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl  duration-300">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <GripVertical size={18} className="text-gray-400 cursor-move" />
            <h3 className="text-lg font-bold text-black uppercase tracking-wide">
              SUMMARY
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onHideSection('summary')}
              className="p-2 hover:bg-gray-100 rounded-xl "
              title={sectionVisibility.summary ? "Hide summary section" : "Show summary section"}
            >
              <Eye size={18} className={sectionVisibility.summary ? "text-gray-600" : "text-gray-400"} />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <textarea
            className="w-full text-sm text-gray-700 border-2 border-gray-200 rounded-xl p-2 sm:p-4 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none  break-words overflow-wrap-anywhere"
            rows={4}
            value={resumeData.summary}
            onChange={(e) => setResumeData({...resumeData, summary: (e.target as HTMLTextAreaElement).value})}
            placeholder="Write a compelling professional summary..."
          />
          <div className="flex justify-end">
            <button 
              onClick={() => onOpenAIGenerateModal('summary')}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold px-3 py-2 rounded-lg hover:bg-purple-50 "
            >
              <Sparkles size={16} />
              AI Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
