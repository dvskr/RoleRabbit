/**
 * Custom hook for managing dashboard cloud storage modals
 */

import { useState } from 'react';
import { ResumeFile } from '../../../types/cloudStorage';
import apiService from '../../../services/apiService';
import { logger } from '../../../utils/logger';

export interface UseDashboardCloudStorageReturn {
  showSaveToCloudModal: boolean;
  setShowSaveToCloudModal: (show: boolean) => void;
  showImportFromCloudModal: boolean;
  setShowImportFromCloudModal: (show: boolean) => void;
  cloudResumes: ResumeFile[];
  setCloudResumes: (resumes: ResumeFile[]) => void;
  handleSaveToCloud: () => void;
  handleImportFromCloud: () => void;
}

/**
 * Hook for managing cloud storage modal states
 */
export function useDashboardCloudStorage(): UseDashboardCloudStorageReturn {
  const [showSaveToCloudModal, setShowSaveToCloudModal] = useState(false);
  const [showImportFromCloudModal, setShowImportFromCloudModal] = useState(false);
  const [cloudResumes, setCloudResumes] = useState<ResumeFile[]>([]);

  const handleSaveToCloud = () => {
    setShowSaveToCloudModal(true);
  };

  const handleImportFromCloud = async () => {
    try {
      // Load from API
      const response = await apiService.listCloudResumes();
      if (response && response.savedResumes) {
        setCloudResumes(response.savedResumes);
      }
      setShowImportFromCloudModal(true);
    } catch (error) {
      logger.error('Failed to load cloud resumes:', error);
      setCloudResumes([]);
      setShowImportFromCloudModal(true);
    }
  };

  return {
    showSaveToCloudModal,
    setShowSaveToCloudModal,
    showImportFromCloudModal,
    setShowImportFromCloudModal,
    cloudResumes,
    setCloudResumes,
    handleSaveToCloud,
    handleImportFromCloud,
  };
}

