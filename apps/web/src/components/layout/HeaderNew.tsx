'use client';

import React from 'react';
import { Download, Undo, Redo, Upload, Save, Sparkles, Menu, Share2, Eye, EyeOff, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  isMobile: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showRightPanel: boolean;
  previousSidebarState: boolean;
  sidebarCollapsed: boolean;
  isPreviewMode?: boolean;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onImport: () => void;
  onSave: () => void;
  onToggleAIPanel: () => void;
  onTogglePreview?: () => void;
  onShowMobileMenu: () => void;
  onShowResumeSharing?: () => void;
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
  canUndo,
  canRedo,
  showRightPanel,
  previousSidebarState,
  sidebarCollapsed,
  isPreviewMode,
  onExport,
  onUndo,
  onRedo,
  onImport,
  onSave,
  onToggleAIPanel,
  onTogglePreview,
  onShowMobileMenu,
  onShowResumeSharing,
  setPreviousSidebarState,
  setSidebarCollapsed,
  setShowRightPanel,
  onToggleSidebar,
  mainSidebarCollapsed,
  setMainSidebarCollapsed,
  previousMainSidebarState,
  setPreviousMainSidebarState
}: HeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const isLightMode = theme.mode === 'light';
  
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
    { icon: Undo, label: 'Undo', onClick: onUndo, disabled: !canUndo, title: 'Undo (Ctrl+Z)' },
    { icon: Redo, label: 'Redo', onClick: onRedo, disabled: !canRedo, title: 'Redo (Ctrl+Y)' },
    { icon: Upload, label: 'Import', onClick: onImport, title: 'Import Resume' },
    { icon: Download, label: 'Export', onClick: onExport, title: 'Export Resume' },
  ];

  if (onShowResumeSharing) {
    actionButtons.push({ icon: Share2, label: 'Share', onClick: onShowResumeSharing, title: 'Share Resume' });
  }

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
        
        {isSaving && (
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.successGreen }}>
            <div 
              className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: colors.successGreen }}
            ></div>
            Saving...
          </div>
        )}
        
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-all"
            style={{
              background: isLightMode ? '#ffffff' : colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = isLightMode ? colors.primaryText : '#ffffff';
              e.currentTarget.style.borderColor = colors.successGreen;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.borderColor = colors.border;
            }}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            <span>{sidebarCollapsed ? 'Expand' : 'Collapse'}</span>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {actionButtons.map((btn, index) => (
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
          className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-all"
          style={{
            background: isLightMode ? '#ffffff' : colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isLightMode ? colors.primaryText : '#ffffff';
            e.currentTarget.style.borderColor = colors.successGreen;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.secondaryText;
            e.currentTarget.style.borderColor = colors.border;
          }}
          title="Save Resume"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
      </div>
    </header>
  );
}

