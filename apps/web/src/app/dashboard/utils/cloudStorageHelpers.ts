/**
 * Cloud storage helper functions for dashboard
 */

import { ResumeFile } from '../../../types/cloudStorage';
import { ResumeData, CustomSection } from '../../../types/resume';
import { logger } from '../../../utils/logger';
import type { DashboardTab } from '../constants/dashboard.constants';

export interface CloudStorageData {
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
}

/**
 * Load resumes from cloud storage
 */
export function loadCloudResumes(): ResumeFile[] {
  const cloudStorage = localStorage.getItem('cloudStorage');
  if (cloudStorage) {
    try {
      const storage = JSON.parse(cloudStorage);
      return storage.files?.filter((f: ResumeFile) => f.type === 'resume') || [];
    } catch (e) {
      logger.debug('Error loading cloud files:', e);
      return [];
    }
  }
  return [];
}

/**
 * Save resume to cloud storage
 */
export function saveResumeToCloud(
  resumeData: ResumeData,
  customSections: CustomSection[],
  resumeFileName: string,
  fontFamily: string,
  fontSize: string,
  lineSpacing: string,
  sectionSpacing: string,
  margins: string,
  headingStyle: string,
  bulletStyle: string,
  fileName: string,
  description: string,
  tags: string[]
): ResumeFile {
  // Load current cloud storage
  const cloudStorage = localStorage.getItem('cloudStorage');
  let storage = cloudStorage ? JSON.parse(cloudStorage) : { files: [] };

  // Create new file
  const newFile: ResumeFile = {
    id: `resume_${Date.now()}`,
    name: fileName,
    type: 'resume',
    size: `${(JSON.stringify(resumeData).length / 1024).toFixed(2)} KB`,
    lastModified: new Date().toISOString().split('T')[0],
    isPublic: false,
    tags: tags,
    version: 1,
    owner: 'current-user@example.com',
    sharedWith: [],
    comments: [],
    downloadCount: 0,
    viewCount: 0,
    isStarred: false,
    isArchived: false,
    description: description
  };

  // Store the full resume data separately
  const storageData: CloudStorageData = {
    resumeData,
    customSections,
    resumeFileName,
    fontFamily,
    fontSize,
    lineSpacing,
    sectionSpacing,
    margins,
    headingStyle,
    bulletStyle
  };
  localStorage.setItem(`cloudFileContent_${newFile.id}`, JSON.stringify(storageData));

  // Add to storage
  storage.files.push(newFile);
  localStorage.setItem('cloudStorage', JSON.stringify(storage));
  
  logger.debug('Saved resume to cloud:', newFile);
  return newFile;
}

/**
 * Load resume from cloud storage
 */
export function loadResumeFromCloud(file: ResumeFile): CloudStorageData | null {
  const fileContent = localStorage.getItem(`cloudFileContent_${file.id}`);
  if (fileContent) {
    try {
      const data = JSON.parse(fileContent) as CloudStorageData;
      logger.debug('Loaded resume from cloud:', file);
      return data;
    } catch (e) {
      logger.debug('Error parsing cloud file:', e);
      return null;
    }
  }
  return null;
}

/**
 * Parse resume from uploaded file
 */
export function parseResumeFile(fileContent: string): CloudStorageData | null {
  try {
    const data = JSON.parse(fileContent);
    if (data.resumeData) {
      return {
        resumeData: data.resumeData,
        customSections: data.customSections || [],
        resumeFileName: data.resumeFileName || 'Untitled Resume',
        fontFamily: data.fontFamily || 'Arial',
        fontSize: data.fontSize || '12pt',
        lineSpacing: data.lineSpacing || '1.5',
        sectionSpacing: data.sectionSpacing || 'normal',
        margins: data.margins || 'medium',
        headingStyle: data.headingStyle || 'bold',
        bulletStyle: data.bulletStyle || 'disc',
      };
    }
  } catch (e) {
    logger.debug('Error parsing file:', e);
  }
  return null;
}

