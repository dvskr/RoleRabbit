'use client';

import React, { useState } from 'react';
import { Download, Undo, Redo, Upload, Save, Sparkles, Menu, Share2, Eye, EyeOff, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

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
    <header className="h-16 bg-[#0D1117] border-b border-[#27272A] flex items-center justify-between px-6 relative z-50">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button 
            onClick={onShowMobileMenu}
            className="p-2 hover:bg-[#1A1F26] rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
            title="Toggle mobile menu"
          >
            <Menu size={20} className="text-[#A0A0A0]" />
          </button>
        )}
        
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-[#34B27B]">
            <div className="w-3 h-3 border-2 border-[#34B27B] border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </div>
        )}
        
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1F26] border border-[#27272A] rounded-lg text-sm text-[#A0A0A0] hover:text-white hover:border-[#34B27B] transition-all"
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
            className={`flex items-center gap-2 px-3 py-1.5 bg-[#1A1F26] border border-[#27272A] rounded-lg text-sm text-[#A0A0A0] transition-all ${
              btn.disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:text-white hover:border-[#34B27B]'
            }`}
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
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1F26] border border-[#27272A] rounded-lg text-sm text-[#A0A0A0] hover:text-white hover:border-[#34B27B] transition-all"
          title="Save Resume"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
      </div>
    </header>
  );
}

