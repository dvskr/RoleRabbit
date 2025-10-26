'use client';

import React from 'react';
import { Download, Printer, FileText, Eye } from 'lucide-react';
import { PreviewPanelProps } from '../types/coverletter';

export default function PreviewPanel({
  content,
  title,
  onExport,
  onPrint,
  wordCount
}: PreviewPanelProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Eye size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Preview & Export</h2>
            <p className="text-sm text-gray-600">Review your cover letter before exporting</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText size={16} />
            <span>{wordCount} words</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Export Options</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onExport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export PDF
          </button>
          <button
            onClick={() => onExport('word')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export Word
          </button>
          <button
            onClick={onPrint}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{title || 'Cover Letter'}</h3>
        </div>
        <div className="p-6">
          <div className="prose prose-sm max-w-none">
            <div 
              className="whitespace-pre-wrap text-gray-900 leading-relaxed"
              style={{ 
                fontFamily: 'Georgia, serif',
                lineHeight: '1.6',
                fontSize: '14px'
              }}
            >
              {content || 'No content to preview. Please write or generate a cover letter first.'}
            </div>
          </div>
        </div>
      </div>

      {/* Formatting Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Formatting Tips</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Keep your cover letter to 1 page (250-400 words)</li>
          <li>• Use a professional font like Arial or Times New Roman</li>
          <li>• Include your contact information at the top</li>
          <li>• Address the hiring manager by name if possible</li>
          <li>• Highlight relevant skills and achievements</li>
          <li>• End with a strong call to action</li>
        </ul>
      </div>
    </div>
  );
}
