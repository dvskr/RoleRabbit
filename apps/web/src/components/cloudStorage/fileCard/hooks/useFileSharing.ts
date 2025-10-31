/**
 * Hook for managing file sharing state and actions
 */

import { useState } from 'react';
import { SharePermission } from '../types';
import { logger } from '../../../../utils/logger';

interface UseFileSharingProps {
  fileId: string;
  onShareWithUser: (fileId: string, userEmail: string, permission: SharePermission) => void;
}

export const useFileSharing = ({ fileId, onShareWithUser }: UseFileSharingProps) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<SharePermission>('view');
  const [shareExpiresAt, setShareExpiresAt] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [sharePassword, setSharePassword] = useState('');

  const handleShareSubmit = () => {
    if (shareEmail.trim()) {
      const shareOptions = {
        email: shareEmail.trim(),
        permission: sharePermission,
        expiresAt: shareExpiresAt || undefined,
        maxDownloads: maxDownloads ? parseInt(maxDownloads) : undefined,
        password: requirePassword && sharePassword ? sharePassword : undefined
      };
      
      logger.debug('Sharing with options:', shareOptions);
      onShareWithUser(fileId, shareEmail.trim(), sharePermission);
      
      // Reset form
      setShareEmail('');
      setSharePassword('');
      setShareExpiresAt('');
      setMaxDownloads('');
      setRequirePassword(false);
      setShowShareModal(false);
    }
  };

  const resetShareForm = () => {
    setShareEmail('');
    setSharePassword('');
    setShareExpiresAt('');
    setMaxDownloads('');
    setRequirePassword(false);
  };

  return {
    showShareModal,
    setShowShareModal,
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
  };
};

