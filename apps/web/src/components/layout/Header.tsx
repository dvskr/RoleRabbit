'use client';

import React, { useState, useEffect } from 'react';
import { Download, Undo, Redo, Upload, Save, Sparkles, Menu, Share2, Eye, EyeOff, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface HeaderProps {
  isMobile: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showRightPanel: boolean;
  previousSidebarState: boolean;
  sidebarCollapsed: boolean; // Resume Editor panel state
  isPreviewMode?: boolean;
  lastSavedAt?: Date | null; // Last manual save time
  hasChanges?: boolean; // Whether there are unsaved changes
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onImport: () => void;
  onSave: () => void;
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
  previousSidebarState: _previousSidebarState,
  sidebarCollapsed,
  isPreviewMode,
  lastSavedAt,
  hasChanges,
  onExport,
  onUndo,
  onRedo,
  onImport,
  onSave,
  onTogglePreview,
  onShowMobileMenu,
  onShowResumeSharing,
  setPreviousSidebarState: _setPreviousSidebarState,
  setSidebarCollapsed: _setSidebarCollapsed,
  setShowRightPanel,
  onToggleSidebar,
  mainSidebarCollapsed,
  setMainSidebarCollapsed,
  previousMainSidebarState: _previousMainSidebarState,
  setPreviousMainSidebarState
}: HeaderProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Update save status based on isSaving and lastSavedAt
  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    } else if (lastSavedAt && !hasChanges) {
      setSaveStatus('saved');
      // Reset to idle after 2 seconds
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setSaveStatus('idle');
    }
  }, [isSaving, lastSavedAt, hasChanges]);
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
        {/* Auto-save feedback indicator */}
        {hasChanges && !isSaving && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Unsaved changes</span>
          </div>
        )}
        {isSaving && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Auto-saving...</span>
          </div>
        )}
        {!hasChanges && !isSaving && lastSavedAt && (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>All changes saved</span>
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
          disabled={isSaving || saveStatus === 'saving'}
          className={`px-3 py-1.5 border-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm flex items-center gap-1.5 group ${
            saveStatus === 'saving'
              ? 'bg-blue-100 border-blue-300 text-blue-700 cursor-wait' 
              : saveStatus === 'saved'
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg'
          }`}
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
            className={
              saveStatus === 'saving' 
                ? "text-blue-600 animate-pulse" 
                : saveStatus === 'saved'
                ? "text-green-600"
                : "text-gray-700 group-hover:text-blue-600"
            } 
          />
          <span className="font-medium">
            {saveStatus === 'saving' 
              ? 'Saving...' 
              : saveStatus === 'saved'
              ? 'Saved'
              : 'Save'}
          </span>
        </button>
      </div>
    </div>
  );
}
