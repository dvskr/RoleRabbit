'use client';

import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportData } from '../../utils/exportHelpers';
import { useTheme } from '../../contexts/ThemeContext';

interface ExportModalProps {
  onClose: () => void;
  data: any[];
}

export default function ExportModal({ onClose, data }: ExportModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
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
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div 
        className="rounded-lg w-full max-w-md pointer-events-auto shadow-2xl"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <h2 
            className="text-lg font-semibold"
            style={{ color: colors.primaryText }}
          >
            Export Jobs
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded transition-all"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p 
            className="text-sm mb-4"
            style={{ color: colors.secondaryText }}
          >
            Choose your preferred format to export {data.length} job{data.length !== 1 ? 's' : ''}
          </p>

          {/* Format Options */}
          <div className="space-y-3">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedFormat === option.value;
              return (
                <label
                  key={option.value}
                  className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all"
                  style={{
                    background: isSelected ? colors.badgeInfoBg : 'transparent',
                    border: `2px solid ${isSelected ? colors.badgeInfoBorder : colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = colors.hoverBackground;
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = colors.border;
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) => setSelectedFormat(e.target.value as 'csv' | 'xlsx')}
                    className="mt-1"
                    style={{ accentColor: colors.primaryBlue }}
                  />
                  <Icon 
                    size={24}
                    style={{ color: isSelected ? colors.badgeInfoText : colors.tertiaryText }}
                  />
                  <div className="flex-1">
                    <div 
                      className="font-medium"
                      style={{ color: colors.primaryText }}
                    >
                      {option.label}
                    </div>
                    <div 
                      className="text-sm mt-0.5"
                      style={{ color: colors.secondaryText }}
                    >
                      {option.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Info Note */}
          <div 
            className="mt-4 p-3 rounded-lg"
            style={{
              background: colors.badgeInfoBg,
              border: `1px solid ${colors.badgeInfoBorder}`,
            }}
          >
            <p 
              className="text-sm"
              style={{ color: colors.badgeInfoText }}
            >
              <strong>Note:</strong> Excel format (XLSX) requires additional setup. 
              Currently falls back to CSV format.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex gap-3 p-4"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg transition-all font-medium"
            style={{
              background: colors.inputBackground,
              color: colors.secondaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 rounded-lg transition-all font-medium flex items-center justify-center gap-2"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primaryBlueHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primaryBlue;
            }}
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

