'use client';

import React from 'react';
import { FileText, Sparkles, Layers, Plus, GripVertical, Trash2, Type, Palette, Eye, EyeOff } from 'lucide-react';

interface ResumeEditorProps {
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customSections: any[];
  resumeData: any;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  lineSpacing: string;
  setLineSpacing: (spacing: string) => void;
  sectionSpacing: string;
  setSectionSpacing: (spacing: string) => void;
  margins: string;
  setMargins: (margins: string) => void;
  headingStyle: string;
  setHeadingStyle: (style: string) => void;
  bulletStyle: string;
  setBulletStyle: (style: string) => void;
  onToggleSection: (section: string) => void;
  onMoveSection: (index: number, direction: 'up' | 'down') => void;
  onShowAddSectionModal: () => void;
  onDeleteCustomSection: (id: string) => void;
  onUpdateCustomSection: (id: string, content: string) => void;
  onGenerateSmartFileName: () => string;
  onResetToDefault: () => void;
  renderSection: (section: string) => React.ReactNode;
}

export default function ResumeEditor({
  resumeFileName,
  setResumeFileName,
  sectionOrder,
  sectionVisibility,
  customSections,
  resumeData,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  lineSpacing,
  setLineSpacing,
  sectionSpacing,
  setSectionSpacing,
  margins,
  setMargins,
  headingStyle,
  setHeadingStyle,
  bulletStyle,
  setBulletStyle,
  onToggleSection,
  onMoveSection,
  onShowAddSectionModal,
  onDeleteCustomSection,
  onUpdateCustomSection,
  onGenerateSmartFileName,
  onResetToDefault,
  renderSection
}: ResumeEditorProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar - Section Controls */}
      <div className="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 overflow-y-auto p-6">
        {/* File Name Configuration */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <FileText size={16} className="text-blue-600" />
              File Name
            </h3>
            <button
              onClick={() => setResumeFileName(onGenerateSmartFileName())}
              className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-110"
              title="Generate Smart Filename"
            >
              <Sparkles size={12} />
            </button>
          </div>
          <input
            type="text"
            value={resumeFileName}
            onChange={(e) => setResumeFileName(e.target.value)}
            placeholder="Enter filename..."
            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white/90"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 AI generates: Name_Title_YYYY-MM format
          </p>
        </div>

         {/* Sections */}
         <div className="mb-6">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
               <Layers size={18} className="text-purple-600" />
               Sections
             </h3>
             <button
               onClick={onShowAddSectionModal}
               className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-110"
               title="Add Custom Section"
             >
               <Plus size={16} />
             </button>
           </div>
          
           <div className="space-y-2">
             {sectionOrder.map((section, index) => {
               const isCustom = customSections.find(s => s.id === section);
               const displayName = isCustom ? isCustom.name : section;

               return (
                 <div key={section} className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between group hover:shadow-sm transition-all duration-200">
                   <div className="flex items-center gap-3">
                     <button
                       onClick={() => onToggleSection(section)}
                       className="p-1 hover:bg-gray-100 rounded transition-colors"
                     >
                       {sectionVisibility[section] ? (
                         <Eye size={16} className="text-blue-600" />
                       ) : (
                         <EyeOff size={16} className="text-gray-400" />
                       )}
                     </button>
                     <span className="text-sm font-medium text-gray-800">{displayName.charAt(0).toUpperCase() + displayName.slice(1)}</span>
                   </div>
                   <div className="flex items-center gap-1">
                     {index > 0 && (
                       <button
                         onClick={() => onMoveSection(index, 'up')}
                         className="p-1 hover:bg-gray-100 rounded transition-colors"
                         title="Move Up"
                       >
                         <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                         </svg>
                       </button>
                     )}
                     {index < sectionOrder.length - 1 && (
                       <button
                         onClick={() => onMoveSection(index, 'down')}
                         className="p-1 hover:bg-gray-100 rounded transition-colors"
                         title="Move Down"
                       >
                         <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                         </svg>
                       </button>
                     )}
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

         {/* Formatting */}
         <div className="mb-6">
           <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base mb-4">
             <Palette size={18} className="text-purple-600" />
             Formatting
           </h3>

          {/* Font Family */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm mb-2">
              <Type size={14} className="text-gray-500" />
              FONT FAMILY
            </h4>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all bg-white/90"
            >
              <option value="arial">Arial (ATS Recommended)</option>
              <option value="calibri">Calibri</option>
              <option value="times">Times New Roman</option>
              <option value="helvetica">Helvetica</option>
            </select>
          </div>

          {/* Font Size */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 text-sm mb-2">FONT SIZE</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFontSize('ats10pt')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  fontSize === 'ats10pt' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>10pt</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs mt-1">ATS</div>
              </button>
              <button
                onClick={() => setFontSize('ats11pt')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  fontSize === 'ats11pt' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>11pt</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs mt-1">ATS</div>
              </button>
              <button
                onClick={() => setFontSize('ats12pt')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  fontSize === 'ats12pt' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>12pt</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs mt-1">ATS</div>
              </button>
            </div>
          </div>

          {/* Line Spacing */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 text-sm mb-2">LINE SPACING</h4>
            <select
              value={lineSpacing}
              onChange={(e) => setLineSpacing(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all bg-white/90"
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="loose">Loose</option>
            </select>
          </div>

          {/* Section Spacing */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 text-sm mb-2">SECTION SPACING</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setSectionSpacing('tight')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  sectionSpacing === 'tight' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tight
              </button>
              <button
                onClick={() => setSectionSpacing('medium')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  sectionSpacing === 'medium' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setSectionSpacing('loose')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  sectionSpacing === 'loose' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Loose
              </button>
            </div>
          </div>

          {/* Page Margins */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 text-sm mb-2">PAGE MARGINS</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setMargins('narrow')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  margins === 'narrow' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Narrow
              </button>
              <button
                onClick={() => setMargins('normal')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  margins === 'normal' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setMargins('wide')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  margins === 'wide' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Wide
              </button>
            </div>
          </div>

          {/* Heading Weight */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 text-sm mb-2">HEADING WEIGHT</h4>
            <select
              value={headingStyle}
              onChange={(e) => setHeadingStyle(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all bg-white/90"
            >
              <option value="bold">Bold</option>
              <option value="semibold">Semi Bold</option>
              <option value="extrabold">Extra Bold</option>
            </select>
          </div>

          {/* Bullet Style */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 text-sm mb-2">BULLET STYLE</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBulletStyle('disc')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  bulletStyle === 'disc' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-lg">•</div>
              </button>
              <button
                onClick={() => setBulletStyle('circle')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  bulletStyle === 'circle' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-lg">◦</div>
              </button>
              <button
                onClick={() => setBulletStyle('square')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  bulletStyle === 'square' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-lg">▪</div>
              </button>
              <button
                onClick={() => setBulletStyle('arrow')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  bulletStyle === 'arrow' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-lg">→</div>
              </button>
              <button
                onClick={() => setBulletStyle('check')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  bulletStyle === 'check' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-lg">✓</div>
              </button>
              <button
                onClick={() => setBulletStyle('dash')}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  bulletStyle === 'dash' 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-lg">–</div>
              </button>
            </div>
          </div>

          {/* Reset to Default */}
          <button
            onClick={onResetToDefault}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <div className="w-4 h-4 border-2 border-gray-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
            Reset to Default
          </button>
        </div>
      </div>

      {/* Main Resume Content Area */}
      <div className="flex-1 bg-white/80 backdrop-blur-xl overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200/50">
            {/* Resume Header */}
            <div className="text-center mb-8 pb-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {resumeData.name || 'Your Name'}
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                {resumeData.title || 'Your Professional Title'}
              </p>
              <div className="flex justify-center gap-4 text-sm text-gray-500">
                <span>{resumeData.email || 'your.email@example.com'}</span>
                <span>{resumeData.phone || '(555) 123-4567'}</span>
                <span>{resumeData.location || 'City, State'}</span>
              </div>
            </div>

            {/* Resume Sections */}
            <div className="space-y-6">
              {sectionOrder.map(section => renderSection(section))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
