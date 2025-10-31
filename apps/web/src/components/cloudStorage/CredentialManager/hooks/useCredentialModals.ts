import { useState } from 'react';
import { CredentialInfo } from '../../../../types/cloudStorage';

export function useCredentialModals() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<CredentialInfo | null>(null);

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);
  
  const openViewModal = (credential: CredentialInfo) => setSelectedCredential(credential);
  const closeViewModal = () => setSelectedCredential(null);

  return {
    showAddModal,
    selectedCredential,
    openAddModal,
    closeAddModal,
    openViewModal,
    closeViewModal,
  };
}

