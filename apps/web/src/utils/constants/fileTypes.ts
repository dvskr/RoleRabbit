/**
 * File Type Constants
 */

export const FILE_TYPES = {
  RESUME: 'resume',
  COVER_LETTER: 'cover_letter',
  PORTFOLIO: 'portfolio',
  CERTIFICATE: 'certificate',
  TRANSCRIPT: 'transcript',
  OTHER: 'other'
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES];

export const ACCEPTED_FILE_FORMATS = {
  DOCUMENTS: ['.pdf', '.doc', '.docx'],
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif'],
  ARCHIVES: ['.zip', '.rar']
};

export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  GENERAL: 10 * 1024 * 1024 // 10MB
};

