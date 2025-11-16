'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Download, ExternalLink, AlertTriangle, Loader2, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import { ResumeFile } from '../../../../types/cloudStorage';
import { useTheme } from '../../../../contexts/ThemeContext';
import apiService from '../../../../services/apiService';
import { logger } from '../../../../utils/logger';

interface FilePreviewModalProps {
  isOpen: boolean;
  file: ResumeFile;
  onClose: () => void;
  onDownload: () => void;
}

const isPreviewableImage = (contentType?: string) =>
  Boolean(contentType && contentType.startsWith('image/'));

const isPreviewablePdf = (contentType?: string) =>
  contentType === 'application/pdf';

const isPreviewableText = (contentType?: string) =>
  Boolean(contentType && (
    contentType.startsWith('text/') || 
    contentType === 'application/json' ||
    contentType === 'application/xml' ||
    contentType === 'application/javascript'
  ));

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  file,
  onClose,
  onDownload,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Fetch file content and create blob URL if publicUrl is missing or doesn't work
  useEffect(() => {
    if (!isOpen) {
      // Cleanup blob URL when modal closes
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setTextContent(null);
      setZoom(100);
      setRotation(0);
      setIsFullscreen(false);
      return;
    }

    const fetchFileContent = async () => {
      setIsLoadingBlob(true);
      setLoadError(null);

      try {
        const blob = await apiService.downloadCloudFile(file.id);
        
        if (blob && blob.size > 0) {
          // For text files, read as text
          if (isPreviewableText(file.contentType)) {
            const text = await blob.text();
            setTextContent(text);
          } else {
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
          }
          logger.debug('Created blob URL for preview:', file.id);
        } else {
          throw new Error('Downloaded file is empty');
        }
      } catch (error: any) {
        logger.error('Failed to fetch file for preview:', error);
        setLoadError(error?.message || 'Failed to load file preview');
      } finally {
        setIsLoadingBlob(false);
      }
    };

    fetchFileContent();
  }, [isOpen, file.id, file.contentType]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(prev => Math.min(prev + 10, 200));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom(prev => Math.max(prev - 10, 50));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(100);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setRotation(prev => (prev + 90) % 360);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle fullscreen
  useEffect(() => {
    if (!isFullscreen || !previewRef.current) return;

    const element = previewRef.current;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => {
        logger.error('Failed to enter fullscreen:', err);
        setIsFullscreen(false);
      });
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen]);

  if (!isOpen) return null;

  // Use blobUrl if available, otherwise fall back to publicUrl
  const previewUrl = blobUrl || file.publicUrl;
  const canInlinePreview = Boolean(
    previewUrl && (isPreviewableImage(file.contentType) || isPreviewablePdf(file.contentType)) ||
    textContent !== null
  );

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleToggleFullscreen = () => setIsFullscreen(true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(4, 7, 20, 0.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        ref={previewRef}
        className="w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: colors.badgeInfoBg }}
            >
              <FileText size={20} style={{ color: colors.primaryBlue }} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate" style={{ color: colors.primaryText }}>
                Preview: {file.name}
              </h3>
              <div className="flex items-center gap-2 text-xs" style={{ color: colors.secondaryText }}>
                <span>{file.type}</span>
                <span>•</span>
                <span>{file.size}</span>
                {file.contentType && (
                  <>
                    <span>•</span>
                    <span>{file.contentType}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom and rotation controls for images */}
            {isPreviewableImage(file.contentType) && previewUrl && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: colors.inputBackground }}>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: colors.secondaryText }}
                  title="Zoom out (-)"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs px-2" style={{ color: colors.primaryText }}>
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: colors.secondaryText }}
                  title="Zoom in (+)"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: colors.secondaryText }}
                  title="Reset zoom (0)"
                >
                  <RotateCw size={16} />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: colors.secondaryText }}
                  title="Rotate (R)"
                >
                  <RotateCw size={16} />
                </button>
                <button
                  onClick={handleToggleFullscreen}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: colors.secondaryText }}
                  title="Fullscreen (F11)"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
            )}

            <button
              onClick={onDownload}
              className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
              style={{
                background: colors.primaryBlue,
                color: '#ffffff',
              }}
            >
              <Download size={16} />
              Download
            </button>

            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.secondaryText,
                }}
              >
                <ExternalLink size={16} />
                Open in new tab
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: colors.secondaryText }}
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden bg-black/5 relative">
          {isLoadingBlob ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: colors.primaryBlue }} />
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                Loading preview...
              </p>
            </div>
          ) : loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: colors.badgeErrorBg }}
              >
                <AlertTriangle size={28} style={{ color: colors.errorRed }} />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2" style={{ color: colors.primaryText }}>
                  Failed to load preview
                </h4>
                <p className="text-sm" style={{ color: colors.secondaryText }}>
                  {loadError}
                </p>
              </div>
              <button
                onClick={onDownload}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: colors.primaryBlue, color: '#ffffff' }}
              >
                Download file
              </button>
            </div>
          ) : canInlinePreview ? (
            <div className="w-full h-full overflow-auto" style={{ background: theme.mode === 'dark' ? '#000' : '#f5f5f5' }}>
              {isPreviewableImage(file.contentType) && previewUrl && (
                <div className="flex items-center justify-center h-full p-4">
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt={file.name}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>
              )}
              {isPreviewablePdf(file.contentType) && previewUrl && (
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0&zoom=${zoom}`}
                  title={`Preview ${file.name}`}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
              )}
              {isPreviewableText(file.contentType) && textContent !== null && (
                <div className="p-6 h-full overflow-auto">
                  <pre
                    className="text-sm font-mono whitespace-pre-wrap break-words"
                    style={{
                      color: colors.primaryText,
                      background: 'transparent',
                    }}
                  >
                    {textContent}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: colors.badgeWarningBg }}
              >
                <AlertTriangle size={28} style={{ color: colors.badgeWarningText }} />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2" style={{ color: colors.primaryText }}>
                  Preview not available
                </h4>
                <p className="text-sm" style={{ color: colors.secondaryText }}>
                  This file type cannot be previewed inline. You can download it instead.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onDownload}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: colors.primaryBlue, color: '#ffffff' }}
                >
                  Download file
                </button>
                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                  >
                    Open in new tab
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
