import { ResumeFile } from '../types/cloudStorage';
import { generateFileHTML } from './fileDownloadTemplates';
import { logger } from './logger';

/**
 * Downloads a file as HTML content (PDF or DOC format)
 * Creates a blob from the file's HTML content and triggers a download
 * 
 * @param file - The file to download
 * @param format - The download format ('pdf' or 'doc')
 * @param onUpdateDownloadCount - Callback to update the file's download count
 */
export const downloadFileAsHTML = (
  file: ResumeFile,
  format: 'pdf' | 'doc' = 'pdf',
  onUpdateDownloadCount: (fileId: string, count: number) => void
): void => {
  logger.debug('Downloading file:', file.name);
  
  const htmlContent = generateFileHTML(file);
  const blob = new Blob([htmlContent], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Determine file extension based on format parameter
  const extension = format === 'pdf' ? '.pdf' : '.doc';
  link.download = `${file.name}${extension}`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Update download count
  onUpdateDownloadCount(file.id, (file.downloadCount || 0) + 1);
  logger.debug('File downloaded:', file.name);
};

