export interface ResumeFile {
  id: string;
  name: string;
  type: 'resume' | 'template' | 'backup';
  size: string;
  lastModified: string;
  isPublic: boolean;
  tags: string[];
  version: number;
  owner: string;
  sharedWith: SharePermission[];
  comments: FileComment[];
  downloadCount: number;
  viewCount: number;
  isStarred: boolean;
  isArchived: boolean;
  thumbnail?: string;
  description?: string;
}

export interface SharePermission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  permission: 'view' | 'comment' | 'edit' | 'admin';
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface FileComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  replies: FileComment[];
  isResolved: boolean;
}

export interface ShareLink {
  id: string;
  fileId: string;
  url: string;
  password?: string;
  expiresAt?: string;
  maxDownloads?: number;
  downloadCount: number;
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  lastActive: string;
}

export interface CloudStorageProps {
  onClose?: () => void;
}

export type FileType = 'all' | 'resume' | 'template' | 'backup';
export type SortBy = 'name' | 'date' | 'size';
export type ViewMode = 'grid' | 'list';

export interface StorageInfo {
  used: number;
  limit: number;
  percentage: number;
}

export interface FileOperation {
  type: 'download' | 'share' | 'delete' | 'togglePublic' | 'edit';
  fileId: string;
  data?: any;
}
