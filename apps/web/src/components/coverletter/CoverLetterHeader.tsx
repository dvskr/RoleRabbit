'use client';

import React from 'react';
import { Save, Download, Printer, FileText } from 'lucide-react';
import { CoverLetterHeaderProps } from '../types/coverletter';

export default function CoverLetterHeader({ 
  onSave, 
  onExport, 
  onPrint, 
  wordCount, 
  isSaving 
}: CoverLetterHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">Create professional cover letters with AI assistance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText size={16} />
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <Save size={14} className="inline mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onExport}
              className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
            >
              <Download size={14} className="inline mr-1" />
              Export
            </button>
            <button
              onClick={onPrint}
              className="px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm"
            >
              <Printer size={14} className="inline mr-1" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
