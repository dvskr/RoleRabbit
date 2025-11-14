/**
 * ExportModal Component
 * Modal for exporting templates with format and options selection
 */

import React, { useState, useEffect } from 'react';
import { X, Download, FileText, File, Code, Globe, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { useTemplateExport, type ExportFormat, type ExportOptions } from '../../hooks/useTemplateExport';

interface ExportModalProps {
  isOpen: boolean;
  templateId: string;
  templateName: string;
  onClose: () => void;
  className?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  templateId,
  templateName,
  onClose,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('PDF');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeComments, setIncludeComments] = useState(false);
  const [includeVersionHistory, setIncludeVersionHistory] = useState(false);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const { loading, error, exportTemplate, downloadExport, previewExport } = useTemplateExport();

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setExportSuccess(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  // Format options
  const formatOptions = [
    { value: 'PDF', label: 'PDF Document', icon: FileText, description: 'Best for sharing and printing' },
    { value: 'DOCX', label: 'Word Document', icon: File, description: 'Editable in Microsoft Word' },
    { value: 'LATEX', label: 'LaTeX', icon: Code, description: 'For academic publishing' },
    { value: 'JSON', label: 'JSON Data', icon: Code, description: 'Structured data format' },
    { value: 'HTML', label: 'HTML', icon: Globe, description: 'Web-ready format' },
  ] as const;

  // Get export options
  const getExportOptions = (): ExportOptions => {
    return {
      format,
      includeMetadata,
      includeComments,
      includeVersionHistory,
      quality,
      pageSize,
      orientation,
    };
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    const options = getExportOptions();

    const result = await exportTemplate(templateId, options);

    if (result.success && result.data) {
      // Download the file
      const fileName = `${templateName}.${format.toLowerCase()}`;
      await downloadExport(result.data.id, fileName);
      setExportSuccess(true);

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    }

    setIsExporting(false);
  };

  // Handle preview
  const handlePreview = async () => {
    if (format !== 'PDF' && format !== 'HTML') {
      alert('Preview is only available for PDF and HTML formats');
      return;
    }

    const options = getExportOptions();
    const result = await previewExport(templateId, options);

    if (result.success && result.url) {
      // Open preview in new window
      window.open(result.url, '_blank');
    }
  };

  if (!shouldRender) return null;

  const selectedFormat = formatOptions.find((opt) => opt.value === format);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black bg-opacity-50 backdrop-blur-sm' : 'bg-black bg-opacity-0'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div
        className={`bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Download className="text-blue-600" size={24} />
            <div>
              <h2 id="export-modal-title" className="text-xl font-bold text-gray-900">
                Export Template
              </h2>
              <p className="text-sm text-gray-600 mt-1">"{templateName}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {exportSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 text-sm text-green-700">
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
              Export completed successfully! Download started.
            </div>
          )}

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = format === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setFormat(option.value as ExportFormat)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        size={20}
                        className={isSelected ? 'text-blue-600' : 'text-gray-400'}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle size={18} className="text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Options
            </label>
            <div className="space-y-3">
              {/* Include Metadata */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include template metadata</span>
              </label>

              {/* Include Comments */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeComments}
                  onChange={(e) => setIncludeComments(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include comments and reviews</span>
              </label>

              {/* Include Version History */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVersionHistory}
                  onChange={(e) => setIncludeVersionHistory(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include version history</span>
              </label>
            </div>
          </div>

          {/* PDF/DOCX Specific Options */}
          {(format === 'PDF' || format === 'DOCX') && (
            <div className="space-y-4">
              {/* Quality */}
              <div>
                <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-2">
                  Quality
                </label>
                <select
                  id="quality"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low (Smaller file size)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Best quality)</option>
                </select>
              </div>

              {/* Page Size */}
              <div>
                <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700 mb-2">
                  Page Size
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter' | 'Legal')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="Legal">Legal (8.5 × 14 in)</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientation
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="radio"
                      checked={orientation === 'portrait'}
                      onChange={() => setOrientation('portrait')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Portrait</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="radio"
                      checked={orientation === 'landscape'}
                      onChange={() => setOrientation('landscape')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Landscape</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {/* Preview Button (PDF/HTML only) */}
            {(format === 'PDF' || format === 'HTML') && (
              <button
                onClick={handlePreview}
                disabled={loading}
                className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Eye size={18} />
                Preview
              </button>
            )}

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export {selectedFormat?.label}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
