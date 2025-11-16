/**
 * Export Options Component
 * Requirements #25-26: PDF export, ZIP export, JSON export
 */

'use client';

import React, { useState } from 'react';
import {
  Download,
  FileText,
  Archive,
  Code,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  File,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

export type ExportFormat = 'pdf' | 'zip' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  // PDF options
  includeImages?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  // ZIP options
  includeAssets?: boolean;
  minifyCode?: boolean;
  // JSON options
  prettify?: boolean;
  includeMetadata?: boolean;
}

export interface ExportHistoryItem {
  id: string;
  format: ExportFormat;
  fileName: string;
  fileSize: number;
  exportedAt: Date;
  downloadUrl: string;
  status: 'completed' | 'failed';
}

interface ExportOptionsProps {
  portfolioId: string;
  portfolioName: string;
  onExport: (options: ExportOptions) => Promise<void>;
  exportHistory?: ExportHistoryItem[];
  onDownload?: (item: ExportHistoryItem) => void;
  onDeleteHistory?: (id: string) => void;
}

/**
 * Export Options Component
 */
export function ExportOptions({
  portfolioId,
  portfolioName,
  onExport,
  exportHistory = [],
  onDownload,
  onDeleteHistory,
}: ExportOptionsProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  // PDF options
  const [includeImages, setIncludeImages] = useState(true);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // ZIP options
  const [includeAssets, setIncludeAssets] = useState(true);
  const [minifyCode, setMinifyCode] = useState(false);

  // JSON options
  const [prettify, setPrettify] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  // Handle export
  const handleExport = async () => {
    const options: ExportOptions = {
      format: selectedFormat,
    };

    if (selectedFormat === 'pdf') {
      options.includeImages = includeImages;
      options.pageSize = pageSize;
      options.orientation = orientation;
    } else if (selectedFormat === 'zip') {
      options.includeAssets = includeAssets;
      options.minifyCode = minifyCode;
    } else if (selectedFormat === 'json') {
      options.prettify = prettify;
      options.includeMetadata = includeMetadata;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onExport(options);
      setExportProgress(100);
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      clearInterval(progressInterval);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Export Portfolio
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Download your portfolio in various formats
        </p>
      </div>

      {/* Format Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* PDF Export */}
        <button
          onClick={() => setSelectedFormat('pdf')}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedFormat === 'pdf'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <FileText
            size={32}
            className={`mb-3 ${
              selectedFormat === 'pdf'
                ? 'text-blue-600'
                : 'text-gray-400 dark:text-gray-600'
            }`}
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            PDF Document
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Printable PDF with customizable layout
          </p>
        </button>

        {/* ZIP Export */}
        <button
          onClick={() => setSelectedFormat('zip')}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedFormat === 'zip'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Archive
            size={32}
            className={`mb-3 ${
              selectedFormat === 'zip'
                ? 'text-blue-600'
                : 'text-gray-400 dark:text-gray-600'
            }`}
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            ZIP Archive
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete website files (HTML/CSS/JS)
          </p>
        </button>

        {/* JSON Export */}
        <button
          onClick={() => setSelectedFormat('json')}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedFormat === 'json'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Code
            size={32}
            className={`mb-3 ${
              selectedFormat === 'json'
                ? 'text-blue-600'
                : 'text-gray-400 dark:text-gray-600'
            }`}
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            JSON Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Raw portfolio data for backup/migration
          </p>
        </button>
      </div>

      {/* Export Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings size={20} />
          Export Options
        </h3>

        {/* PDF Options */}
        {selectedFormat === 'pdf' && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include images
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Embed images in the PDF (increases file size)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter' | 'Legal')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">Letter (8.5 × 11 in)</option>
                <option value="Legal">Legal (8.5 × 14 in)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orientation
              </label>
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="orientation"
                    value="portrait"
                    checked={orientation === 'portrait'}
                    onChange={(e) => setOrientation(e.target.value as 'portrait')}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all text-center">
                    <File size={24} className="mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Portrait
                    </span>
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="orientation"
                    value="landscape"
                    checked={orientation === 'landscape'}
                    onChange={(e) => setOrientation(e.target.value as 'landscape')}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all text-center">
                    <File size={24} className="mx-auto mb-2 text-gray-600 dark:text-gray-400 rotate-90" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Landscape
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ZIP Options */}
        {selectedFormat === 'zip' && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAssets}
                  onChange={(e) => setIncludeAssets(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include assets (images, fonts, etc.)
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Download all images, fonts, and other assets
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={minifyCode}
                  onChange={(e) => setMinifyCode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minify code
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Compress HTML, CSS, and JavaScript for smaller file size
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                The ZIP archive will contain a complete, self-contained website that you can host anywhere.
              </p>
            </div>
          </div>
        )}

        {/* JSON Options */}
        {selectedFormat === 'json' && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prettify}
                  onChange={(e) => setPrettify(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prettify JSON
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Format JSON with indentation for better readability
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include metadata
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Include creation date, last modified, version, etc.
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                The JSON file contains all your portfolio data and can be used for backup or importing into other systems.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="mb-6">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Exporting... {exportProgress}%
            </>
          ) : (
            <>
              <Download size={20} />
              Export as {selectedFormat.toUpperCase()}
            </>
          )}
        </button>

        {/* Progress Bar */}
        {isExporting && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={20} />
              Export History
            </h3>
            {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showHistory && (
            <div className="space-y-3">
              {exportHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Icon */}
                    {item.format === 'pdf' ? (
                      <FileText size={24} className="text-red-600" />
                    ) : item.format === 'zip' ? (
                      <Archive size={24} className="text-purple-600" />
                    ) : (
                      <Code size={24} className="text-blue-600" />
                    )}

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.fileName}
                        </span>
                        {item.status === 'completed' ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <AlertCircle size={16} className="text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>{formatFileSize(item.fileSize)}</span>
                        <span>•</span>
                        <span>{formatDate(item.exportedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {item.status === 'completed' && onDownload && (
                      <button
                        onClick={() => onDownload(item)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    )}
                    {onDeleteHistory && (
                      <button
                        onClick={() => onDeleteHistory(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
