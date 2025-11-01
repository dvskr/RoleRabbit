import { useCallback } from 'react';
import { ResumeFile, SharePermission, ShareLink, FileComment } from '../../../types/cloudStorage';
import { logger } from '../../../utils/logger';
import { createSharePermission, createShareLink } from '../utils/shareOperations';
import { DEFAULT_USER_ID, DEFAULT_USER_NAME, DEFAULT_USER_AVATAR } from '../constants/defaults';
import apiService from '../../../services/apiService';

export const useSharingOperations = (
  files: ResumeFile[],
  setFiles: React.Dispatch<React.SetStateAction<ResumeFile[]>>
) => {
  const handleShareWithUser = useCallback(async (fileId: string, userEmail: string, permission: 'view' | 'comment' | 'edit' | 'admin') => {
    try {
      const response = await apiService.shareFile(fileId, {
        userEmail,
        permission,
        userId: userEmail // Use email as user ID for now
      });
      
      if (response && response.share) {
        const newPermission = createSharePermission(userEmail, permission);
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, sharedWith: [...file.sharedWith, newPermission] }
            : file
        ));
      }
    } catch (error) {
      logger.error('Failed to share file:', error);
      // Fallback to local state update
      const newPermission = createSharePermission(userEmail, permission);
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, sharedWith: [...file.sharedWith, newPermission] }
          : file
      ));
    }
  }, [setFiles]);

  const handleRemoveShare = useCallback(async (fileId: string, shareId: string) => {
    try {
      await apiService.deleteFileShare(shareId);
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, sharedWith: file.sharedWith.filter(share => share.id !== shareId) }
          : file
      ));
    } catch (error) {
      logger.error('Failed to remove share:', error);
      // Fallback to local state update
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, sharedWith: file.sharedWith.filter(share => share.id !== shareId) }
          : file
      ));
    }
  }, [setFiles]);

  const handleUpdatePermission = useCallback(async (fileId: string, shareId: string, permission: 'view' | 'comment' | 'edit' | 'admin') => {
    try {
      await apiService.updateFileShare(shareId, { permission });
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
    } catch (error) {
      logger.error('Failed to update permission:', error);
      // Fallback to local state update
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
    }
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

