import { SharePermission, ShareLink } from '../../../types/cloudStorage';
import { DEFAULT_USER_EMAIL } from '../constants/defaults';

export const createShareId = (): string => {
  return `share_${Date.now()}`;
};

export const createSharePermission = (
  userEmail: string,
  permission: 'view' | 'comment' | 'edit' | 'admin',
  shareId?: string
): SharePermission => {
  return {
    id: shareId || createShareId(),
    userId: `user_${Date.now()}`,
    userEmail,
    userName: userEmail.split('@')[0],
    permission,
    grantedBy: DEFAULT_USER_EMAIL,
    grantedAt: new Date().toISOString()
  };
};

export const createShareLink = (
  fileId: string,
  options: { password?: string; expiresAt?: string; maxDownloads?: number }
): ShareLink => {
  return {
    id: `link_${Date.now()}`,
    fileId,
    url: `https://roleready.com/share/${fileId}`,
    password: options.password,
    expiresAt: options.expiresAt,
    maxDownloads: options.maxDownloads,
    downloadCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: DEFAULT_USER_EMAIL
  };
};

