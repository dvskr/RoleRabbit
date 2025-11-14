/**
 * ExportDropdown Component
 * Dropdown button for quick export actions
 */

import React, { useState } from 'react';
import { Download, FileText, File, Code, Globe } from 'lucide-react';
import { ExportModal } from './ExportModal';
import type { ExportFormat } from '../../hooks/useTemplateExport';

interface ExportDropdownProps {
  templateId: string;
  templateName: string;
  onExport?: (format: ExportFormat) => void;
  className?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  templateId,
  templateName,
  onExport,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);

  const exportOptions = [
    { format: 'PDF' as ExportFormat, label: 'Export as PDF', icon: FileText },
    { format: 'DOCX' as ExportFormat, label: 'Export as Word', icon: File },
    { format: 'LATEX' as ExportFormat, label: 'Export as LaTeX', icon: Code },
    { format: 'JSON' as ExportFormat, label: 'Export as JSON', icon: Code },
    { format: 'HTML' as ExportFormat, label: 'Export as HTML', icon: Globe },
  ];

  const handleOptionClick = (format: ExportFormat) => {
    setSelectedFormat(format);
    setIsOpen(false);
    setIsModalOpen(true);
    onExport?.(format);
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Download size={18} />
          Export
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.format}
                    onClick={() => handleOptionClick(option.format)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Icon size={16} className="text-gray-500" />
                    {option.label}
                  </button>
                );
              })}

              <div className="border-t border-gray-200 my-1" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 font-medium"
              >
                More Options...
              </button>
            </div>
          </>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isModalOpen}
        templateId={templateId}
        templateName={templateName}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFormat(null);
        }}
      />
    </>
  );
};

export default ExportDropdown;
