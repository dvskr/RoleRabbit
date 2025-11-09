'use client';

import React from 'react';
import { X, Download, FileText, Printer, Cloud } from 'lucide-react';
import { ResumeData, CustomSection } from '../../types/resume';
import { useTheme } from '../../contexts/ThemeContext';

interface ExportModalProps {
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  resumeData: ResumeData;
  customSections: CustomSection[];
  resumeFileName: string;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  sectionSpacing: string;
  margins: string;
  headingStyle: string;
  bulletStyle: string;
  onExport: (format: string) => void;
  onSaveToCloud?: () => void;
}

export default function ExportModal({
  showExportModal,
  setShowExportModal,
  resumeData: _resumeData,
  customSections: _customSections,
  resumeFileName: _resumeFileName,
  fontFamily: _fontFamily,
  fontSize: _fontSize,
  lineSpacing: _lineSpacing,
  sectionSpacing: _sectionSpacing,
  margins: _margins,
  headingStyle: _headingStyle,
  bulletStyle: _bulletStyle,
  onExport,
  onSaveToCloud
}: ExportModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  if (!showExportModal) return null;

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="absolute top-20 right-4 border rounded-2xl p-6 w-full max-w-md shadow-2xl transition-all pointer-events-auto"
        style={{ 
          position: 'absolute', 
          top: '5rem', 
          right: '1rem',
          maxHeight: '80vh',
          overflow: 'auto',
          background: theme.mode === 'light' ? '#ffffff' : colors.badgePurpleBg,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl"
              style={{
                background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
              }}
            >
              <Download className="text-white" size={18} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: colors.primaryText }}>Export Resume</h2>
          </div>
          <button
            onClick={() => setShowExportModal(false)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Close modal"
            aria-label="Close export modal"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onExport('pdf')}
            className="group p-4 rounded-xl border-2 transition-all"
            style={{
              border: `2px solid ${colors.border}`,
              background: colors.cardBackground,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.errorRed;
              e.currentTarget.style.background = colors.badgeErrorBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.background = colors.cardBackground;
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg transition-colors"
                style={{ background: colors.errorRed }}
              >
                <FileText className="text-white" size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold transition-colors" style={{ color: colors.primaryText }}>Export as PDF</h3>
                <p className="text-sm" style={{ color: colors.secondaryText }}>Professional document format</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => onExport('word')}
            className="group p-4 rounded-xl border-2 transition-all"
            style={{
              border: `2px solid ${colors.border}`,
              background: colors.cardBackground,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primaryBlue;
              e.currentTarget.style.background = colors.badgeInfoBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.background = colors.cardBackground;
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg transition-colors"
                style={{ background: colors.primaryBlue }}
              >
                <FileText className="text-white" size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold transition-colors" style={{ color: colors.primaryText }}>Export as Word</h3>
                <p className="text-sm" style={{ color: colors.secondaryText }}>Editable Microsoft Word document</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => onExport('print')}
            className="group p-4 rounded-xl border-2 transition-all"
            style={{
              border: `2px solid ${colors.border}`,
              background: colors.cardBackground,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.borderFocused;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.background = colors.cardBackground;
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg transition-colors"
                style={{ background: colors.tertiaryText }}
              >
                <Printer className="text-white" size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold transition-colors" style={{ color: colors.primaryText }}>Print Resume</h3>
                <p className="text-sm" style={{ color: colors.secondaryText }}>Send directly to printer</p>
              </div>
            </div>
          </button>

          {onSaveToCloud && (
            <button
              onClick={() => {
                onSaveToCloud();
                setShowExportModal(false);
              }}
              className="group p-4 rounded-xl border-2 transition-all"
              style={{
                border: `2px solid ${colors.border}`,
                background: colors.cardBackground,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.badgePurpleBorder;
                e.currentTarget.style.background = colors.badgePurpleBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.background = colors.cardBackground;
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: colors.badgePurpleText }}
                >
                  <Cloud className="text-white" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold transition-colors" style={{ color: colors.primaryText }}>Save to Cloud</h3>
                  <p className="text-sm" style={{ color: colors.secondaryText }}>Store resume in cloud storage</p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
