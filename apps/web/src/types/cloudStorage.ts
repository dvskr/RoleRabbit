export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  deletedAt?: string; // Soft delete timestamp for recycle bin
  createdAt: string;
  updatedAt: string;
  fileCount?: number;
}

export interface ResumeFile {
  id: string;
  name: string;
  type: 'resume' | 'template' | 'backup' | 'cover_letter' | 'transcript' | 'certification' | 'reference' | 'portfolio' | 'work_sample' | 'document';
  size: string;
  sizeBytes?: number;
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
  deletedAt?: string; // Soft delete timestamp for recycle bin
  folderId?: string;
  thumbnail?: string;
  description?: string;
  storagePath?: string | null;
  fileName?: string;
  contentType?: string;
  // Credential Management (if applicable)
  credentialInfo?: CredentialInfo;
}

export interface CredentialInfo {
  credentialType: 'certification' | 'license' | 'visa' | 'degree' | 'badge';
  issuer: string;
  issuedDate: string;
  expirationDate?: string;
  credentialId?: string;
  verificationStatus: 'pending' | 'verified' | 'expired' | 'revoked';
  verificationUrl?: string;
  qrCode?: string;
  associatedDocuments: string[]; // File IDs
}

export interface CredentialReminder {
  id: string;
  credentialId: string;
  credentialName: string;
  expirationDate: string;
  reminderDate: string;
  isSent: boolean;
  priority: 'low' | 'medium' | 'high';
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

export type FileType = 'all' | 'resume' | 'template' | 'backup' | 'cover_letter' | 'transcript' | 'certification' | 'reference' | 'portfolio' | 'work_sample' | 'document';
export type SortBy = 'name' | 'date' | 'size';
export type ViewMode = 'grid' | 'list' | 'compact';

export interface StorageInfo {
  used: number; // in GB
  limit: number; // in GB
  percentage: number;
  usedBytes?: number;
  limitBytes?: number;
}

export interface FileOperation {
  type: 'download' | 'share' | 'delete' | 'togglePublic' | 'edit';
  fileId: string;
  data?: any;
}

export interface AccessLog {
  id: string;
  fileId: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'view' | 'download' | 'share' | 'edit' | 'delete';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CloudIntegration {
  provider: 'google_drive' | 'dropbox' | 'onedrive';
  isConnected: boolean;
  connectedAt?: string;
  lastSyncAt?: string;
  accountEmail: string;
  quotaUsed?: number;
  quotaTotal?: number;
}
