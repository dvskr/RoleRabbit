'use client';

import React from 'react';
import { Download, Undo, Redo, Upload, Save, Sparkles, Menu, Copy, Share2, Eye, EyeOff, X } from 'lucide-react';

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
  setShowRightPanel
}: HeaderProps) {
  const handleToggleAIPanel = () => {
    if (!showRightPanel) {
      // Opening AI panel - save current sidebar state and collapse it
      setPreviousSidebarState(sidebarCollapsed);
      setSidebarCollapsed(true);
    } else {
      // Closing AI panel - restore previous sidebar state
      setSidebarCollapsed(previousSidebarState);
    }
    setShowRightPanel(!showRightPanel);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-2 flex justify-between items-center shadow-sm relative z-50">
      <div className="flex items-center gap-3">
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
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Undo size={14} className="text-gray-600 group-hover:text-orange-600" />
          <span className="font-medium">Undo</span>
        </button>
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Redo size={14} className="text-gray-600 group-hover:text-orange-600" />
          <span className="font-medium">Redo</span>
        </button>
        <button 
          onClick={onImport}
          className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group"
        >
          <Upload size={14} className="text-gray-600 group-hover:text-purple-600" />
          <span className="font-medium">Import</span>
        </button>
        <button 
          onClick={onExport}
          className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-green-400 hover:bg-green-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group"
        >
          <Download size={14} className="text-gray-600 group-hover:text-green-600" />
          <span className="font-medium">Export</span>
        </button>
        {onShowResumeSharing && (
          <button 
            onClick={onShowResumeSharing}
            className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group"
          >
            <Share2 size={14} className="text-gray-600 group-hover:text-purple-600" />
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
          >
            {isPreviewMode ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="font-medium">{isPreviewMode ? 'Hide Preview' : 'Preview'}</span>
          </button>
        )}
        <button 
          onClick={handleToggleAIPanel}
          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-xs font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/30 flex items-center gap-1.5 transition-all duration-200"
        >
          <Sparkles size={14} />
          <span className="font-semibold">AI Assistant</span>
        </button>
        <button 
          onClick={onSave}
          className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 group"
        >
          <Save size={14} className="text-gray-600 group-hover:text-blue-600" />
          <span className="font-medium">Save</span>
        </button>
      </div>
    </div>
  );
}
