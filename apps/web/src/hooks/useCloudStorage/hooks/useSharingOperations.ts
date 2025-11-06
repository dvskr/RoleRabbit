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
  const handleShareWithUser = useCallback(async (fileId: string, userEmail: string, permission: 'view' | 'comment' | 'edit' | 'admin', expiresAt?: string, maxDownloads?: number) => {
    // Validate input
    if (!userEmail || !userEmail.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    
    if (!fileId) {
      throw new Error('Invalid file');
    }

    try {
      logger.debug('Sharing file:', { fileId, userEmail, permission, expiresAt, maxDownloads });
      
      const response = await apiService.shareFile(fileId, {
        userEmail: userEmail.trim().toLowerCase(),
        permission,
        expiresAt: expiresAt || undefined,
        maxDownloads: maxDownloads || undefined
      });
      
      logger.debug('Share response:', response);
      
      if (response && response.success) {
        // Update local state with the share
        if (response.share) {
          const newPermission = createSharePermission(
            response.share.sharedWithEmail || userEmail, 
            permission,
            response.share.id
          );
          
          setFiles(prev => prev.map(file => {
            if (file.id === fileId) {
              // Check if share already exists
              const shareExists = file.sharedWith.some(s => s.id === response.share.id);
              if (shareExists) {
                return file;
              }
              return { ...file, sharedWith: [...file.sharedWith, newPermission] };
            }
            return file;
          }));
        }
        
        logger.info('File shared successfully:', fileId, userEmail);
        return response;
      } else {
        throw new Error(response?.error || 'Failed to share file');
      }
    } catch (error: any) {
      logger.error('Failed to share file:', error);
      console.error('Share error details:', error);
      throw error; // Re-throw so parent can show toast
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

  const handleCreateShareLink = useCallback(async (fileId: string, options: { password?: string; expiresAt?: string; maxDownloads?: number }) => {
    try {
      // Create share link via API
      const response = await apiService.createShareLink(fileId, options);
      
      if (response && response.shareLink) {
        const shareLink: ShareLink = {
          id: response.shareLink.id,
          fileId,
          url: response.shareLink.url,
          password: response.shareLink.hasPassword ? options.password : undefined,
          expiresAt: response.shareLink.expiresAt || undefined,
          maxDownloads: response.shareLink.maxDownloads || undefined,
          downloadCount: 0,
          createdAt: new Date().toISOString()
        };
        
        logger.debug('Created share link:', shareLink);
        return shareLink;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      logger.error('Failed to create share link:', error);
      // Fallback to local creation
      const shareLink = createShareLink(fileId, options);
      logger.debug('Created share link (fallback):', shareLink);
      return shareLink;
    }
  }, []);

  const handleAddComment = useCallback(async (fileId: string, content: string, parentId?: string) => {
    logger.debug('Adding comment to file:', fileId, content);
    
    try {
      // Save to backend - let errors propagate so UI can handle them
      const response = await apiService.addFileComment(fileId, { content, parentId });
      
      logger.debug('API response for comment:', response);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.comment) {
        logger.error('Invalid response structure:', response);
        throw new Error('Invalid response from server - comment data missing');
      }

      const newComment: FileComment = {
        id: response.comment.id,
        userId: response.comment.userId,
        userName: response.comment.userName,
        userAvatar: response.comment.userAvatar || DEFAULT_USER_AVATAR,
        content: response.comment.content,
        timestamp: response.comment.timestamp,
        replies: response.comment.replies || [],
        isResolved: response.comment.isResolved || false
      };

      // Update local state optimistically (real-time events will sync)
      // This ensures immediate UI feedback while WebSocket confirms the save
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const existingComments = file.comments || [];
          
          // Check if comment already exists (from real-time event)
          const commentExists = existingComments.some((c: any) => c.id === newComment.id);
          if (commentExists) {
            // Comment already added via real-time event, just return
            return file;
          }
          
          if (parentId) {
            // Add reply to parent comment
            const updatedComments = existingComments.map(comment => 
              comment.id === parentId
                ? { ...comment, replies: [...(comment.replies || []), newComment] }
                : comment
            );
            return { ...file, comments: updatedComments };
          } else {
            // Add top-level comment at the beginning
            return { ...file, comments: [newComment, ...existingComments] };
          }
        }
        return file;
      }));
      
      logger.debug('Comment added successfully:', fileId);
      
      // Return the comment so caller knows it succeeded
      return newComment;
    } catch (error: any) {
      logger.error('Error in handleAddComment:', error);
      console.error('handleAddComment error:', error);
      // Re-throw so UI can handle it
      throw error;
    }
  }, [setFiles]);

  return {
    handleShareWithUser,
    handleRemoveShare,
    handleUpdatePermission,
    handleCreateShareLink,
    handleAddComment
  };
};

