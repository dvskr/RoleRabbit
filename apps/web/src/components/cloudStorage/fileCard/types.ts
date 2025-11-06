/**
 * Types for FileCard component
 */

import { ResumeFile } from '../../../types/cloudStorage';

export interface FileCardProps {
  file: ResumeFile;
  isSelected: boolean;
  showDeleted?: boolean;
  onSelect: (fileId: string) => void;
  onDownload: (file: ResumeFile, format?: 'pdf' | 'doc') => void;
  onShare: (file: ResumeFile) => void;
  onDelete: (fileId: string) => void;
  onRestore?: (fileId: string) => void;
  onPermanentlyDelete?: (fileId: string) => void;
  onTogglePublic: (fileId: string) => void;
  onEdit: (fileId: string, updates?: { name?: string; type?: ResumeFile['type']; description?: string }) => Promise<void> | void;
  onStar: (fileId: string) => void;
  onArchive: (fileId: string) => void;
  onAddComment: (fileId: string, content: string) => void | Promise<void>;
  onShareWithUser: (fileId: string, userEmail: string, permission: 'view' | 'comment' | 'edit' | 'admin', expiresAt?: string, maxDownloads?: number) => void | Promise<void>;
  onRemoveShare?: (fileId: string, shareId: string) => void | Promise<void>;
  onCopy?: (fileId: string, newName?: string, folderId?: string | null) => void | Promise<void>;
  onMove?: (fileId: string, folderId: string | null) => void | Promise<void>;
}

export type SharePermission = 'view' | 'comment' | 'edit' | 'admin';

export type DownloadFormat = 'pdf' | 'doc';

