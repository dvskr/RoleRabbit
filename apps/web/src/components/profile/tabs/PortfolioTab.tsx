/* eslint-disable react/forbid-dom-props */
'use client';

import React from 'react';
import { Trophy, Link2, Plus, Edit, Trash2, X, Check, BarChart3, ExternalLink, Globe } from 'lucide-react';
import { UserData } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';
import { usePortfolioLinks } from './portfolio/hooks/usePortfolioLinks';
// Projects are now managed in ProfessionalTab - removed usePortfolioProjects to avoid duplication
import { usePortfolioAchievements } from './portfolio/hooks/usePortfolioAchievements';
import { getAchievementIcon } from './portfolio/portfolioHelpers';
import LinkCard from './portfolio/components/LinkCard';
import AddLinkModal from './portfolio/components/AddLinkModal';
import { usePortfolioStyles } from './portfolio/usePortfolioStyles';
import styles from './portfolio/portfolio.module.css';

interface PortfolioTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function PortfolioTab({
  userData,
  isEditing,
  onUserDataChange
}: PortfolioTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const portfolioStyles = usePortfolioStyles(colors);

  // Use custom hooks for state management
  const linksHook = usePortfolioLinks({
    links: userData.socialLinks || [],
    onLinksChange: (links) => onUserDataChange({ socialLinks: links })
  });

  // Note: Projects are now managed in ProfessionalTab to avoid duplication
  // Removed projectsHook and projectsHook references

  const achievementsHook = usePortfolioAchievements({
    achievements: userData.achievements || [],
    onAchievementsChange: (achievements) => onUserDataChange({ achievements })
  });

  return (
    // eslint-disable-next-line react/forbid-dom-props
    <div className={styles.portfolioContainer} style={portfolioStyles}>
      <div className={styles.portfolioHeader}>
        <h2 className={styles.portfolioTitle}>
          Portfolio & Achievements
        </h2>
        <p className={styles.portfolioDescription}>
          Showcase your work, projects, and professional achievements
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Statistics Overview */}
        {(userData.socialLinks && userData.socialLinks.length > 0) || (userData.achievements && userData.achievements.length > 0) || userData.portfolio ? (
          <div 
            className="backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} style={{ color: colors.primaryBlue }} />
              <h3 
                className="text-lg font-semibold"
                style={{ color: colors.primaryText }}
              >
                Portfolio Overview
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: colors.primaryBlue }}>
                  {userData.socialLinks?.length || 0}
                </div>
                <div className="text-xs" style={{ color: colors.secondaryText }}>Social Links</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: colors.badgeWarningText }}>
                  {userData.achievements?.length || 0}
                </div>
                <div className="text-xs" style={{ color: colors.secondaryText }}>Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: colors.badgeInfoText }}>
                  {userData.portfolio ? '✓' : '—'}
                </div>
                <div className="text-xs" style={{ color: colors.secondaryText }}>Portfolio Site</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Social Links */}
        <div className={styles.portfolioCard}>
          <div className={styles.portfolioSectionHeader}>
            <h3 className={styles.portfolioSectionTitle}>
              <Link2 style={{ color: 'var(--portfolio-primary-blue)' }} />
              Professional Links
            </h3>
            {isEditing && (
              <button
                onClick={() => linksHook.setShowAddLinkModal(true)}
                className={`${styles.portfolioButton} ${styles.portfolioButton}`}
              >
                <Plus size={16} />
                Add Link
              </button>
            )}
          </div>
          {userData.socialLinks && userData.socialLinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userData.socialLinks.map((link, index) => (
                <LinkCard
                  key={index}
                  link={link}
                  index={index}
                  isEditing={isEditing}
                  isEditable={true}
                  editingLinkIndex={linksHook.editingLinkIndex}
                  tempLink={linksHook.tempLink}
                  colors={colors}
                  onEdit={() => linksHook.startEditingLink(index, link)}
                  onSave={() => linksHook.handleEditLink(index)}
                  onCancel={linksHook.cancelEditingLink}
                  onDelete={() => linksHook.handleDeleteLink(index)}
                  onTempLinkChange={linksHook.setTempLink}
                />
              ))}
            </div>
          ) : (
            <div className={styles.portfolioEmptyState}>
              No professional links yet
            </div>
          )}
        </div>

        {/* Note: Projects are now managed in the Professional tab to avoid duplication */}

        {/* Achievements */}
        <div className={styles.portfolioCard}>
          <div className={styles.portfolioSectionHeader}>
            <h3 className={styles.portfolioSectionTitle}>
              <Trophy style={{ color: 'var(--portfolio-badge-warning-text)' }} />
              Awards & Achievements
            </h3>
            {isEditing && (
              <button
                onClick={() => achievementsHook.setShowAddAchievementModal(true)}
                className={styles.portfolioButton}
                style={{ background: 'var(--portfolio-badge-warning-text)' }}
              >
                <Plus size={16} />
                Add Achievement
              </button>
            )}
          </div>
          {userData.achievements && userData.achievements.length > 0 ? (
            <div className="space-y-4">
              {userData.achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={styles.portfolioAchievementCard}
                  data-editing={achievementsHook.editingAchievementIndex === index ? 'true' : undefined}
                  onMouseEnter={(e) => {
                    if (achievementsHook.editingAchievementIndex !== index) {
                      e.currentTarget.style.background = 'var(--portfolio-hover-bg)';
                      e.currentTarget.style.borderColor = 'var(--portfolio-border-focused)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (achievementsHook.editingAchievementIndex !== index) {
                      e.currentTarget.style.background = 'var(--portfolio-input-bg)';
                      e.currentTarget.style.borderColor = 'var(--portfolio-border)';
                    }
                  }}
                >
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: 'var(--portfolio-badge-warning-bg)' }}
                  >
                    {getAchievementIcon(achievement.type, colors)}
                  </div>
                  {achievementsHook.editingAchievementIndex === index ? (
                    <div className="flex-1 space-y-2">
                      <select
                        value={achievementsHook.tempAchievement.type}
                        onChange={(e) => achievementsHook.setTempAchievement({ ...achievementsHook.tempAchievement, type: e.target.value })}
                        className={`w-full ${styles.portfolioSelect}`}
                        title="Achievement type"
                        aria-label="Select achievement type"
                      >
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <option value="Award" style={{ background: 'var(--portfolio-background)', color: 'var(--portfolio-secondary-text)' }}>Award</option>
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <option value="Publication" style={{ background: 'var(--portfolio-background)', color: 'var(--portfolio-secondary-text)' }}>Publication</option>
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <option value="Speaking" style={{ background: 'var(--portfolio-background)', color: 'var(--portfolio-secondary-text)' }}>Speaking Engagement</option>
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <option value="Certification" style={{ background: 'var(--portfolio-background)', color: 'var(--portfolio-secondary-text)' }}>Certification</option>
                      </select>
                      <input
                        type="text"
                        value={achievementsHook.tempAchievement.title}
                        onChange={(e) => achievementsHook.setTempAchievement({ ...achievementsHook.tempAchievement, title: e.target.value })}
                        placeholder="Achievement Title"
                        className={`w-full ${styles.portfolioInput}`}
                      />
                      <textarea
                        value={achievementsHook.tempAchievement.description}
                        onChange={(e) => achievementsHook.setTempAchievement({ ...achievementsHook.tempAchievement, description: e.target.value })}
                        placeholder="Description"
                        rows={2}
                        className={`w-full ${styles.portfolioTextarea}`}
                      />
                      <input
                        type="text"
                        value={achievementsHook.tempAchievement.date}
                        onChange={(e) => achievementsHook.setTempAchievement({ ...achievementsHook.tempAchievement, date: e.target.value })}
                        placeholder="Date (YYYY-MM)"
                        className={`w-full ${styles.portfolioInput}`}
                      />
                      <input
                        type="url"
                        value={achievementsHook.tempAchievement.link || ''}
                        onChange={(e) => achievementsHook.setTempAchievement({ ...achievementsHook.tempAchievement, link: e.target.value })}
                        placeholder="Link (optional)"
                        className={`w-full ${styles.portfolioInput}`}
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => achievementsHook.handleEditAchievement(index)} 
                          className={`flex-1 px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 ${styles.portfolioButtonSuccess}`}
                        >
                          <Check size={16} /> Save
                        </button>
                        <button 
                          onClick={() => achievementsHook.setEditingAchievementIndex(null)} 
                          className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${styles.portfolioButtonSecondary}`}
                        >
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${styles.portfolioTextPrimary}`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm mb-2 ${styles.portfolioTextSecondary}`}>
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs ${styles.portfolioTextTertiary}`}>
                            {achievement.date}
                          </span>
                          <span 
                            className={`px-2 py-1 rounded text-xs font-medium`}
                            style={{
                              background: 'var(--portfolio-badge-warning-bg)',
                              color: 'var(--portfolio-badge-warning-text)',
                              border: '1px solid var(--portfolio-badge-warning-border)',
                            }}
                          >
                            {achievement.type}
                          </span>
                          {achievement.link && (
                            <a
                              href={achievement.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs transition-colors"
                              style={{ color: 'var(--portfolio-primary-blue)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--portfolio-primary-blue-hover)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--portfolio-primary-blue)';
                              }}
                            >
                              View Details
                            </a>
                          )}
                        </div>
                      </div>
                      {isEditing && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              achievementsHook.startEditingAchievement(index, achievement);
                            }}
                            className="p-2 rounded transition-colors"
                            style={{ color: 'var(--portfolio-primary-blue)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--portfolio-badge-info-bg)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                            title="Edit"
                            aria-label={`Edit ${achievement.title}`}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this achievement?')) achievementsHook.handleDeleteAchievement(index);
                            }}
                            className="p-2 rounded transition-colors"
                            style={{ color: 'var(--portfolio-error-red)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--portfolio-badge-error-bg)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                            title="Delete"
                            aria-label={`Delete ${achievement.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.portfolioEmptyState}>
              No achievements yet
            </div>
          )}
        </div>

        {/* Portfolio Website (separate from social links) */}
        <div className={styles.portfolioCard}>
          <h3 className={`text-xl font-semibold mb-6 ${styles.portfolioTextPrimary}`}>
            Portfolio Website
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${styles.portfolioTextPrimary}`}>
                Portfolio URL
              </label>
              <input
                type="url"
                value={userData.portfolio}
                onChange={(e) => onUserDataChange({ portfolio: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded-xl ${styles.portfolioInput}`}
                placeholder="https://yourportfolio.com"
              />
              <p className={`text-xs mt-2 ${styles.portfolioTextSecondary}`}>
                Note: LinkedIn, GitHub, and other social links can be added in the "Professional Links" section above.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Link Modal */}
      <AddLinkModal
        isOpen={linksHook.showAddLinkModal}
        tempLink={linksHook.tempLink}
        colors={colors}
        onClose={() => linksHook.setShowAddLinkModal(false)}
        onSave={linksHook.handleAddLink}
        onTempLinkChange={linksHook.setTempLink}
      />


      {/* Add Achievement Modal */}
      {achievementsHook.showAddAchievementModal && (
        <div 
          className={styles.portfolioModalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              achievementsHook.setShowAddAchievementModal(false);
            }
          }}
        >
          <div 
            className={styles.portfolioModal}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={styles.portfolioModalHeader}>
              <h3 className={styles.portfolioModalTitle}>
                Add Achievement
              </h3>
              <button 
                onClick={() => achievementsHook.setShowAddAchievementModal(false)} 
                className={styles.portfolioCloseButton}
                title="Close modal"
                aria-label="Close add achievement modal"
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
                  Type
                </label>
                <select
                  value={achievementsHook.tempAchievement.type}
                  onChange={(e) => achievementsHook.setTempAchievement({ ...achievementsHook.tempAchievement, type: e.target.value })}
                        className={`w-full ${styles.portfolioSelect}`}
                        title="Achievement type"
                        aria-label="Select achievement type"
                      >
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <option value="Award" style={{ background: 'var(--portfolio-background)', color: 'var(--portfolio-secondary-text)' }}>Award</option>
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <option value="Publication" style={{ background: 'var(--portfolio-background)', color: 'var(--portfolio-secondary-text)' }}>Publication</option>
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <option value="Speaking" style={{ background: 'var(--portfolio-background)', color: 'var(--portfolio-secondary-text)' }}>Speaking Engagement</option>
                        {/* eslint-disable-next-line react/forbid-dom-props */}
                        <option value="Certification" style={{ background: 'var(--portfolio-background)', color: 'var(--portfolio-secondary-text)' }}>Certification</option>
                      </select>
              </div>
              <input
                type="text"
                value={achievementsHook.tempAchievement.title}
                onChange={(e) => achievementsHook.setTempAchievement({ ...achievementsHook.tempAchievement, title: e.target.value })}
                placeholder="Achievement Title"
                className={`w-full ${styles.portfolioInput}`}
              />
              <textarea
                value={achievementsHook.tempAchievement.description}
                onChange={(e) => achievementsHook.setTempAchievement({ ...achievementsHook.tempAchievement, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className={`w-full ${styles.portfolioTextarea}`}
              />
              <input
                type="text"
                value={achievementsHook.tempAchievement.date}
                onChange={(e) => achievementsHook.setTempAchievement({ ...achievementsHook.tempAchievement, date: e.target.value })}
                placeholder="Date (YYYY-MM)"
                className={`w-full ${styles.portfolioInput}`}
              />
              <input
                type="url"
                value={achievementsHook.tempAchievement.link || ''}
                onChange={(e) => achievementsHook.setTempAchievement({ ...achievementsHook.tempAchievement, link: e.target.value })}
                placeholder="Link (optional)"
                className={`w-full ${styles.portfolioInput}`}
              />
            </div>
            <div className={styles.portfolioModalActions}>
              <button
                onClick={() => achievementsHook.setShowAddAchievementModal(false)}
                className={`${styles.portfolioModalButton} ${styles.portfolioButtonSecondary}`}
              >
                Cancel
              </button>
              <button
                onClick={achievementsHook.handleAddAchievement}
                disabled={!achievementsHook.tempAchievement.title.trim()}
                className={`${styles.portfolioModalButton} ${styles.portfolioButton}`}
                style={{
                  background: !achievementsHook.tempAchievement.title.trim() ? 'var(--portfolio-input-bg)' : 'var(--portfolio-badge-warning-text)',
                  color: !achievementsHook.tempAchievement.title.trim() ? 'var(--portfolio-tertiary-text)' : 'white',
                  opacity: !achievementsHook.tempAchievement.title.trim() ? 0.5 : 1,
                  cursor: !achievementsHook.tempAchievement.title.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                Add Achievement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
