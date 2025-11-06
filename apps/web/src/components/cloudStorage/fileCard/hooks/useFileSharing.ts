/**
 * Hook for managing file sharing state and actions
 */

import { useState } from 'react';
import { SharePermission } from '../types';
import { logger } from '../../../../utils/logger';

interface UseFileSharingProps {
  fileId: string;
  onShareWithUser: (fileId: string, userEmail: string, permission: SharePermission, expiresAt?: string, maxDownloads?: number) => void | Promise<void>;
}

export const useFileSharing = ({ fileId, onShareWithUser }: UseFileSharingProps) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<SharePermission>('view');
  const [shareExpiresAt, setShareExpiresAt] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShareSubmit = async (): Promise<void> => {
    console.log('handleShareSubmit called', { shareEmail, isSharing, fileId });
    
    if (!shareEmail.trim()) {
      logger.warn('Cannot share: email is empty');
      console.error('Share failed: email is empty');
      return;
    }

    if (isSharing) {
      logger.warn('Cannot share: already sharing');
      console.error('Share failed: already in progress');
      return;
    }

    setIsSharing(true);
    setShareSuccess(false);
    console.log('Starting share process...');

    try {
      const expiresAt = shareExpiresAt ? new Date(shareExpiresAt).toISOString() : undefined;
      const maxDownloadsCount = maxDownloads ? parseInt(maxDownloads) : undefined;
      
      logger.debug('Sharing with options:', {
        fileId,
        email: shareEmail.trim(),
        permission: sharePermission,
        expiresAt,
        maxDownloads: maxDownloadsCount
      });
      
      console.log('Calling onShareWithUser with:', {
        fileId,
        email: shareEmail.trim(),
        permission: sharePermission,
        expiresAt,
        maxDownloads: maxDownloadsCount
      });

      await onShareWithUser(
        fileId, 
        shareEmail.trim(), 
        sharePermission,
        expiresAt,
        maxDownloadsCount
      );
      
      console.log('Share successful!');
      
      // Show success state
      setShareSuccess(true);
      
      // Reset form on success (but keep modal open)
      setShareEmail('');
      setSharePassword('');
      setShareExpiresAt('');
      setMaxDownloads('');
      setRequirePassword(false);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setShareSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Share submission failed:', error);
      logger.error('Share submission failed:', error);
      setShareSuccess(false);
      setIsSharing(false);
      // Don't reset form on error - let user retry
      throw error; // Re-throw so parent can show error toast
    }
  };

  const resetShareForm = () => {
    setShareEmail('');
    setSharePassword('');
    setShareExpiresAt('');
    setMaxDownloads('');
    setRequirePassword(false);
    setIsSharing(false);
    setShareSuccess(false);
  };

  const closeShareModal = () => {
    resetShareForm();
    setShowShareModal(false);
  };

  return {
    showShareModal,
    setShowShareModal: closeShareModal,
    shareEmail,
    setShareEmail,
    sharePermission,
    setSharePermission,
    shareExpiresAt,
    setShareExpiresAt,
    maxDownloads,
    setMaxDownloads,
    requirePassword,
    setRequirePassword,
    sharePassword,
    setSharePassword,
    handleShareSubmit,
    resetShareForm,
    isSharing,
    shareSuccess,
  };
};

