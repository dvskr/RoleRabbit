/**
 * Dashboard handler functions
 */

import { ResumeFile } from '../../../types/cloudStorage';
import { CustomField } from '../../../types/resume';
import { logger } from '../../../utils/logger';
import type { DashboardTab } from '../constants/dashboard.constants';

/**
 * Map legacy tab names to new ones
 */
export function mapTabName(tab: string): DashboardTab {
  const tabMap: Record<string, DashboardTab> = {
    'tracker': 'jobs',
    'agents': 'ai-agents',
  };
  return (tabMap[tab] || tab) as DashboardTab;
}

/**
 * Create a deep copy of any data
 */
export function duplicateData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Create a new custom field
 */
export function createCustomField(name: string): CustomField {
  return {
    id: `custom-field-${Date.now()}`,
    name: name.trim()
  };
}

/**
 * Generate duplicate resume file name
 */
export function generateDuplicateFileName(originalName: string): string {
  return `${originalName} - Copy`;
}

/**
 * Find duplicate resumes in cloud storage
 */
export function findDuplicateResumes(cloudResumes: ResumeFile[]): ResumeFile[][] {
  const nameMap = new Map<string, ResumeFile[]>();
  
  cloudResumes.forEach(resume => {
    const baseName = resume.name.replace(/ - Copy( \d+)?$/, '');
    if (!nameMap.has(baseName)) {
      nameMap.set(baseName, []);
    }
    nameMap.get(baseName)!.push(resume);
  });

  // Return only groups with duplicates
  return Array.from(nameMap.values()).filter(group => group.length > 1);
}

/**
 * Remove duplicate resumes from cloud storage
 */
export function removeDuplicateResumes(
  duplicates: ResumeFile[][],
  keepFirst: boolean = true
): ResumeFile[] {
  const toRemove = new Set<string>();
  
  duplicates.forEach(group => {
    if (group.length > 1) {
      // Keep first or last
      const toKeep = keepFirst ? group[0] : group[group.length - 1];
      group.forEach(resume => {
        if (resume.id !== toKeep.id) {
          toRemove.add(resume.id);
        }
      });
    }
  });

  // Load and update cloud storage
  const cloudStorage = localStorage.getItem('cloudStorage');
  if (cloudStorage) {
    try {
      const storage = JSON.parse(cloudStorage);
      storage.files = storage.files.filter((f: ResumeFile) => !toRemove.has(f.id));
      localStorage.setItem('cloudStorage', JSON.stringify(storage));
      
      // Also remove content files
      toRemove.forEach(id => {
        localStorage.removeItem(`cloudFileContent_${id}`);
      });

      logger.debug(`Removed ${toRemove.size} duplicate resumes`);
      return storage.files;
    } catch (e) {
      logger.debug('Error removing duplicates:', e);
    }
  }
  
  return [];
}

