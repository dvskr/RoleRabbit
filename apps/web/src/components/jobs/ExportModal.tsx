'use client';

import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportData } from '../../utils/exportHelpers';

interface ExportModalProps {
  onClose: () => void;
  data: any[];
}

export default function ExportModal({ onClose, data }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx'>('csv');

  const handleExport = () => {
    exportData({
      format: selectedFormat,
      data: data,
      filename: 'jobs-export'
    });
    onClose();
  };

  const formatOptions = [
    { 
      value: 'csv' as const, 
      label: 'CSV', 
      description: 'Comma-separated values, great for Excel',
      icon: FileText 
    },
    { 
      value: 'xlsx' as const, 
      label: 'Excel', 
      description: 'Excel workbook format (.xlsx)',
      icon: FileSpreadsheet 
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Export Jobs</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Choose your preferred format to export {data.length} job{data.length !== 1 ? 's' : ''}
          </p>

          {/* Format Options */}
          <div className="space-y-3">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedFormat === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={selectedFormat === option.value}
                    onChange={(e) => setSelectedFormat(e.target.value as 'csv' | 'xlsx' | 'json')}
                    className="mt-1"
                  />
                  <Icon 
                    size={24} 
                    className={selectedFormat === option.value ? 'text-blue-600' : 'text-gray-400'} 
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{option.description}</div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Info Note */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Excel format (XLSX) requires additional setup. 
              Currently falls back to CSV format.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

