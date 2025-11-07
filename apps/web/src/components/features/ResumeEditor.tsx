'use client';

import React, { useMemo } from 'react';
import MultiResumeManager from './MultiResumeManager';
import { resumeTemplates } from '../../data/templates';
import { useTheme } from '../../contexts/ThemeContext';
import { ResumeEditorProps } from './ResumeEditor/types/ResumeEditor.types';
import { useSidebarDimensions } from './ResumeEditor/hooks/useSidebarDimensions';
import { useTemplateApplication } from './ResumeEditor/hooks/useTemplateApplication';
import CollapsedSidebar from './ResumeEditor/components/CollapsedSidebar';
import FileNameSection from './ResumeEditor/components/FileNameSection';
import SectionsList from './ResumeEditor/components/SectionsList';
import NameInput from './ResumeEditor/components/NameInput';
import ContactFieldsGrid from './ResumeEditor/components/ContactFieldsGrid';
import FormattingPanel from './ResumeEditor/components/FormattingPanel';
import { getTemplateClasses } from '../../app/dashboard/utils/templateClassesHelper';

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
  onToggleSidebar,
}: ResumeEditorProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Get the selected template data
  const selectedTemplate = selectedTemplateId 
    ? resumeTemplates.find(t => t.id === selectedTemplateId) 
    : null;

  // Get template classes for styling
  const templateClasses = useMemo(() => {
    return getTemplateClasses(selectedTemplateId || null);
  }, [selectedTemplateId]);

  // Apply template when selectedTemplateId changes
  useTemplateApplication(selectedTemplateId, onTemplateApply);

  // Memoize sections to prevent unnecessary re-renders
  // Only render visible sections and optimize dependencies
  const renderedSections = useMemo(() => {
    return sectionOrder
      .filter((section) => sectionVisibility[section] !== false)
      .map((section) => {
        const sectionElement = renderSection(section);
        return sectionElement ? (
          <div key={section}>
            {sectionElement}
          </div>
        ) : null;
      })
      .filter(Boolean);
  }, [sectionOrder, renderSection, sectionVisibility]);


  // Calculate sidebar width and padding based on collapse state - responsive
  const { width: sidebarWidth, padding: sidebarPadding } = useSidebarDimensions(isSidebarCollapsed ?? false);

  // Convert formatting values to CSS styles
  const getFormattingStyles = useMemo(() => {
    const fontMap: Record<string, string> = {
      arial: 'Arial, sans-serif',
      times: 'Times New Roman, serif',
      verdana: 'Verdana, sans-serif',
    };
    
    const fontSizeMap: Record<string, string> = {
      ats10pt: '10pt',
      ats11pt: '11pt',
      ats12pt: '12pt',
    };
    
    const lineSpacingMap: Record<string, string> = {
      tight: '1.2',
      normal: '1.5',
      loose: '1.8',
    };
    
    const sectionSpacingMap: Record<string, string> = {
      tight: '0.3rem',
      medium: '0.6rem',
      loose: '1rem',
    };
    
    const marginsMap: Record<string, string> = {
      narrow: '0.5in',
      normal: '1in',
      wide: '1.5in',
    };

    const headingStyleMap: Record<string, string> = {
      bold: 'bold',
      normal: 'normal',
      semibold: '600',
    };

    const bulletStyleMap: Record<string, string> = {
      disc: '•',
      circle: '○',
      square: '▪',
      arrow: '→',
      check: '✓',
      dash: '—',
    };

    return {
      fontFamily: fontMap[fontFamily] || 'Arial, sans-serif',
      fontSize: fontSizeMap[fontSize] || '11pt',
      lineHeight: lineSpacingMap[lineSpacing] || '1.5',
      sectionSpacing: sectionSpacingMap[sectionSpacing] || '1rem',
      padding: marginsMap[margins] || '1in',
      headingWeight: headingStyleMap[headingStyle] || 'bold',
      bulletChar: bulletStyleMap[bulletStyle] || '•',
    };
  }, [fontFamily, fontSize, lineSpacing, sectionSpacing, margins, headingStyle, bulletStyle]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden" style={{ height: '100%', width: '100%', maxHeight: '100%', background: colors.background }}>
      {/* Left Sidebar - Section Controls */}
      <div 
        className="backdrop-blur-xl overflow-y-auto hidden lg:flex flex-col sidebar-scroller"
        style={{ 
          width: sidebarWidth, 
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
          padding: sidebarPadding,
          background: colors.sidebarBackground,
          borderRight: `1px solid ${colors.border}`,
          flexShrink: 0,
          flexGrow: 0,
          height: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Collapsed View - Just Icons */}
        {isSidebarCollapsed ? (
          <CollapsedSidebar colors={colors} onToggleSidebar={onToggleSidebar} />
        ) : (
          <div className="flex flex-col w-full">
            {/* File Name Configuration */}
            <FileNameSection
              resumeFileName={resumeFileName}
              setResumeFileName={setResumeFileName}
              onGenerateSmartFileName={onGenerateSmartFileName}
              colors={colors}
            />

        {/* Templates Horizontal Scroller */}
        <div className="mb-6 flex-shrink-0">
          <MultiResumeManager
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
        <SectionsList
          sectionOrder={sectionOrder}
          sectionVisibility={sectionVisibility}
          customSections={customSections}
          onToggleSection={onToggleSection}
          onMoveSection={onMoveSection}
          onShowAddSectionModal={onShowAddSectionModal}
          colors={colors}
        />
        
        {/* Formatting */}
        <FormattingPanel
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineSpacing={lineSpacing}
          setLineSpacing={setLineSpacing}
          sectionSpacing={sectionSpacing}
          setSectionSpacing={setSectionSpacing}
          margins={margins}
          setMargins={setMargins}
          headingStyle={headingStyle}
          setHeadingStyle={setHeadingStyle}
          bulletStyle={bulletStyle}
          setBulletStyle={setBulletStyle}
          onResetToDefault={onResetToDefault}
          colors={colors}
        />
          </div>
        )}
      </div>

      {/* Main Resume Editing Area */}
      <div 
        className="flex-1 h-full overflow-y-auto resume-editor-content"
        style={{ 
          height: '100%', 
          maxHeight: '100%',
          width: '100%',
          background: colors.background,
          flex: '1 1 0%',
          minWidth: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          fontFamily: getFormattingStyles.fontFamily,
          fontSize: getFormattingStyles.fontSize,
          lineHeight: getFormattingStyles.lineHeight,
          paddingTop: '1.5rem',
          paddingBottom: getFormattingStyles.padding,
          paddingLeft: getFormattingStyles.padding,
          paddingRight: getFormattingStyles.padding,
        }}
      >
        {/* Dynamic styles for heading, bullet, and template formatting */}
        <style>{`
          .resume-editor-content h3 {
            font-weight: ${getFormattingStyles.headingWeight} !important;
          }
          .resume-editor-content .resume-bullet[data-bullet] {
            font-size: 0;
            width: 0.5rem;
            text-align: center;
            position: relative;
          }
          .resume-editor-content .resume-bullet[data-bullet]::before {
            content: '${getFormattingStyles.bulletChar}';
            display: inline-block;
            font-size: 1rem;
            line-height: 1;
          }
          ${templateClasses.sectionColor.includes('blue') ? '.resume-editor-content h3 { color: #2563eb !important; }' : ''}
          ${templateClasses.sectionColor.includes('green') ? '.resume-editor-content h3 { color: #16a34a !important; }' : ''}
          ${templateClasses.sectionColor.includes('purple') ? '.resume-editor-content h3 { color: #9333ea !important; }' : ''}
          ${templateClasses.sectionColor.includes('red') ? '.resume-editor-content h3 { color: #dc2626 !important; }' : ''}
          ${templateClasses.sectionColor.includes('orange') ? '.resume-editor-content h3 { color: #ea580c !important; }' : ''}
        `}</style>
        
        {/* Template Header Styling */}
        <div className={`mb-4 pb-3 ${templateClasses.header}`}>
          {/* Name Input */}
          <NameInput
            name={resumeData.name || ''}
            onChange={(name) => setResumeData((prev: any) => ({...prev, name}))}
            colors={colors}
            nameColorClass={templateClasses.nameColor}
            titleColorClass={templateClasses.titleColor}
          />
          
          {/* Title Input Field */}
          <div className="mb-4">
            <input 
              className={`text-lg font-medium w-1/2 border-none outline-none rounded-xl px-3 py-2 break-words overflow-wrap-anywhere transition-all ${templateClasses.titleColor || ''}`}
              style={{
                background: 'transparent',
                color: colors.secondaryText || colors.primaryText,
              }}
              value={resumeData.title || ''} 
              onChange={(e) => setResumeData((prev: any) => ({...prev, title: e.target.value}))}
              placeholder="Your Title / Designation"
              onFocus={(e) => {
                e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
              }}
            />
          </div>
        
          {/* Contact Fields Grid */}
          <ContactFieldsGrid
            resumeData={resumeData}
            setResumeData={setResumeData}
            customFields={customFields}
            setCustomFields={setCustomFields}
            setShowAddFieldModal={setShowAddFieldModal}
            colors={colors}
          />
        </div>

        {/* Render All Sections */}
        <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: getFormattingStyles.sectionSpacing }}>
          {renderedSections}
        </div>
      </div>
    </div>
  );
}
