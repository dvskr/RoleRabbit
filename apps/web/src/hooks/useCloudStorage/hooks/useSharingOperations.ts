import { useCallback } from 'react';
import { ResumeFile, SharePermission, ShareLink, FileComment } from '../../../types/cloudStorage';
import { logger } from '../../../utils/logger';
import { createSharePermission, createShareLink } from '../utils/shareOperations';
import { DEFAULT_USER_ID, DEFAULT_USER_NAME, DEFAULT_USER_AVATAR } from '../constants/defaults';

export const useSharingOperations = (
  files: ResumeFile[],
  setFiles: React.Dispatch<React.SetStateAction<ResumeFile[]>>
) => {
  const handleShareWithUser = useCallback((fileId: string, userEmail: string, permission: 'view' | 'comment' | 'edit' | 'admin') => {
    const newPermission = createSharePermission(userEmail, permission);

    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, sharedWith: [...file.sharedWith, newPermission] }
        : file
    ));
  }, [setFiles]);

  const handleRemoveShare = useCallback((fileId: string, shareId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, sharedWith: file.sharedWith.filter(share => share.id !== shareId) }
        : file
    ));
  }, [setFiles]);

  const handleUpdatePermission = useCallback((fileId: string, shareId: string, permission: 'view' | 'comment' | 'edit' | 'admin') => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            sharedWith: file.sharedWith.map(share => 
              share.id === shareId ? { ...share, permission } : share
            )
          }
        : file
    ));
  }, [setFiles]);

  const handleCreateShareLink = useCallback((fileId: string, options: { password?: string; expiresAt?: string; maxDownloads?: number }) => {
    const shareLink = createShareLink(fileId, options);
    logger.debug('Created share link:', shareLink);
    return shareLink;
  }, []);

  const handleAddComment = useCallback((fileId: string, content: string) => {
    logger.debug('Adding comment to file:', fileId, content);
    const newComment: FileComment = {
      id: `comment_${Date.now()}`,
      userId: DEFAULT_USER_ID,
      userName: DEFAULT_USER_NAME,
      userAvatar: DEFAULT_USER_AVATAR,
      content,
      timestamp: new Date().toISOString(),
      replies: [],
      isResolved: false
    };

    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        logger.debug('Comment added to file:', file.name, 'Total comments:', file.comments.length + 1);
        return { ...file, comments: [...file.comments, newComment] };
      }
      return file;
    }));
  }, [setFiles]);

  return {
    handleShareWithUser,
    handleRemoveShare,
    handleUpdatePermission,
    handleCreateShareLink,
    handleAddComment
  };
};

