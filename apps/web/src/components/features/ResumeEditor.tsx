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
  useTemplateApplication(selectedTemplateId, onTemplateApply);

  // Memoize sections to prevent unnecessary re-renders
  const renderedSections = useMemo(() => {
    return sectionOrder.map((section) => (
      <div key={section}>
        {renderSection(section)}
      </div>
    ));
  }, [sectionOrder, renderSection, sectionVisibility, customSections, resumeData]);


  // Calculate sidebar width and padding based on collapse state - responsive
  const { width: sidebarWidth, padding: sidebarPadding } = useSidebarDimensions(isSidebarCollapsed ?? false);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden" style={{ height: '100%', width: '100%', maxHeight: '100%', background: colors.background }}>
      {/* Left Sidebar - Section Controls */}
      <div 
        className="backdrop-blur-xl overflow-y-auto hidden lg:flex flex-col"
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
          <div className="flex flex-col h-full w-full">
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
        className="flex-1 h-full overflow-y-auto p-2 sm:p-4 lg:p-6 xl:p-10"
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
        }}
      >
        <div 
          className="w-full rounded-2xl shadow-lg border p-2 sm:p-4 lg:p-6 xl:p-8 transition-all box-border"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 4px 6px ${colors.border}10`,
            width: '100%',
            maxWidth: '100%',
            minHeight: '100%',
          }}
        >
          
          {/* Name Input */}
          <NameInput
            name={resumeData.name || ''}
            onChange={(name) => setResumeData({...resumeData, name})}
            colors={colors}
          />
          
          {/* Contact Fields Grid */}
          <ContactFieldsGrid
            resumeData={resumeData}
            setResumeData={setResumeData}
            customFields={customFields}
            setCustomFields={setCustomFields}
            setShowAddFieldModal={setShowAddFieldModal}
            colors={colors}
          />

          {/* Render All Sections */}
          <div className="w-full">
            {renderedSections}
          </div>
          
        </div>
      </div>
    </div>
  );
}
