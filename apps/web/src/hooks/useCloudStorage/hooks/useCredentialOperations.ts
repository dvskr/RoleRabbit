import { useCallback } from 'react';
import { CredentialInfo } from '../../../types/cloudStorage';
import { logger } from '../../../utils/logger';
import apiService from '../../../services/apiService';

export const useCredentialOperations = () => {
  const handleAddCredential = useCallback(async (credential: Partial<CredentialInfo>) => {
    try {
      const response = await apiService.createCredential(credential);
      if (response && response.credential) {
        logger.debug('Credential added:', response.credential);
        return response.credential;
      }
    } catch (error) {
      logger.error('Failed to add credential:', error);
    }
  }, []);

  const handleUpdateCredential = useCallback(async (id: string, updates: Partial<CredentialInfo>) => {
    try {
      const response = await apiService.updateCredential(id, updates);
      if (response && response.credential) {
        logger.debug('Credential updated:', response.credential);
        return response.credential;
      }
    } catch (error) {
      logger.error('Failed to update credential:', error);
    }
  }, []);

  const handleDeleteCredential = useCallback(async (id: string) => {
    try {
      await apiService.deleteCredential(id);
      logger.debug('Credential deleted:', id);
    } catch (error) {
      logger.error('Failed to delete credential:', error);
    }
  }, []);

  const handleGenerateQRCode = useCallback((id: string) => {
    logger.debug('Generating QR code for:', id);
    // TODO: Implement actual QR code generation with backend
    return `https://roleready.com/credential/${id}/verify`;
  }, []);

  return {
    handleAddCredential,
    handleUpdateCredential,
    handleDeleteCredential,
    handleGenerateQRCode
  };
};

