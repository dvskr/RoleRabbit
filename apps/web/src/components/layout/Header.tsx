'use client';

import React, { useState, useEffect } from 'react';
import { Download, Undo, Redo, Upload, Save, Sparkles, Menu, Copy, Share2, Eye, EyeOff, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface HeaderProps {
  isMobile: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showRightPanel: boolean;
  previousSidebarState: boolean;
  sidebarCollapsed: boolean; // Resume Editor panel state
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
  // Main navigation sidebar props (for AI panel collapse behavior)
  mainSidebarCollapsed?: boolean;
  setMainSidebarCollapsed?: (collapsed: boolean) => void;
  previousMainSidebarState?: boolean;
  setPreviousMainSidebarState?: (state: boolean) => void;
}

export default function Header({
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
      // Opening AI panel - save current MAIN sidebar state and collapse it
      if (setPreviousMainSidebarState && mainSidebarCollapsed !== undefined) {
        setPreviousMainSidebarState(mainSidebarCollapsed);
        setMainSidebarCollapsed?.(true);
      }
    } else {
      // Closing AI panel - always open the main sidebar
      if (setMainSidebarCollapsed) {
        setMainSidebarCollapsed(false);
      }
    }
    setShowRightPanel(!showRightPanel);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-2 flex items-center shadow-sm relative z-50">
      {/* Left section with mobile menu and collapse button */}
      <div className="flex items-center gap-3 flex-1">
        {isMobile && (
          <button 
            onClick={onShowMobileMenu}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
        )}
        {isSaving && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </div>
        )}
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={16} className="text-gray-700 group-hover:text-blue-600" />
            ) : (
              <PanelLeftClose size={16} className="text-gray-700 group-hover:text-blue-600" />
            )}
            <span className="font-medium">{sidebarCollapsed ? 'Expand' : 'Collapse'}</span>
          </button>
        )}
      </div>
      {/* Right section with action buttons */}
      <div className="flex gap-2 items-center">
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} className="text-gray-700 group-hover:text-orange-600" />
          <span className="font-medium">Undo</span>
        </button>
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} className="text-gray-700 group-hover:text-orange-600" />
          <span className="font-medium">Redo</span>
        </button>
        <button 
          onClick={onImport}
          className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group"
          title="Import Resume"
        >
          <Upload size={16} className="text-gray-700 group-hover:text-purple-600" />
          <span className="font-medium">Import</span>
        </button>
        <button 
          onClick={onExport}
          className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-green-400 hover:bg-green-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group"
          title="Export Resume"
        >
          <Download size={16} className="text-gray-700 group-hover:text-green-600" />
          <span className="font-medium">Export</span>
        </button>
        {onShowResumeSharing && (
          <button 
            onClick={onShowResumeSharing}
            className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group"
            title="Share Resume"
          >
            <Share2 size={16} className="text-gray-700 group-hover:text-purple-600" />
            <span className="font-medium">Share</span>
          </button>
        )}
        {onTogglePreview && (
          <button 
            onClick={onTogglePreview}
            className={`px-3 py-1.5 border-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 shadow-sm ${
              isPreviewMode 
                ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg'
            }`}
            title="Toggle Preview Mode"
          >
            {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="font-medium">{isPreviewMode ? 'Hide Preview' : 'Preview'}</span>
          </button>
        )}
        <button 
          onClick={handleToggleAIPanel}
          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-xs font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/30 flex items-center gap-1.5 transition-all duration-200"
          title="Open AI Assistant"
        >
          <Sparkles size={16} />
          <span className="font-semibold">AI Assistant</span>
        </button>
        <button 
          onClick={onSave}
          className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group"
          title="Save Resume"
        >
          <Save size={16} className="text-gray-700 group-hover:text-blue-600" />
          <span className="font-medium">Save</span>
        </button>
      </div>
    </div>
  );
}
