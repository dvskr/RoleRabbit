import React from 'react';
import { ResumeData, CustomSection, CustomField } from '../../../types/resume';

export interface ResumeEditorProps {
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customSections: CustomSection[];
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
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
  onGenerateSmartFileName: () => string;
  onResetToDefault: () => void;
  renderSection: (section: string) => React.ReactNode;
  setShowAddFieldModal: (show: boolean) => void;
  customFields: CustomField[];
  setCustomFields: (fields: CustomField[]) => void;
  selectedTemplateId?: string | null;
  onTemplateApply?: (templateId: string) => void;
  addedTemplates?: string[];
  onRemoveTemplate?: (templateId: string) => void;
  onAddTemplates?: (templateIds: string[]) => void;
  onNavigateToTemplates?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

