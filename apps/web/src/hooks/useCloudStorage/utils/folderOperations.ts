import { Folder } from '../../../types/cloudStorage';
import { DEFAULT_FOLDER_COLOR } from '../constants/defaults';

export const createFolderId = (): string => {
  return `folder_${Date.now()}`;
};

export const createDefaultFolder = (name: string, color?: string): Folder => {
  return {
    id: createFolderId(),
    name,
    color: color || DEFAULT_FOLDER_COLOR,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fileCount: 0
  };
};

export const updateFolderFileCounts = (
  folders: Folder[],
  fileId: string,
  oldFolderId: string | undefined,
  newFolderId: string
): Folder[] => {
  return folders.map(folder => {
    let count = folder.fileCount || 0;
    if (folder.id === oldFolderId) count = Math.max(0, count - 1);
    if (folder.id === newFolderId) count++;
    return { ...folder, fileCount: count };
  });
};

