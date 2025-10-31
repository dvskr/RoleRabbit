/**
 * Custom hook for dashboard cloud storage save/load operations
 */

import { useCallback } from 'react';
import type {
  ResumeData,
  CustomSection,
  ResumeFile,
} from '../../../types/resume';
import {
  saveResumeToCloud,
  loadResumeFromCloud,
} from '../utils/cloudStorageHelpers';

export interface UseDashboardCloudSaveParams {
  resumeData: ResumeData;
  customSections: CustomSection[];
  resumeFileName: string;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  sectionSpacing: string;
  margins: string;
  headingStyle: string;
  bulletStyle: string;
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
  setShowSaveToCloudModal: (show: boolean) => void;
  setShowImportFromCloudModal: (show: boolean) => void;
}

export interface UseDashboardCloudSaveReturn {
  handleConfirmSaveToCloud: (fileName: string, description: string, tags: string[]) => void;
  handleLoadFromCloud: (file: ResumeFile) => void;
}

/**
 * Hook for cloud storage save and load operations
 */
export function useDashboardCloudSave(params: UseDashboardCloudSaveParams): UseDashboardCloudSaveReturn {
  const {
    resumeData,
    customSections,
    resumeFileName,
    fontFamily,
    fontSize,
    lineSpacing,
    sectionSpacing,
    margins,
    headingStyle,
    bulletStyle,
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
    setShowSaveToCloudModal,
    setShowImportFromCloudModal,
  } = params;

  const handleConfirmSaveToCloud = useCallback((fileName: string, description: string, tags: string[]) => {
    saveResumeToCloud(
      resumeData,
      customSections,
      resumeFileName,
      fontFamily,
      fontSize,
      lineSpacing,
      sectionSpacing,
      margins,
      headingStyle,
      bulletStyle,
      fileName,
      description,
      tags
    );
    setShowSaveToCloudModal(false);
  }, [
    resumeData,
    customSections,
    resumeFileName,
    fontFamily,
    fontSize,
    lineSpacing,
    sectionSpacing,
    margins,
    headingStyle,
    bulletStyle,
    setShowSaveToCloudModal,
  ]);

  const handleLoadFromCloud = useCallback((file: ResumeFile) => {
    const data = loadResumeFromCloud(file);
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
    setShowImportFromCloudModal(false);
  }, [
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
    setShowImportFromCloudModal,
  ]);

  return {
    handleConfirmSaveToCloud,
    handleLoadFromCloud,
  };
}

