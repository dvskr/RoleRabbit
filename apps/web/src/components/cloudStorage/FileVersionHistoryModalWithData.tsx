'use client';

import React, { useState, useEffect } from 'react';
import { FileVersionHistoryModal } from './FileVersionHistoryModal';
import apiService from '../../services/apiService';
import { logger } from '../../utils/logger';

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

interface FileVersionHistoryModalWithDataProps {
  isOpen: boolean;
  fileId: string;
  fileName: string;
  onClose: () => void;
  onRestoreVersion?: (versionId: string) => void;
  onDownloadVersion?: (versionId: string) => void;
}

export const FileVersionHistoryModalWithData: React.FC<FileVersionHistoryModalWithDataProps> = ({
  isOpen,
  fileId,
  fileName,
  onClose,
  onRestoreVersion,
  onDownloadVersion,
}) => {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && fileId) {
      loadVersions();
    }
  }, [isOpen, fileId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getFileVersions(fileId);
      
      if (response.success && response.versions) {
        const formattedVersions: FileVersion[] = response.versions.map((v: any) => ({
          id: v.id || fileId,
          version: v.version || 1,
          fileName: v.fileName || fileName,
          size: v.size || 0,
          modifiedAt: v.updatedAt || v.createdAt || new Date().toISOString(),
          modifiedBy: v.modifiedBy || 'Unknown',
          modifiedByEmail: v.modifiedByEmail,
          isCurrent: v.isCurrent || false,
          downloadUrl: v.downloadUrl
        }));
        setVersions(formattedVersions);
      } else {
        setError('Failed to load versions');
        setVersions([]);
      }
    } catch (err: any) {
      logger.error('Failed to load file versions:', err);
      setError(err.message || 'Failed to load versions');
      setVersions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FileVersionHistoryModal
      isOpen={isOpen}
      fileId={fileId}
      fileName={fileName}
      versions={versions}
      onClose={onClose}
      onRestoreVersion={onRestoreVersion}
      onDownloadVersion={onDownloadVersion}
    />
  );
};

