import { ResumeFile } from '../../../types/cloudStorage';
import { DEFAULT_FILE_SIZE, DEFAULT_USER_ID } from '../constants/defaults';

export const createFileId = (): string => {
  return `file_${Date.now()}`;
};

export const createDefaultFile = (fileData: Partial<ResumeFile>): ResumeFile => {
  return {
    id: createFileId(),
    name: fileData.name || 'Untitled',
    type: fileData.type || 'resume',
    size: fileData.size || DEFAULT_FILE_SIZE,
    lastModified: new Date().toISOString().split('T')[0],
    isPublic: fileData.isPublic || false,
    version: 1,
    owner: DEFAULT_USER_ID,
    sharedWith: [],
    comments: [],
    downloadCount: 0,
    isStarred: false,
    isArchived: false,
    description: fileData.description || '',
    viewCount: 0
  };
};

