'use client';

import React, { useState, useEffect } from 'react';
import { Download, Upload, Save, Sparkles, Menu, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  isMobile: boolean;
  isSaving: boolean;
  showRightPanel: boolean;
  previousSidebarState: boolean;
  sidebarCollapsed: boolean;
  isPreviewMode?: boolean;
  lastSavedAt?: Date | null; // Last manual save time
  hasChanges?: boolean; // Whether there are unsaved changes
  onExport: () => void;
  onClear: () => void;
  onImport: () => void;
  onSave: () => void;
  onTogglePreview?: () => void;
  onShowMobileMenu: () => void;
  setPreviousSidebarState: (state: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setShowRightPanel: (show: boolean) => void;
  onToggleSidebar?: () => void;
  mainSidebarCollapsed?: boolean;
  setMainSidebarCollapsed?: (collapsed: boolean) => void;
  previousMainSidebarState?: boolean;
  setPreviousMainSidebarState?: (state: boolean) => void;
}

export default function HeaderNew({
  isMobile,
  isSaving,
  showRightPanel,
  previousSidebarState: _previousSidebarState,
  sidebarCollapsed,
  isPreviewMode,
  lastSavedAt,
  hasChanges,
  onExport,
  onClear,
  onImport,
  onSave,
  onTogglePreview,
  onShowMobileMenu,
  setPreviousSidebarState: _setPreviousSidebarState,
  setSidebarCollapsed: _setSidebarCollapsed,
  setShowRightPanel,
  onToggleSidebar,
  mainSidebarCollapsed,
  setMainSidebarCollapsed,
  previousMainSidebarState: _previousMainSidebarState,
  setPreviousMainSidebarState
}: HeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const isLightMode = theme.mode === 'light';
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Update save status based on isSaving and lastSavedAt
  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    } else if (lastSavedAt && !hasChanges) {
      // Show "Saved" state after save completes
      setSaveStatus('saved');
      // Reset to idle after 2 seconds
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    } else if (!isSaving && hasChanges) {
      // If there are changes and not saving, reset to idle
      setSaveStatus('idle');
    }
  }, [isSaving, lastSavedAt, hasChanges]);
  
  const handleToggleAIPanel = () => {
    if (!showRightPanel) {
      if (setPreviousMainSidebarState && mainSidebarCollapsed !== undefined) {
        setPreviousMainSidebarState(mainSidebarCollapsed);
        setMainSidebarCollapsed?.(true);
      }
    } else {
      if (setMainSidebarCollapsed) {
        setMainSidebarCollapsed(false);
      }
    }
    setShowRightPanel(!showRightPanel);
  };

  const actionButtons = [
    { icon: Upload, label: 'Import', onClick: onImport, title: 'Import Resume' },
    { icon: Download, label: 'Export', onClick: onExport, title: 'Export Resume' },
  ];

  if (onTogglePreview) {
    actionButtons.push({
      icon: isPreviewMode ? EyeOff : Eye,
      label: isPreviewMode ? 'Hide Preview' : 'Preview',
      onClick: onTogglePreview,
      title: 'Toggle Preview Mode'
    });
  }

  return (
    <header 
      className="h-16 flex items-center justify-between px-6 relative z-50 border-b"
      style={{
        background: isLightMode ? '#ffffff' : '#0D1117',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button 
            onClick={onShowMobileMenu}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Toggle mobile menu"
            title="Toggle mobile menu"
          >
            <Menu size={20} />
          </button>
        )}
        
        {/* Sidebar toggle handled inside ResumeEditor to align with vertical icons */}
        
        {/* Auto-save feedback indicator */}
        {hasChanges && !isSaving && (
          <div className="flex items-center gap-2 text-xs" style={{ color: colors.badgeWarningText }}>
            <div className="w-2 h-2 rounded-full" style={{ background: colors.badgeWarningText }}></div>
            <span>Unsaved changes</span>
          </div>
        )}
        {isSaving && (
          <div className="flex items-center gap-2 text-xs" style={{ color: colors.primaryBlue }}>
            <div 
              className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: colors.primaryBlue }}
            ></div>
            <span>Auto-saving...</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* All changes saved status */}
        {!hasChanges && !isSaving && lastSavedAt && (
          <div className="flex items-center gap-2 text-xs" style={{ color: colors.successGreen }}>
            <div className="w-2 h-2 rounded-full" style={{ background: colors.successGreen }}></div>
            <span>All changes saved</span>
          </div>
        )}
        
        {/* Clear Button - Destructive action */}
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-all"
          style={{
            background: isLightMode ? '#ffffff' : colors.inputBackground,
            border: `1px solid ${colors.errorRed}`,
            color: colors.errorRed,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.badgeErrorBg;
            e.currentTarget.style.borderColor = colors.errorRed;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isLightMode ? '#ffffff' : colors.inputBackground;
            e.currentTarget.style.borderColor = colors.errorRed;
          }}
          title="Clear Resume"
        >
          <span>Clear</span>
        </button>

        {actionButtons.filter(btn => btn.label !== 'Clear').map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            disabled={btn.disabled}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-all"
            style={{
              background: isLightMode ? '#ffffff' : colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: btn.disabled ? colors.tertiaryText : colors.secondaryText,
              opacity: btn.disabled ? 0.5 : 1,
              cursor: btn.disabled ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!btn.disabled) {
                e.currentTarget.style.color = isLightMode ? colors.primaryText : '#ffffff';
                e.currentTarget.style.borderColor = colors.successGreen;
              }
            }}
            onMouseLeave={(e) => {
              if (!btn.disabled) {
                e.currentTarget.style.color = colors.secondaryText;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
            title={btn.title}
          >
            <btn.icon size={16} />
            <span>{btn.label}</span>
          </button>
        ))}

        {/* AI Assistant */}
        <button 
          onClick={handleToggleAIPanel}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#34B27B] text-white rounded-lg text-sm font-semibold hover:bg-[#3ECF8E] transition-colors shadow-lg shadow-[#34B27B]/20"
          title="Open AI Assistant"
        >
          <Sparkles size={16} />
          AI Assistant
        </button>

        {/* Save */}
        <button 
          onClick={onSave}
          disabled={isSaving || saveStatus === 'saving'}
          className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-all"
          style={{
            background: saveStatus === 'saving'
              ? (isLightMode ? '#DBEAFE' : '#1E3A5F')
              : saveStatus === 'saved'
              ? (isLightMode ? '#D1FAE5' : '#1E3A5F')
              : (isLightMode ? '#ffffff' : colors.inputBackground),
            border: `1px solid ${
              saveStatus === 'saving'
                ? colors.primaryBlue
                : saveStatus === 'saved'
                ? colors.successGreen
                : colors.border
            }`,
            color: saveStatus === 'saving'
              ? colors.primaryBlue
              : saveStatus === 'saved'
              ? colors.successGreen
              : colors.secondaryText,
            cursor: (isSaving || saveStatus === 'saving') ? 'wait' : 'pointer',
            opacity: (isSaving || saveStatus === 'saving') ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSaving && saveStatus !== 'saving') {
              e.currentTarget.style.color = isLightMode ? colors.primaryText : '#ffffff';
              e.currentTarget.style.borderColor = colors.successGreen;
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaving && saveStatus !== 'saving') {
              e.currentTarget.style.color = saveStatus === 'saved' ? colors.successGreen : colors.secondaryText;
              e.currentTarget.style.borderColor = saveStatus === 'saved' ? colors.successGreen : colors.border;
            }
          }}
          title={
            saveStatus === 'saving' 
              ? "Saving..." 
              : saveStatus === 'saved'
              ? "Saved!"
              : "Save Resume"
          }
        >
          <Save 
            size={16} 
            className={saveStatus === 'saving' ? 'animate-pulse' : ''}
          />
          <span>
            {saveStatus === 'saving' 
              ? 'Saving...' 
              : saveStatus === 'saved'
              ? 'Saved'
              : 'Save'}
          </span>
        </button>
      </div>
    </header>
  );
}

