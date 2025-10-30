'use client';

import React, { useEffect, useMemo } from 'react';
import { FileText, Sparkles, Layers, Plus, Type, Palette, Eye, EyeOff, Mail, Phone, MapPin, Linkedin, Github, Globe, X } from 'lucide-react';
import MultiResumeManager from './MultiResumeManager';
import { resumeTemplates } from '../../data/templates';
import { useTheme } from '../../contexts/ThemeContext';

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
  selectedTemplateId?: string | null;
  onTemplateApply?: (templateId: string) => void;
  addedTemplates?: string[];
  onRemoveTemplate?: (templateId: string) => void;
  onAddTemplates?: (templateIds: string[]) => void;
  onNavigateToTemplates?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
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
  onAddCustomField,
  selectedTemplateId,
  onTemplateApply,
  addedTemplates = [],
  onRemoveTemplate,
  onAddTemplates,
  onNavigateToTemplates,
  isSidebarCollapsed = false,
  onToggleSidebar
}: ResumeEditorProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Get the selected template data
  const selectedTemplate = selectedTemplateId 
    ? resumeTemplates.find(t => t.id === selectedTemplateId) 
    : null;

  // Apply template when selectedTemplateId changes
  useEffect(() => {
    if (selectedTemplateId && onTemplateApply) {
      // Show a visual notification that template was applied
      // Template applied silently without popup
      onTemplateApply(selectedTemplateId);
    }
  }, [selectedTemplateId, onTemplateApply]);

  // Memoize sections to prevent unnecessary re-renders
  const renderedSections = useMemo(() => {
    return sectionOrder.map((section) => (
      <div key={section}>
        {renderSection(section)}
      </div>
    ));
  }, [sectionOrder, renderSection, sectionVisibility, customSections, resumeData]);

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

  // Calculate sidebar width and padding based on collapse state
  const sidebarWidth = isSidebarCollapsed ? '48px' : '288px';
  const sidebarPadding = isSidebarCollapsed ? '8px' : '24px';

  return (
    <div className="flex flex-1 h-full overflow-hidden" style={{ height: '100%', maxHeight: '100%', background: colors.background }}>
      {/* Left Sidebar - Section Controls */}
      <div 
        className="backdrop-blur-xl overflow-y-auto flex-shrink-0"
        style={{ 
          width: sidebarWidth, 
          padding: sidebarPadding,
          background: colors.sidebarBackground,
          borderRight: `1px solid ${colors.border}`,
        }}
      >
        {/* Collapsed View - Just Icons */}
        {isSidebarCollapsed ? (
          <div className="flex flex-col gap-2">
            <button 
              className="p-2 border rounded-lg transition-all" 
              title="File Name"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 4px ${colors.border}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FileText size={16} className="mx-auto" style={{ color: colors.primaryBlue }} />
            </button>
            <button 
              className="p-2 border rounded-lg transition-all" 
              title="Sections"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 4px ${colors.border}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Layers size={16} className="mx-auto" style={{ color: colors.badgePurpleText }} />
            </button>
            <button 
              className="p-2 border rounded-lg transition-all" 
              title="Formatting"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 4px ${colors.border}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Palette size={16} className="mx-auto" style={{ color: colors.badgePurpleText }} />
            </button>
          </div>
        ) : (
          <>
            {/* File Name Configuration */}
            <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2 text-sm" style={{ color: colors.primaryText }}>
              <FileText size={16} style={{ color: colors.primaryBlue }} />
              File Name
            </h3>
            <button
              onClick={() => setResumeFileName(onGenerateSmartFileName())}
              className="p-1.5 rounded-lg transition-all"
              style={{
                background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primaryBlue}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
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
            className="w-full px-3 py-2 text-sm rounded-lg transition-all"
            style={{
              background: colors.inputBackground,
              border: `2px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primaryBlue;
              e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border;
              e.target.style.outline = 'none';
            }}
          />
          <p className="text-xs mt-1" style={{ color: colors.tertiaryText }}>
            💡 AI generates: Name_Title_YYYY-MM format
          </p>
        </div>

        {/* Templates Horizontal Scroller */}
        <div className="mb-6">
          <MultiResumeManager
            onSwitchResume={() => {}}
            onSelectTemplate={(templateId) => {
              onTemplateApply?.(templateId);
            }}
            showHorizontalScroller={true}
            addedTemplates={addedTemplates}
            onRemoveTemplate={onRemoveTemplate}
            onAddTemplates={onAddTemplates}
            onNavigateToTemplates={onNavigateToTemplates}
            selectedTemplateId={selectedTemplateId}
          />
        </div>

        {/* Sections */}
         <div className="mb-6">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold flex items-center gap-2 text-base" style={{ color: colors.primaryText }}>
               <Layers size={18} style={{ color: colors.badgePurpleText }} />
             Sections
           </h3>
           <button
                onClick={onShowAddSectionModal}
             className="p-2 rounded-lg transition-all"
             style={{
               background: `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`,
               color: 'white',
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.boxShadow = `0 4px 12px ${colors.badgePurpleText}40`;
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.boxShadow = 'none';
             }}
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
                 <div 
                   key={section} 
                   className="p-3 border rounded-lg flex items-center justify-between group transition-all duration-200"
                   style={{
                     background: colors.cardBackground,
                     border: `1px solid ${colors.border}`,
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.boxShadow = `0 2px 4px ${colors.border}20`;
                     e.currentTarget.style.borderColor = colors.borderFocused;
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.boxShadow = 'none';
                     e.currentTarget.style.borderColor = colors.border;
                   }}
                 >
                <div className="flex items-center gap-3">
                     <button
                       onClick={() => onToggleSection(section)}
                       className="p-1 rounded transition-colors"
                       onMouseEnter={(e) => {
                         e.currentTarget.style.background = colors.hoverBackground;
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.background = 'transparent';
                       }}
                     >
                    {sectionVisibility[section] ? (
                         <Eye size={16} style={{ color: colors.primaryBlue }} />
                    ) : (
                         <EyeOff size={16} style={{ color: colors.tertiaryText }} />
                    )}
                  </button>
                     <span className="text-sm font-medium" style={{ color: colors.primaryText }}>{displayName.charAt(0).toUpperCase() + displayName.slice(1)}</span>
                </div>
                   <div className="flex items-center gap-1">
                     {index > 0 && (
                  <button 
                         onClick={() => onMoveSection(index, 'up')}
                         className="p-1 rounded transition-colors"
                         style={{ color: colors.tertiaryText }}
                         onMouseEnter={(e) => {
                           e.currentTarget.style.background = colors.hoverBackground;
                           e.currentTarget.style.color = colors.secondaryText;
                         }}
                         onMouseLeave={(e) => {
                           e.currentTarget.style.background = 'transparent';
                           e.currentTarget.style.color = colors.tertiaryText;
                         }}
                         title="Move Up"
                       >
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                         </svg>
                  </button>
                     )}
                     {index < sectionOrder.length - 1 && (
                  <button 
                         onClick={() => onMoveSection(index, 'down')}
                         className="p-1 rounded transition-colors"
                         style={{ color: colors.tertiaryText }}
                         onMouseEnter={(e) => {
                           e.currentTarget.style.background = colors.hoverBackground;
                           e.currentTarget.style.color = colors.secondaryText;
                         }}
                         onMouseLeave={(e) => {
                           e.currentTarget.style.background = 'transparent';
                           e.currentTarget.style.color = colors.tertiaryText;
                         }}
                         title="Move Down"
                       >
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
           <h3 className="font-bold flex items-center gap-2 text-base mb-4" style={{ color: colors.primaryText }}>
             <Palette size={18} style={{ color: colors.badgePurpleText }} />
            Formatting
          </h3>

            {/* Font Family */}
          <div className="mb-4">
            <h4 className="font-semibold flex items-center gap-2 text-sm mb-2" style={{ color: colors.secondaryText }}>
              <Type size={14} style={{ color: colors.tertiaryText }} />
              FONT FAMILY
            </h4>
              <select 
                value={fontFamily} 
                onChange={(e) => setFontFamily(e.target.value)} 
              className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all"
              aria-label="Font family"
              title="Font family"
              style={{
                background: colors.inputBackground,
                border: `2px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.badgePurpleText;
                e.target.style.outline = `2px solid ${colors.badgePurpleText}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.outline = 'none';
              }}
            >
              <option value="arial">Arial (ATS Recommended)</option>
              <option value="calibri">Calibri</option>
              <option value="times">Times New Roman</option>
              <option value="helvetica">Helvetica</option>
              </select>
            </div>

            {/* Font Size */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>FONT SIZE</h4>
              <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFontSize('ats10pt')}
                className="p-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: fontSize === 'ats10pt' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: fontSize === 'ats10pt' ? 'white' : colors.primaryText,
                  border: fontSize === 'ats10pt' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (fontSize !== 'ats10pt') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (fontSize !== 'ats10pt') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>10pt</span>
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.successGreen }}></div>
                </div>
                <div className="text-xs mt-1">ATS</div>
              </button>
                  <button
                onClick={() => setFontSize('ats11pt')}
                className="p-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: fontSize === 'ats11pt' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: fontSize === 'ats11pt' ? 'white' : colors.primaryText,
                  border: fontSize === 'ats11pt' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (fontSize !== 'ats11pt') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (fontSize !== 'ats11pt') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
                  >
                <div className="flex items-center justify-center gap-1">
                  <span>11pt</span>
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.successGreen }}></div>
                    </div>
                <div className="text-xs mt-1">ATS</div>
              </button>
              <button
                onClick={() => setFontSize('ats12pt')}
                className="p-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: fontSize === 'ats12pt' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: fontSize === 'ats12pt' ? 'white' : colors.primaryText,
                  border: fontSize === 'ats12pt' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (fontSize !== 'ats12pt') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (fontSize !== 'ats12pt') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>12pt</span>
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.successGreen }}></div>
                      </div>
                <div className="text-xs mt-1">ATS</div>
                  </button>
              </div>
            </div>

            {/* Line Spacing */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>LINE SPACING</h4>
              <select 
                value={lineSpacing} 
                onChange={(e) => setLineSpacing(e.target.value)} 
              className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all"
              aria-label="Line spacing"
              title="Line spacing"
              style={{
                background: colors.inputBackground,
                border: `2px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.badgePurpleText;
                e.target.style.outline = `2px solid ${colors.badgePurpleText}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.outline = 'none';
              }}
              >
                <option value="tight">Tight</option>
                <option value="normal">Normal</option>
                <option value="loose">Loose</option>
              </select>
            </div>

            {/* Section Spacing */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>SECTION SPACING</h4>
              <div className="flex gap-2">
              <button
                onClick={() => setSectionSpacing('tight')}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: sectionSpacing === 'tight' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: sectionSpacing === 'tight' ? 'white' : colors.primaryText,
                  border: sectionSpacing === 'tight' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (sectionSpacing !== 'tight') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (sectionSpacing !== 'tight') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                Tight
              </button>
              <button
                onClick={() => setSectionSpacing('medium')}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: sectionSpacing === 'medium' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: sectionSpacing === 'medium' ? 'white' : colors.primaryText,
                  border: sectionSpacing === 'medium' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (sectionSpacing !== 'medium') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (sectionSpacing !== 'medium') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                Medium
              </button>
                  <button
                onClick={() => setSectionSpacing('loose')}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: sectionSpacing === 'loose' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: sectionSpacing === 'loose' ? 'white' : colors.primaryText,
                  border: sectionSpacing === 'loose' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (sectionSpacing !== 'loose') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (sectionSpacing !== 'loose') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
                  >
                Loose
                  </button>
              </div>
            </div>

            {/* Page Margins */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>PAGE MARGINS</h4>
              <div className="flex gap-2">
              <button
                onClick={() => setMargins('narrow')}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: margins === 'narrow' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: margins === 'narrow' ? 'white' : colors.primaryText,
                  border: margins === 'narrow' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (margins !== 'narrow') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (margins !== 'narrow') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                Narrow
              </button>
              <button
                onClick={() => setMargins('normal')}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: margins === 'normal' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: margins === 'normal' ? 'white' : colors.primaryText,
                  border: margins === 'normal' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (margins !== 'normal') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (margins !== 'normal') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                Normal
              </button>
                  <button
                onClick={() => setMargins('wide')}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: margins === 'wide' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: margins === 'wide' ? 'white' : colors.primaryText,
                  border: margins === 'wide' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (margins !== 'wide') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (margins !== 'wide') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
                  >
                Wide
                  </button>
              </div>
            </div>

            {/* Heading Weight */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>HEADING WEIGHT</h4>
              <select 
                value={headingStyle} 
                onChange={(e) => setHeadingStyle(e.target.value)} 
              className="w-full px-3 py-2 text-sm border-2 rounded-lg transition-all"
              aria-label="Heading weight"
              title="Heading weight"
              style={{
                background: colors.inputBackground,
                border: `2px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.badgePurpleText;
                e.target.style.outline = `2px solid ${colors.badgePurpleText}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.outline = 'none';
              }}
              >
              <option value="bold">Bold</option>
                <option value="semibold">Semi Bold</option>
              <option value="extrabold">Extra Bold</option>
              </select>
            </div>

            {/* Bullet Style */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2" style={{ color: colors.secondaryText }}>BULLET STYLE</h4>
              <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBulletStyle('disc')}
                className="p-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: bulletStyle === 'disc' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: bulletStyle === 'disc' ? 'white' : colors.primaryText,
                  border: bulletStyle === 'disc' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (bulletStyle !== 'disc') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (bulletStyle !== 'disc') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                <div className="text-lg">•</div>
              </button>
              <button
                onClick={() => setBulletStyle('circle')}
                className="p-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: bulletStyle === 'circle' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: bulletStyle === 'circle' ? 'white' : colors.primaryText,
                  border: bulletStyle === 'circle' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (bulletStyle !== 'circle') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (bulletStyle !== 'circle') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                <div className="text-lg">◦</div>
              </button>
              <button
                onClick={() => setBulletStyle('square')}
                className="p-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: bulletStyle === 'square' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: bulletStyle === 'square' ? 'white' : colors.primaryText,
                  border: bulletStyle === 'square' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (bulletStyle !== 'square') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (bulletStyle !== 'square') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                <div className="text-lg">▪</div>
              </button>
              <button
                onClick={() => setBulletStyle('arrow')}
                className="p-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: bulletStyle === 'arrow' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: bulletStyle === 'arrow' ? 'white' : colors.primaryText,
                  border: bulletStyle === 'arrow' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (bulletStyle !== 'arrow') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (bulletStyle !== 'arrow') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                <div className="text-lg">→</div>
              </button>
              <button
                onClick={() => setBulletStyle('check')}
                className="p-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: bulletStyle === 'check' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: bulletStyle === 'check' ? 'white' : colors.primaryText,
                  border: bulletStyle === 'check' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (bulletStyle !== 'check') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (bulletStyle !== 'check') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
              >
                <div className="text-lg">✓</div>
              </button>
                  <button
                onClick={() => setBulletStyle('dash')}
                className="p-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: bulletStyle === 'dash' 
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`
                    : colors.inputBackground,
                  color: bulletStyle === 'dash' ? 'white' : colors.primaryText,
                  border: bulletStyle === 'dash' ? 'none' : `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (bulletStyle !== 'dash') {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }
                }}
                onMouseLeave={(e) => {
                  if (bulletStyle !== 'dash') {
                    e.currentTarget.style.background = colors.inputBackground;
                  }
                }}
                  >
                <div className="text-lg">–</div>
                  </button>
              </div>
            </div>

          {/* Reset to Default */}
              <button
            onClick={onResetToDefault}
            className="w-full py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <div className="w-4 h-4 border-2 rounded-full flex items-center justify-center" style={{ borderColor: colors.tertiaryText }}>
              <div className="w-2 h-2 rounded-full" style={{ background: colors.tertiaryText }}></div>
            </div>
                Reset to Default
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Resume Editing Area */}
      <div 
        className="flex-1 h-full overflow-y-auto p-2 sm:p-4 lg:p-6 xl:p-10 min-w-0"
        style={{ 
          height: '100%', 
          maxHeight: '100%',
          background: colors.background,
        }}
      >
        <div 
          className="w-full rounded-2xl shadow-lg border p-2 sm:p-4 lg:p-6 xl:p-8 max-w-full transition-all"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px ${colors.border}10`,
          }}
        >
          
          {/* Name Input */}
          <input 
            className="text-xl sm:text-2xl lg:text-3xl font-bold w-full border-none outline-none rounded-xl px-3 py-2 mb-4 break-words overflow-wrap-anywhere transition-all" 
            style={{
              background: 'transparent',
              color: colors.primaryText,
            }}
            value={resumeData.name || ''} 
            onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
            placeholder="Your Name"
            onFocus={(e) => {
              e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
            }}
          />
          
          {/* Contact Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 text-sm mb-6 lg:mb-10">
            {['email', 'phone', 'location', 'linkedin', 'github', 'website'].map((field, idx) => (
              <div key={field} className="flex items-center gap-2 group">
                {idx === 0 && <Mail size={16} style={{ color: colors.tertiaryText }} />}
                {idx === 1 && <Phone size={16} style={{ color: colors.tertiaryText }} />}
                {idx === 2 && <MapPin size={16} style={{ color: colors.tertiaryText }} />}
                {idx === 3 && <Linkedin size={16} style={{ color: colors.tertiaryText }} />}
                {idx === 4 && <Github size={16} style={{ color: colors.tertiaryText }} />}
                {idx === 5 && <Globe size={16} style={{ color: colors.tertiaryText }} />}
                <input 
                  className="flex-1 border-2 outline-none rounded-lg px-2 sm:px-3 py-2 min-w-0 max-w-full break-words overflow-wrap-anywhere text-sm transition-all" 
                  style={{
                    background: colors.inputBackground,
                    border: `2px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  value={resumeData[field] || ''} 
                  onChange={(e) => setResumeData({...resumeData, [field]: e.target.value})}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryBlue;
                    e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.outline = 'none';
                  }}
                />
              </div>
            ))}
            
            {/* Custom Fields */}
            {customFields.map((field) => (
              <div key={field.id} className="flex items-center gap-2 group">
                {getFieldIcon(field.icon || 'default')}
                <input 
                  className="flex-1 border-2 outline-none rounded-lg px-2 sm:px-3 py-2 min-w-0 max-w-full break-words overflow-wrap-anywhere text-sm transition-all" 
                  style={{
                    background: colors.inputBackground,
                    border: `2px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  value={field.value} 
                  onChange={(e) => {
                    const updatedFields = customFields.map(f => 
                      f.id === field.id ? { ...f, value: e.target.value } : f
                    );
                    setCustomFields(updatedFields);
                  }}
                  placeholder={field.name}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryBlue;
                    e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.outline = 'none';
                  }}
                />
              </div>
            ))}
            
            {/* Add Custom Field Button */}
            <div className="flex items-center gap-2 group">
              <Plus size={16} style={{ color: colors.tertiaryText }} />
              <button
                onClick={() => setShowAddFieldModal(true)}
                className="flex-1 border-2 border-dashed rounded-lg px-2 sm:px-3 py-2 text-left min-w-0 max-w-full transition-all"
                style={{
                  border: `2px dashed ${colors.border}`,
                  background: 'transparent',
                  color: colors.secondaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primaryBlue;
                  e.currentTarget.style.background = colors.badgeInfoBg;
                  e.currentTarget.style.color = colors.primaryBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.secondaryText;
                }}
              >
                <span className="text-xs sm:text-sm font-medium break-words overflow-wrap-anywhere">Add Field</span>
              </button>
        </div>
      </div>

          {/* Render All Sections */}
            {renderedSections}
          
        </div>
      </div>
    </div>
  );
}
