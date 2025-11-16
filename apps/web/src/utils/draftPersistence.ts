/**
 * Draft Persistence Utility
 * 
 * Saves draft state to localStorage every 10 seconds as a backup.
 * On page reload, recovers from localStorage if server draft is missing.
 */

import { ResumeData, CustomSection, SectionVisibility } from '../types/resume';
import { logger } from './logger';

const DRAFT_STORAGE_KEY = 'resume_draft_backup';
const DRAFT_TIMESTAMP_KEY = 'resume_draft_timestamp';
const MAX_DRAFT_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface DraftBackup {
  resumeId: string;
  resumeData: ResumeData;
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
  customSections: CustomSection[];
  formatting: {
    fontFamily: string;
    fontSize: string;
    lineSpacing: string;
    sectionSpacing: string;
    margins: string;
    headingStyle: string;
    bulletStyle: string;
  };
  timestamp: number;
}

/**
 * Save draft to localStorage
 */
export function saveDraftToLocalStorage(draft: DraftBackup): void {
  try {
    const serialized = JSON.stringify(draft);
    localStorage.setItem(DRAFT_STORAGE_KEY, serialized);
    localStorage.setItem(DRAFT_TIMESTAMP_KEY, draft.timestamp.toString());
    logger.debug('Draft saved to localStorage', { resumeId: draft.resumeId, timestamp: draft.timestamp });
  } catch (error) {
    logger.error('Failed to save draft to localStorage', error);
    // Silently fail - localStorage might be full or disabled
  }
}

/**
 * Load draft from localStorage
 */
export function loadDraftFromLocalStorage(resumeId: string): DraftBackup | null {
  try {
    const serialized = localStorage.getItem(DRAFT_STORAGE_KEY);
    const timestampStr = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
    
    if (!serialized || !timestampStr) {
      return null;
    }
    
    const draft: DraftBackup = JSON.parse(serialized);
    const timestamp = parseInt(timestampStr, 10);
    
    // Check if draft is for the correct resume
    if (draft.resumeId !== resumeId) {
      logger.debug('Draft in localStorage is for different resume', { 
        stored: draft.resumeId, 
        requested: resumeId 
      });
      return null;
    }
    
    // Check if draft is too old
    const age = Date.now() - timestamp;
    if (age > MAX_DRAFT_AGE_MS) {
      logger.debug('Draft in localStorage is too old', { age, maxAge: MAX_DRAFT_AGE_MS });
      clearDraftFromLocalStorage();
      return null;
    }
    
    logger.info('Draft loaded from localStorage', { resumeId, age, timestamp });
    return draft;
  } catch (error) {
    logger.error('Failed to load draft from localStorage', error);
    return null;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraftFromLocalStorage(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
    logger.debug('Draft cleared from localStorage');
  } catch (error) {
    logger.error('Failed to clear draft from localStorage', error);
  }
}

/**
 * Check if a draft exists in localStorage for a given resume
 */
export function hasDraftInLocalStorage(resumeId: string): boolean {
  try {
    const serialized = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!serialized) {
      return false;
    }
    
    const draft: DraftBackup = JSON.parse(serialized);
    return draft.resumeId === resumeId;
  } catch (error) {
    return false;
  }
}

/**
 * Get the timestamp of the draft in localStorage
 */
export function getDraftTimestamp(): number | null {
  try {
    const timestampStr = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
    if (!timestampStr) {
      return null;
    }
    return parseInt(timestampStr, 10);
  } catch (error) {
    return null;
  }
}

