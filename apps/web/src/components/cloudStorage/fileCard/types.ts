/**
 * Types for FileCard component
 */

import { ResumeFile } from '../../../types/cloudStorage';

export interface FileCardProps {
  file: ResumeFile;
  isSelected: boolean;
  viewMode: 'grid' | 'list' | 'compact';
  showDeleted?: boolean;
  onSelect: (fileId: string) => void;
  onDownload: (file: ResumeFile, format?: 'pdf' | 'doc') => void;
  onShare: (file: ResumeFile) => void;
  onDelete: (fileId: string) => void;
  onRestore?: (fileId: string) => void;
  onPermanentlyDelete?: (fileId: string) => void;
  onTogglePublic: (fileId: string) => void;
  onEdit: (fileId: string) => void;
  onStar: (fileId: string) => void;
  onArchive: (fileId: string) => void;
  onAddComment: (fileId: string, content: string) => void;
  onShareWithUser: (fileId: string, userEmail: string, permission: 'view' | 'comment' | 'edit' | 'admin') => void;
}

export type SharePermission = 'view' | 'comment' | 'edit' | 'admin';

export type DownloadFormat = 'pdf' | 'doc';

