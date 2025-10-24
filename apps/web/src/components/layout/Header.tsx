'use client';

import React from 'react';
import { Download, Undo, Redo, Upload, Save, Sparkles, Menu, FileText } from 'lucide-react';

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
  onTemplateSelect: (template: string) => void;
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
  onTemplateSelect,
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
        <div>
          <h2 className="font-bold text-xl text-gray-800">Resume Editor</h2>
          <p className="text-sm text-gray-500">Build your perfect resume</p>
        </div>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <div className="relative">
          <select
            onChange={(e) => onTemplateSelect(e.target.value)}
            className="px-4 py-2 border bg-white rounded-lg text-sm hover:bg-gray-50 appearance-none pr-8"
          >
            <option value="">Select Template</option>
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="creative">Creative</option>
            <option value="minimal">Minimal</option>
            <option value="professional">Professional</option>
            <option value="executive">Executive</option>
          </select>
          <FileText size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button 
          onClick={onExport}
          className="px-4 py-2 border bg-white rounded-lg text-sm hover:bg-gray-50"
        >
          <Download size={16} className="inline mr-1" />Export
        </button>
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className="px-4 py-2 border bg-white rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <Undo size={16} className="inline mr-1" />Undo
        </button>
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          className="px-4 py-2 border bg-white rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <Redo size={16} className="inline mr-1" />Redo
        </button>
        <button 
          onClick={onImport}
          className="px-5 py-2.5 border-2 border-gray-200 bg-white rounded-xl text-sm font-semibold hover:border-green-500 hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <Upload size={18} />
          Import
        </button>
        <button 
          onClick={handleToggleAIPanel}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 flex items-center gap-2"
        >
          <Sparkles size={18} />
          AI Assistant
        </button>
        <button 
          onClick={onSave}
          className="px-5 py-2.5 border-2 border-gray-200 bg-white rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 hover:border-blue-500 hover:shadow-md hover:scale-105"
        >
          <Save size={18} />
          Save
        </button>
      </div>
    </div>
  );
}
