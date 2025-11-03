'use client';

import React from 'react';
import { Edit, Trash2, X, Check, ExternalLink } from 'lucide-react';
import { SocialLink } from '../../types/profile';
import { getPlatformIcon } from '../portfolioHelpers';
import { LinkFormState } from '../hooks/usePortfolioLinks';
import styles from '../portfolio.module.css';

interface LinkCardProps {
  link: SocialLink;
  index: number;
  isEditing: boolean;
  isEditable: boolean;
  editingLinkIndex: number | null;
  tempLink: LinkFormState;
  colors: any;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onTempLinkChange: (link: LinkFormState) => void;
}

export default function LinkCard({
  link,
  index,
  isEditing,
  isEditable,
  editingLinkIndex,
  tempLink,
  colors,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onTempLinkChange
}: LinkCardProps) {
  const isCurrentlyEditing = editingLinkIndex === index;

  return (
    <div
      className={styles.portfolioLinkCard}
      data-editing={isCurrentlyEditing ? 'true' : undefined}
      onMouseEnter={(e) => {
        if (!isCurrentlyEditing) {
          e.currentTarget.style.background = 'var(--portfolio-hover-bg)';
          e.currentTarget.style.borderColor = 'var(--portfolio-border-focused)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isCurrentlyEditing) {
          e.currentTarget.style.background = 'var(--portfolio-input-bg)';
          e.currentTarget.style.borderColor = 'var(--portfolio-border)';
        }
      }}
    >
      {isCurrentlyEditing ? (
        <div className="flex-1 space-y-2">
          <input
            id={`link-platform-${link.id}`}
            name={`link-platform-${link.id}`}
            type="text"
            value={tempLink.platform}
            onChange={(e) => onTempLinkChange({ ...tempLink, platform: e.target.value })}
            className={`w-full ${styles.portfolioLinkCardInput}`}
            placeholder="Platform"
          />
          <input
            id={`link-url-${link.id}`}
            name={`link-url-${link.id}`}
            type="url"
            value={tempLink.url}
            onChange={(e) => onTempLinkChange({ ...tempLink, url: e.target.value })}
            className={`w-full ${styles.portfolioLinkCardInput}`}
            placeholder="URL"
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className={`${styles.portfolioLinkCardButtonSmall} ${styles.portfolioButtonSuccess} ${styles.portfolioLinkCardButtonSmallSuccess}`}
              aria-label="Save link"
              title="Save link"
            >
              <Check size={12} />
            </button>
            <button
              onClick={onCancel}
              className={`${styles.portfolioLinkCardButtonSmall} ${styles.portfolioButtonSecondary}`}
              aria-label="Cancel editing link"
              title="Cancel editing link"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.portfolioLinkIconContainer}>
            {getPlatformIcon(link.platform)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${styles.portfolioLinkPlatformText}`}>
              {link.platform}
            </p>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`truncate ${styles.portfolioLinkUrlText}`}
              title={link.url}
            >
              {link.url}
            </a>
          </div>
          <ExternalLink size={16} className={styles.portfolioLinkIconContainer} />
          {isEditing && (
            <div className="flex gap-1">
              <button
                onClick={onEdit}
                className={styles.portfolioLinkEditButton}
                title="Edit"
                aria-label={`Edit ${link.platform}`}
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this link?')) onDelete();
                }}
                className={styles.portfolioLinkDeleteButton}
                title="Delete"
                aria-label={`Delete ${link.platform}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
