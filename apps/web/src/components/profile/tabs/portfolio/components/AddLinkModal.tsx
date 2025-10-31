'use client';

import React from 'react';
import { X } from 'lucide-react';
import { LinkFormState } from '../hooks/usePortfolioLinks';
import styles from '../portfolio.module.css';

interface AddLinkModalProps {
  isOpen: boolean;
  tempLink: LinkFormState;
  colors: any;
  onClose: () => void;
  onSave: () => void;
  onTempLinkChange: (link: LinkFormState) => void;
}

export default function AddLinkModal({
  isOpen,
  tempLink,
  colors,
  onClose,
  onSave,
  onTempLinkChange
}: AddLinkModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.portfolioModalOverlay}>
      <div className={styles.portfolioModal}>
        <div className={styles.portfolioModalHeader}>
          <h3 className={styles.portfolioModalTitle}>
            Add Professional Link
          </h3>
          <button 
            onClick={onClose} 
            className={styles.portfolioCloseButton}
            title="Close modal"
            aria-label="Close add link modal"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--portfolio-hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${styles.portfolioTextPrimary}`}>
              Platform
            </label>
            <input
              type="text"
              value={tempLink.platform}
              onChange={(e) => onTempLinkChange({ ...tempLink, platform: e.target.value })}
              className={`w-full ${styles.portfolioInput}`}
              placeholder="e.g., LinkedIn, GitHub"
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${styles.portfolioTextPrimary}`}>
              URL
            </label>
            <input
              type="url"
              value={tempLink.url}
              onChange={(e) => onTempLinkChange({ ...tempLink, url: e.target.value })}
              className={`w-full ${styles.portfolioInput}`}
              placeholder="https://"
            />
          </div>
        </div>
        <div className={styles.portfolioModalActions}>
          <button
            onClick={onClose}
            className={`${styles.portfolioModalButton} ${styles.portfolioButtonSecondary}`}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!tempLink.url.trim()}
            className={`${styles.portfolioModalButton} ${!tempLink.url.trim() ? styles.portfolioModalButtonDisabled : styles.portfolioModalButtonEnabled}`}
          >
            Add Link
          </button>
        </div>
      </div>
    </div>
  );
}
