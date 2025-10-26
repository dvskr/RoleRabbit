'use client';

import React from 'react';
import { Save, Download, Upload, FileText, TrendingUp } from 'lucide-react';
import { CoverLetterHeaderProps } from './types/coverletter';

export default function CoverLetterHeader({ 
  onSave, 
  onExport, 
  onPrint, 
  wordCount, 
  isSaving,
  onImport,
  onExportClick,
  onAnalytics
}: CoverLetterHeaderProps & {
  onImport?: () => void;
  onExportClick?: () => void;
  onAnalytics?: () => void;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4 flex justify-between items-center shadow-sm relative z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText size={16} />
          <span>{wordCount} words</span>
        </div>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </div>
        )}
      </div>
      <div className="flex gap-3">
        {onImport && (
          <button 
            onClick={onImport}
            className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-2 group"
          >
            <Upload size={16} className="text-gray-600 group-hover:text-purple-600" />
            <span className="font-medium">Import</span>
          </button>
        )}
        <button 
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-green-400 hover:bg-green-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} className="text-gray-600 group-hover:text-green-600" />
          <span className="font-medium">{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
        <button 
          onClick={onExportClick || onExport}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2 group"
        >
          <Download size={16} className="text-white" />
          <span className="font-medium">Export</span>
        </button>
        {onAnalytics && (
          <button 
            onClick={onAnalytics}
            className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-green-400 hover:bg-green-50 hover:shadow-lg transition-all duration-200 shadow-sm flex items-center gap-2 group"
          >
            <TrendingUp size={16} className="text-gray-600 group-hover:text-green-600" />
            <span className="font-medium">Analytics</span>
          </button>
        )}
      </div>
    </div>
  );
}
