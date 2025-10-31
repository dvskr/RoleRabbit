import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface AddSectionModalProps {
  showAddSectionModal: boolean;
  setShowAddSectionModal: (show: boolean) => void;
  newSectionName: string;
  setNewSectionName: (name: string) => void;
  newSectionContent: string;
  setNewSectionContent: (content: string) => void;
  onAddSection: () => void;
  onOpenAIGenerateModal?: (section: string) => void;
}

export default function AddSectionModal({
  showAddSectionModal,
  setShowAddSectionModal,
  newSectionName,
  setNewSectionName,
  newSectionContent,
  setNewSectionContent,
  onAddSection,
  onOpenAIGenerateModal
}: AddSectionModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!showAddSectionModal) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="rounded-lg p-6 w-full max-w-md mx-4 pointer-events-auto shadow-2xl"
        style={{
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
            Add Custom Section
          </h2>
          <button
            onClick={() => setShowAddSectionModal(false)}
            className="rounded-lg transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Close modal"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
              Section Name
            </label>
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="e.g., Languages, Awards, Publications"
              className="w-full rounded px-3 py-2 transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium" style={{ color: colors.primaryText }}>
                Section Content
              </label>
              {onOpenAIGenerateModal && (
                <button
                  onClick={() => {
                    onOpenAIGenerateModal('custom');
                    setShowAddSectionModal(false);
                  }}
                  className="text-sm flex items-center gap-1.5 font-semibold px-2 py-1 rounded transition-colors"
                  style={{ color: colors.badgePurpleText }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.badgePurpleBg;
                    e.currentTarget.style.color = colors.badgePurpleText;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = colors.badgePurpleText;
                  }}
                  title="Generate content with AI"
                  aria-label="Generate content with AI"
                >
                  <Sparkles size={14} />
                  Generate with AI
                </button>
              )}
            </div>
            <textarea
              value={newSectionContent}
              onChange={(e) => setNewSectionContent(e.target.value)}
              placeholder="Enter the content for this section..."
              className="w-full rounded px-3 py-2 h-32 transition-all resize-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onAddSection}
              className="flex-1 py-2 px-4 rounded transition-colors font-medium"
              style={{
                background: colors.primaryBlue,
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Add Section
            </button>
            <button
              onClick={() => setShowAddSectionModal(false)}
              className="flex-1 py-2 px-4 rounded transition-colors font-medium"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
