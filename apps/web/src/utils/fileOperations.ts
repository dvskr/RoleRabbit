import { ResumeFile } from '../types/cloudStorage';
import { logger } from './logger';
import { FILE_EDIT_PROMPT_MESSAGE } from '../components/cloudStorage/constants';

/**
 * Prompts user to edit a file name
 * Uses browser prompt dialog to get new name from user
 * 
 * @param file - The file to edit
 * @param onEdit - Callback function to execute when name is changed
 */
export const editFileName = (
  file: ResumeFile,
  onEdit: (fileId: string, updates: { name: string }) => void
): void => {
  logger.debug('Editing file:', file.id);
  const newName = prompt(FILE_EDIT_PROMPT_MESSAGE, file.name);
  if (newName && newName.trim() !== file.name) {
    onEdit(file.id, { name: newName.trim() });
    logger.debug('File renamed:', file.id, newName);
  }
};

