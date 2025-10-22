'use client';

import React, { useState } from 'react';
import { X, Download, FileText, Eye, Share2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string, options?: any) => void;
}

const exportFormats = [
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Professional PDF format',
    icon: FileText,
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'docx',
    name: 'Word Document',
    description: 'Editable Word format',
    icon: FileText,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'html',
    name: 'HTML',
    description: 'Web-friendly format',
    icon: Eye,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Data format for backup',
    icon: Share2,
    color: 'from-purple-500 to-purple-600'
  }
];

export default function ExportModal({
  isOpen,
  onClose,
  onExport
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [includePreview, setIncludePreview] = useState(true);
  const [fileName, setFileName] = useState('');

  const handleExport = () => {
    onExport(selectedFormat, {
      fileName: fileName || undefined,
      includePreview
    });
    onClose();
  };

  const handleClose = () => {
    setSelectedFormat('pdf');
    setIncludePreview(true);
    setFileName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Export Resume
          </h3>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedFormat === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${format.color} flex items-center justify-center`}>
                      <format.icon size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{format.name}</div>
                      <div className="text-xs text-gray-600">{format.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">File Name (Optional)</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Leave empty for auto-generated name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Export Options</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includePreview}
                  onChange={(e) => setIncludePreview(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include preview thumbnail</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
