'use client';

import React from 'react';
import { FileText, Sparkles, Layers, Plus, GripVertical, Trash2, Type, Palette, Eye, EyeOff, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

interface ResumeEditorProps {
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customSections: any[];
  resumeData: any;
  setResumeData: (data: any) => void;
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
  showAddFieldModal: boolean;
  setShowAddFieldModal: (show: boolean) => void;
  customFields: Array<{ id: string; name: string; icon?: string; value?: string }>;
  setCustomFields: (fields: Array<{ id: string; name: string; icon?: string; value?: string }>) => void;
  newFieldName: string;
  setNewFieldName: (name: string) => void;
  newFieldIcon: string;
  setNewFieldIcon: (icon: string) => void;
  onAddCustomField: () => void;
}

export default function ResumeEditor({
  resumeFileName,
  setResumeFileName,
  sectionOrder,
  sectionVisibility,
  customSections,
  resumeData,
  setResumeData,
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
  renderSection,
  showAddFieldModal,
  setShowAddFieldModal,
  customFields,
  setCustomFields,
  newFieldName,
  setNewFieldName,
  newFieldIcon,
  setNewFieldIcon,
  onAddCustomField
}: ResumeEditorProps) {
  const getFieldIcon = (iconType: string) => {
    const iconClass = "w-4 h-4 text-gray-400";
    
    switch (iconType) {
      case 'email':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        );
      case 'phone':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        );
      case 'location':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'website':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'portfolio':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      default: // 'link'
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden" style={{ height: '100%', maxHeight: '100%' }}>
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

      {/* Main Resume Editing Area */}
      <div className="flex-1 h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-10" style={{ height: '100%', maxHeight: '100%' }}>
        <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
          
          {/* Name Input */}
          <input 
            className="text-3xl font-bold text-gray-900 w-full border-none outline-none focus:ring-4 focus:ring-blue-300/50 rounded-xl px-3 py-2 mb-4 transition-all" 
            value={resumeData.name || ''} 
            onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
            placeholder="Your Name" 
          />
          
          {/* Contact Fields Grid */}
          <div className="grid grid-cols-3 gap-3 text-sm mb-10">
            {['email', 'phone', 'location', 'linkedin', 'github', 'website'].map((field, idx) => (
              <div key={field} className="flex items-center gap-2 group">
                {idx === 0 && <Mail size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                {idx === 1 && <Phone size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                {idx === 2 && <MapPin size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                {idx === 3 && <Linkedin size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                {idx === 4 && <Github size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                {idx === 5 && <Globe size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                <input 
                  className="flex-1 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 rounded-lg px-3 py-2 transition-all" 
                  value={resumeData[field] || ''} 
                  onChange={(e) => setResumeData({...resumeData, [field]: e.target.value})}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)} 
                />
              </div>
            ))}
            
            {/* Custom Fields */}
            {customFields.map((field) => (
              <div key={field.id} className="flex items-center gap-2 group">
                {getFieldIcon(field.icon)}
                <input 
                  className="flex-1 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 rounded-lg px-3 py-2 transition-all" 
                  value={field.value} 
                  onChange={(e) => {
                    const updatedFields = customFields.map(f => 
                      f.id === field.id ? { ...f, value: e.target.value } : f
                    );
                    setCustomFields(updatedFields);
                  }}
                  placeholder={field.name} 
                />
              </div>
            ))}
            
            {/* Add Custom Field Button */}
            <div className="flex items-center gap-2 group">
              <Plus size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
              <button
                onClick={() => setShowAddFieldModal(true)}
                className="flex-1 border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600 text-left"
              >
                <span className="text-sm font-medium">Add Field</span>
              </button>
        </div>
      </div>

          {/* Render All Sections */}
            {sectionOrder.map((section) => (
              <div key={section}>
                {renderSection(section)}
              </div>
            ))}
          
        </div>
      </div>
    </div>
  );
}
