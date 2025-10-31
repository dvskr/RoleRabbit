/**
 * Custom hook for managing portfolio links state
 */

import { useState } from 'react';
import { SocialLink } from '../../types/profile';
import { DEFAULT_LINK_FORM } from '../constants';

export interface LinkFormState {
  platform: string;
  url: string;
}

interface UsePortfolioLinksProps {
  links: SocialLink[];
  onLinksChange: (links: SocialLink[]) => void;
}

export const usePortfolioLinks = ({ links, onLinksChange }: UsePortfolioLinksProps) => {
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [tempLink, setTempLink] = useState<LinkFormState>(DEFAULT_LINK_FORM);

  const handleAddLink = () => {
    if (tempLink.url.trim()) {
      const newLinks = [...links, { platform: tempLink.platform as SocialLink['platform'], url: tempLink.url }];
      onLinksChange(newLinks);
      setTempLink(DEFAULT_LINK_FORM);
      setShowAddLinkModal(false);
    }
  };

  const handleEditLink = (index: number) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { platform: tempLink.platform as SocialLink['platform'], url: tempLink.url };
    onLinksChange(updatedLinks);
    setEditingLinkIndex(null);
  };

  const handleDeleteLink = (index: number) => {
    const filteredLinks = links.filter((_, i) => i !== index);
    onLinksChange(filteredLinks);
  };

  const startEditingLink = (index: number, link: SocialLink) => {
    setTempLink({ platform: link.platform, url: link.url });
    setEditingLinkIndex(index);
  };

  const cancelEditingLink = () => {
    setEditingLinkIndex(null);
    setTempLink(DEFAULT_LINK_FORM);
  };

  return {
    editingLinkIndex,
    showAddLinkModal,
    tempLink,
    setEditingLinkIndex,
    setShowAddLinkModal,
    setTempLink,
    handleAddLink,
    handleEditLink,
    handleDeleteLink,
    startEditingLink,
    cancelEditingLink
  };
};
