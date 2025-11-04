/**
 * Custom hook for dashboard cloud storage save/load operations
 */

import { useCallback } from 'react';
import type {
  ResumeData,
  CustomSection,
  ResumeFile,
} from '../../../types/resume';
import apiService from '../../../services/apiService';
import { logger } from '../../../utils/logger';

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
  handleConfirmSaveToCloud: (fileName: string, description: string) => void;
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

  const handleConfirmSaveToCloud = useCallback(async (fileName: string, description: string) => {
    try {
      // Save via API
      const response = await apiService.saveToCloud(resumeData, fileName);
      if (response && response.savedResume) {
        logger.debug('Saved resume to cloud:', response.savedResume);
      }
      setShowSaveToCloudModal(false);
    } catch (error) {
      logger.error('Failed to save resume to cloud:', error);
      // Still close modal even on error
      setShowSaveToCloudModal(false);
    }
  }, [
    resumeData,
    setShowSaveToCloudModal,
  ]);

  const handleLoadFromCloud = useCallback(async (file: ResumeFile) => {
    try {
      // Load from API
      const response = await apiService.listCloudResumes();
      if (response && response.savedResumes) {
        const cloudFile = response.savedResumes.find((f: ResumeFile) => f.id === file.id);
        if (cloudFile && cloudFile.data) {
          // Cloud storage data is stored as JSON string
          try {
            const parsedData = typeof cloudFile.data === 'string' 
              ? JSON.parse(cloudFile.data) 
              : cloudFile.data;
            
            if (parsedData.resumeData) {
              setResumeData(parsedData.resumeData);
              if (parsedData.customSections) setCustomSections(parsedData.customSections);
              if (parsedData.resumeFileName) setResumeFileName(parsedData.resumeFileName);
              if (parsedData.fontFamily) setFontFamily(parsedData.fontFamily);
              if (parsedData.fontSize) setFontSize(parsedData.fontSize);
              if (parsedData.lineSpacing) setLineSpacing(parsedData.lineSpacing);
              if (parsedData.sectionSpacing) setSectionSpacing(parsedData.sectionSpacing);
              if (parsedData.margins) setMargins(parsedData.margins);
              if (parsedData.headingStyle) setHeadingStyle(parsedData.headingStyle);
              if (parsedData.bulletStyle) setBulletStyle(parsedData.bulletStyle);
            }
          } catch (parseError) {
            logger.error('Failed to parse cloud file data:', parseError);
          }
        }
      }
      setShowImportFromCloudModal(false);
    } catch (error) {
      logger.error('Failed to load resume from cloud:', error);
      setShowImportFromCloudModal(false);
    }
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

