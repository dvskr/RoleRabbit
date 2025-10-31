/**
 * Custom hook for managing dashboard cloud storage modals
 */

import { useState } from 'react';
import { ResumeFile } from '../../../types/cloudStorage';
import { loadCloudResumes } from '../utils/cloudStorageHelpers';

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

  const handleImportFromCloud = () => {
    const resumes = loadCloudResumes();
    setCloudResumes(resumes);
    setShowImportFromCloudModal(true);
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

