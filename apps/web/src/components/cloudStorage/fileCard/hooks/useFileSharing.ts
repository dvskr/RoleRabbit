/**
 * Hook for managing file sharing state and actions
 */

import { useState, useCallback } from 'react';
import { SharePermission } from '../types';
import { logger } from '../../../../utils/logger';
import { validateEmail } from '../../../../utils/validation';

interface UseFileSharingProps {
  fileId: string;
  onShareWithUser: (fileId: string, userEmail: string, permission: SharePermission, expiresAt?: string, maxDownloads?: number) => void | Promise<void>;
}

export const useFileSharing = ({ fileId, onShareWithUser }: UseFileSharingProps) => {
  const [showShareModal, setShowShareModalState] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<SharePermission>('view');
  const [shareExpiresAt, setShareExpiresAt] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleShareSubmit = async (): Promise<void> => {
    console.log('handleShareSubmit called', { shareEmail, isSharing, fileId });
    
    // FE-026: Validate email format
    const emailValidation = validateEmail(shareEmail);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || 'Invalid email address');
      logger.warn('Cannot share: invalid email', { email: shareEmail, error: emailValidation.error });
      return;
    }
    
    setEmailError(null);
    
    if (!shareEmail.trim()) {
      setEmailError('Email address is required');
      logger.warn('Cannot share: email is empty');
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
      setIsSharing(false);
      
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
      // Re-throw error so parent component can show toast notification
      throw error;
    }
  };

  const resetShareForm = useCallback(() => {
    setShareEmail('');
    setSharePassword('');
    setShareExpiresAt('');
    setMaxDownloads('');
    setRequirePassword(false);
    setIsSharing(false);
    setShareSuccess(false);
  }, []);

  const closeShareModal = useCallback(() => {
    resetShareForm();
    setShowShareModalState(false);
  }, [resetShareForm]);

  const openShareModal = useCallback(() => {
    setShowShareModalState(true);
  }, []);

  const setShowShareModal = useCallback((show: boolean) => {
    if (show) {
      openShareModal();
    } else {
      closeShareModal();
    }
  }, [openShareModal, closeShareModal]);

  return {
    showShareModal,
    setShowShareModal,
    closeShareModal,
    openShareModal,
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
    emailError,
    setEmailError,
  };
};

