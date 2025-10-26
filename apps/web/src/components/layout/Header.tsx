'use client';

import React from 'react';
import { Download, Undo, Redo, Upload, Save, Sparkles, Menu } from 'lucide-react';

interface HeaderProps {
  isMobile: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showRightPanel: boolean;
  previousSidebarState: boolean;
  sidebarCollapsed: boolean;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onImport: () => void;
  onSave: () => void;
  onToggleAIPanel: () => void;
  onShowMobileMenu: () => void;
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
  onExport,
  onUndo,
  onRedo,
  onImport,
  onSave,
  onToggleAIPanel,
  onShowMobileMenu,
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
    <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4 flex justify-between items-center shadow-sm relative z-50">
      <div className="flex items-center gap-4">
        {isMobile && (
          <button 
            onClick={onShowMobileMenu}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
        )}
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Undo size={16} className="text-gray-600 group-hover:text-orange-600" />
          <span className="font-medium">Undo</span>
        </button>
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Redo size={16} className="text-gray-600 group-hover:text-orange-600" />
          <span className="font-medium">Redo</span>
        </button>
        <button 
          onClick={onImport}
          className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-2 group"
        >
          <Upload size={16} className="text-gray-600 group-hover:text-purple-600" />
          <span className="font-medium">Import</span>
        </button>
        <button 
          onClick={onExport}
          className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-green-400 hover:bg-green-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-2 group"
        >
          <Download size={16} className="text-gray-600 group-hover:text-green-600" />
          <span className="font-medium">Export</span>
        </button>
        <button 
          onClick={handleToggleAIPanel}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/30 flex items-center gap-2 transition-all duration-200"
        >
          <Sparkles size={16} />
          <span className="font-semibold">AI Assistant</span>
        </button>
        <button 
          onClick={onSave}
          className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-2 group"
        >
          <Save size={16} className="text-gray-600 group-hover:text-blue-600" />
          <span className="font-medium">Save</span>
        </button>
      </div>
    </div>
  );
}
