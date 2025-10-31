'use client';

import React, { useRef } from 'react';
import { X, Upload, FileText, Link, Cloud } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ImportModalProps {
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;
  importMethod: string;
  setImportMethod: (method: string) => void;
  importJsonData: string;
  setImportJsonData: (data: string) => void;
  onImport: () => void;
  onImportFromCloud?: () => void;
  onFileSelected?: (file: File) => void;
}

export default function ImportModal({
  showImportModal,
  setShowImportModal,
  importMethod,
  setImportMethod,
  importJsonData,
  setImportJsonData,
  onImport,
  onImportFromCloud,
  onFileSelected
}: ImportModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showImportModal) return null;

  const importMethods = [
    { value: 'cloud', label: 'From Cloud Storage', icon: Cloud, desc: 'Import resume from cloud storage' },
    { value: 'file', label: 'Upload File', icon: FileText, desc: 'Upload a resume file' },
    { value: 'linkedin', label: 'LinkedIn Profile', icon: Link, desc: 'Import from LinkedIn' }
  ];

  const handleMethodClick = (method: string) => {
    if (method === 'cloud' && onImportFromCloud) {
      onImportFromCloud();
      setShowImportModal(false);
    } else if (method === 'file' && onFileSelected) {
      fileInputRef.current?.click();
    } else {
      setImportMethod(method);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelected) {
      onFileSelected(file);
      setShowImportModal(false);
    }
  };

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
                background: `linear-gradient(to right, ${colors.successGreen}, ${colors.primaryBlue})`,
              }}
            >
              <Upload className="text-white" size={18} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: colors.primaryText }}>Import Resume</h2>
          </div>
          <button
            onClick={() => setShowImportModal(false)}
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
            aria-label="Close import modal"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: colors.secondaryText }}>
              Import Method
            </label>
            <div className="grid grid-cols-1 gap-3">
              {importMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.value}
                    onClick={() => handleMethodClick(method.value)}
                    className="p-4 rounded-xl border-2 transition-all text-left"
                    style={{
                      border: `2px solid ${importMethod === method.value ? colors.primaryBlue : colors.border}`,
                      background: importMethod === method.value ? colors.badgeInfoBg : colors.cardBackground,
                    }}
                    onMouseEnter={(e) => {
                      if (importMethod !== method.value) {
                        e.currentTarget.style.borderColor = colors.borderFocused;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (importMethod !== method.value) {
                        e.currentTarget.style.borderColor = colors.border;
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{
                          background: importMethod === method.value ? colors.primaryBlue : colors.inputBackground,
                        }}
                      >
                        <IconComponent 
                          size={18} 
                          style={{ color: importMethod === method.value ? 'white' : colors.tertiaryText }}
                        />
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: colors.primaryText }}>{method.label}</div>
                        <div className="text-sm" style={{ color: colors.secondaryText }}>{method.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Buttons - Cloud and File are handled automatically, only show buttons for LinkedIn or other non-auto methods */}
          {importMethod === 'linkedin' && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={onImport}
                className="flex-1 text-white py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
                style={{
                  background: `linear-gradient(to right, ${colors.successGreen}, ${colors.primaryBlue})`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 16px ${colors.successGreen}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Upload size={18} />
                Import Resume
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-3 px-6 rounded-xl transition-all font-semibold border"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.secondaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,.txt,.doc,.docx"
        style={{ display: 'none' }}
        title="Select resume file to upload"
        aria-label="File upload input for resume"
      />
    </div>
  );
}