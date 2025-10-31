/**
 * Custom hook for dashboard export and cloud storage operations
 */

import { useCallback } from 'react';
import type {
  ResumeData,
  CustomSection,
  SectionVisibility,
  ResumeFile,
} from '../../../types/resume';
import { parseResumeFile } from '../utils/cloudStorageHelpers';
import { generateResumeHTML } from '../utils/exportHtmlGenerator';
import { logger } from '../../../utils/logger';
import { DEFAULT_TEMPLATE_ID } from '../constants/dashboard.constants';

export interface UseDashboardExportParams {
  resumeFileName: string;
  resumeData: ResumeData;
  customSections: CustomSection[];
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
  selectedTemplateId: string | null;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  setShowImportModal: (show: boolean) => void;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  setCustomSections: (sections: CustomSection[] | ((prev: CustomSection[]) => CustomSection[])) => void;
  setResumeFileName: (name: string) => void;
  setFontFamily: (family: string) => void;
  setFontSize: (size: string) => void;
  setLineSpacing: (spacing: string) => void;
  setSectionSpacing: (spacing: string) => void;
  setMargins: (margins: string) => void;
  setHeadingStyle: (style: string) => void;
  setBulletStyle: (style: string) => void;
}

export interface UseDashboardExportReturn {
  handleFileSelected: (file: File) => void;
  handleExport: (format: string) => void;
}

/**
 * Hook for export and file import operations
 */
export function useDashboardExport(params: UseDashboardExportParams): UseDashboardExportReturn {
  const {
    resumeFileName,
    resumeData,
    customSections,
    sectionOrder,
    sectionVisibility,
    selectedTemplateId,
    fontFamily,
    fontSize,
    lineSpacing,
    setShowImportModal,
    setResumeData,
    setCustomSections,
    setResumeFileName,
    setFontFamily,
    setFontSize,
    setLineSpacing,
    setSectionSpacing,
    setMargins,
    setHeadingStyle,
    setBulletStyle,
  } = params;

  const handleFileSelected = useCallback((file: File) => {
    logger.debug('File selected:', file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseResumeFile(text);
      if (data) {
        setResumeData(data.resumeData);
        setCustomSections(data.customSections || []);
        setResumeFileName(data.resumeFileName || file.name);
        setFontFamily(data.fontFamily || 'Arial');
        setFontSize(data.fontSize || '12pt');
        setLineSpacing(data.lineSpacing || '1.5');
        setSectionSpacing(data.sectionSpacing || 'normal');
        setMargins(data.margins || 'medium');
        setHeadingStyle(data.headingStyle || 'bold');
        setBulletStyle(data.bulletStyle || 'disc');
      }
    };
    reader.readAsText(file);
    setShowImportModal(false);
  }, [
    setShowImportModal,
    setResumeData,
    setCustomSections,
    setResumeFileName,
    setFontFamily,
    setFontSize,
    setLineSpacing,
    setSectionSpacing,
    setMargins,
    setHeadingStyle,
    setBulletStyle,
  ]);

  const handleExport = useCallback((format: string) => {
    logger.debug('Export format:', format);
    
    // Generate HTML content using extracted utility
    const htmlContent = generateResumeHTML({
      resumeFileName,
      resumeData,
      customSections,
      sectionOrder,
      sectionVisibility,
      selectedTemplateId: selectedTemplateId || DEFAULT_TEMPLATE_ID,
      fontFamily,
      fontSize,
      lineSpacing,
    });

    // Handle different export formats
    switch(format) {
      case 'pdf':
        // Generate PDF via print dialog
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();
          // Wait for content to load
          setTimeout(() => {
            newWindow.print();
          }, 250);
        }
        logger.debug('PDF export initiated');
        break;

      case 'word':
        // Export as HTML (Word can open HTML files)
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeFileName || 'resume'}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        logger.debug('Word export initiated');
        break;

      case 'print':
        // Open print dialog
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
        logger.debug('Print initiated');
        break;

      default:
        logger.debug('Unsupported format:', format);
    }
  }, [
    resumeFileName,
    resumeData,
    customSections,
    sectionOrder,
    sectionVisibility,
    selectedTemplateId,
    fontFamily,
    fontSize,
    lineSpacing,
  ]);

  return {
    handleFileSelected,
    handleExport,
  };
}

