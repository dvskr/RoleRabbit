'use client';

import React from 'react';
import { X, FileText, Download, Clock, User, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatRelativeTime, formatFileSize } from '../../utils/formatters';

interface FileVersion {
  id: string;
  version: number;
  fileName: string;
  size: number;
  modifiedAt: string;
  modifiedBy: string;
  modifiedByEmail?: string;
  isCurrent: boolean;
  downloadUrl?: string;
}

interface FileVersionHistoryModalProps {
  isOpen: boolean;
  fileId: string;
  fileName: string;
  versions: FileVersion[];
  onClose: () => void;
  onRestoreVersion?: (versionId: string) => void;
  onDownloadVersion?: (versionId: string) => void;
}

export const FileVersionHistoryModal: React.FC<FileVersionHistoryModalProps> = ({
  isOpen,
  fileName,
  versions,
  onClose,
  onRestoreVersion,
  onDownloadVersion,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
        style={{
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: colors.badgeInfoBg }}
            >
              <FileText size={20} style={{ color: colors.primaryBlue }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
                Version History
              </h2>
              <p className="text-xs mt-0.5" style={{ color: colors.secondaryText }}>
                {fileName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryText;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close version history modal"
          >
            <X size={20} />
          </button>
        </div>

        {versions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: colors.secondaryText }}>
              No version history available. (Requires backend support for versioning)
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className="p-4 rounded-lg border"
                style={{
                  background: version.isCurrent ? colors.badgeInfoBg : colors.inputBackground,
                  borderColor: version.isCurrent ? colors.primaryBlue : colors.border,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium" style={{ color: colors.primaryText }}>
                        Version {version.version}
                      </span>
                      {version.isCurrent && (
                        <span
                          className="px-2 py-0.5 rounded text-xs flex items-center gap-1"
                          style={{
                            background: colors.primaryBlue,
                            color: 'white',
                          }}
                        >
                          <CheckCircle size={12} />
                          Current
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs" style={{ color: colors.secondaryText }}>
                      <div className="flex items-center gap-2">
                        <Clock size={12} />
                        <span>{formatRelativeTime(version.modifiedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={12} />
                        <span>{version.modifiedBy}</span>
                        {version.modifiedByEmail && (
                          <span className="text-xs" style={{ color: colors.tertiaryText }}>
                            ({version.modifiedByEmail})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText size={12} />
                        <span>{formatFileSize(version.size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onDownloadVersion && (
                      <button
                        onClick={() => onDownloadVersion(version.id)}
                        className="p-2 rounded transition-colors"
                        style={{
                          background: colors.inputBackground,
                          color: colors.secondaryText,
                          border: `1px solid ${colors.border}`,
                        }}
                        title="Download this version"
                      >
                        <Download size={16} />
                      </button>
                    )}
                    {onRestoreVersion && !version.isCurrent && (
                      <button
                        onClick={() => onRestoreVersion(version.id)}
                        className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                        style={{
                          background: colors.primaryBlue,
                          color: 'white',
                        }}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

