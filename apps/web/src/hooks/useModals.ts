import { useState, useCallback } from 'react';

export function useModals() {
  const [showNewResumeModal, setShowNewResumeModal] = useState(false);
  const [showAIOptimize, setShowAIOptimize] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [showCompareVersions, setShowCompareVersions] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showATSScore, setShowATSScore] = useState(false);
  const [showAIConfirmation, setShowAIConfirmation] = useState(false);
  const [showTailorConfirmation, setShowTailorConfirmation] = useState(false);

  const openModal = useCallback((modalName: string) => {
    switch (modalName) {
      case 'newResume':
        setShowNewResumeModal(true);
        break;
      case 'aiOptimize':
        setShowAIOptimize(true);
        break;
      case 'aiGenerate':
        setShowAIGenerate(true);
        break;
      case 'aiGenerateModal':
        setShowAIGenerateModal(true);
        break;
      case 'versionManager':
        setShowVersionManager(true);
        break;
      case 'createVersion':
        setShowCreateVersion(true);
        break;
      case 'compareVersions':
        setShowCompareVersions(true);
        break;
      case 'rightPanel':
        setShowRightPanel(true);
        break;
      case 'atsScore':
        setShowATSScore(true);
        break;
      case 'aiConfirmation':
        setShowAIConfirmation(true);
        break;
      case 'tailorConfirmation':
        setShowTailorConfirmation(true);
        break;
    }
  }, []);

  const closeModal = useCallback((modalName: string) => {
    switch (modalName) {
      case 'newResume':
        setShowNewResumeModal(false);
        break;
      case 'aiOptimize':
        setShowAIOptimize(false);
        break;
      case 'aiGenerate':
        setShowAIGenerate(false);
        break;
      case 'aiGenerateModal':
        setShowAIGenerateModal(false);
        break;
      case 'versionManager':
        setShowVersionManager(false);
        break;
      case 'createVersion':
        setShowCreateVersion(false);
        break;
      case 'compareVersions':
        setShowCompareVersions(false);
        break;
      case 'rightPanel':
        setShowRightPanel(false);
        break;
      case 'atsScore':
        setShowATSScore(false);
        break;
      case 'aiConfirmation':
        setShowAIConfirmation(false);
        break;
      case 'tailorConfirmation':
        setShowTailorConfirmation(false);
        break;
    }
  }, []);

  const closeAllModals = useCallback(() => {
    setShowNewResumeModal(false);
    setShowAIOptimize(false);
    setShowAIGenerate(false);
    setShowAIGenerateModal(false);
    setShowVersionManager(false);
    setShowCreateVersion(false);
    setShowCompareVersions(false);
    setShowRightPanel(false);
    setShowATSScore(false);
    setShowAIConfirmation(false);
    setShowTailorConfirmation(false);
  }, []);

  return {
    // Modal states
    showNewResumeModal,
    showAIOptimize,
    showAIGenerate,
    showAIGenerateModal,
    showVersionManager,
    showCreateVersion,
    showCompareVersions,
    showRightPanel,
    showATSScore,
    showAIConfirmation,
    showTailorConfirmation,
    
    // Modal actions
    openModal,
    closeModal,
    closeAllModals,
    
    // Direct setters for backward compatibility
    setShowNewResumeModal,
    setShowAIOptimize,
    setShowAIGenerate,
    setShowAIGenerateModal,
    setShowVersionManager,
    setShowCreateVersion,
    setShowCompareVersions,
    setShowRightPanel,
    setShowATSScore,
    setShowAIConfirmation,
    setShowTailorConfirmation
  };
}
