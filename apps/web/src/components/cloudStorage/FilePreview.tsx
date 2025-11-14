/**
 * File Preview Component
 * Supports previewing PDFs, images, videos, and text files
 */

import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreviewModal({ file, isOpen, onClose }: FilePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  if (!isOpen || !file) return null;

  const fileType = getFileType(file.type, file.name);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="bg-black/50 backdrop-blur-sm p-4 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-medium truncate max-w-[70%]">
          {file.name}
        </h3>

        <div className="flex items-center gap-2">
          {fileType === 'image' && (
            <>
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="p-2 text-white hover:bg-white/20 rounded-full"
                title="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white text-sm">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="p-2 text-white hover:bg-white/20 rounded-full"
                title="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/30 mx-2" />
            </>
          )}

          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-white/20 rounded-full"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview content */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p>Loading preview...</p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="text-red-400 text-lg mb-4">{error}</div>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
            >
              Download to view
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {fileType === 'image' && (
              <img
                src={file.url}
                alt={file.name}
                style={{ maxWidth: `${zoom}%`, maxHeight: `${zoom}%` }}
                className="object-contain"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError('Failed to load image');
                }}
              />
            )}

            {fileType === 'pdf' && (
              <iframe
                src={file.url}
                className="w-full h-full bg-white"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError('Failed to load PDF');
                }}
              />
            )}

            {fileType === 'video' && (
              <video
                controls
                className="max-w-full max-h-full"
                onLoadedData={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError('Failed to load video');
                }}
              >
                <source src={file.url} type={file.type} />
                Your browser does not support video playback.
              </video>
            )}

            {fileType === 'audio' && (
              <div className="text-center">
                <div className="text-white text-6xl mb-8">🎵</div>
                <audio
                  controls
                  className="w-full max-w-md"
                  onLoadedData={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError('Failed to load audio');
                  }}
                >
                  <source src={file.url} type={file.type} />
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}

            {fileType === 'text' && (
              <TextPreview
                url={file.url}
                onLoad={() => setLoading(false)}
                onError={(err) => {
                  setLoading(false);
                  setError(err);
                }}
              />
            )}

            {fileType === 'unsupported' && (
              <div className="text-center">
                <div className="text-white text-lg mb-4">
                  Preview not available for this file type
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
                >
                  Download to view
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with file info */}
      <div
        className="bg-black/50 backdrop-blur-sm p-4 text-center text-white text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {formatFileSize(file.size)} • {file.type}
      </div>
    </div>
  );
}

function TextPreview({ url, onLoad, onError }: any) {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(url)
      .then(res => res.text())
      .then(text => {
        setContent(text);
        onLoad();
      })
      .catch(err => {
        onError('Failed to load file content');
      });
  }, [url]);

  return (
    <div className="bg-white w-full max-w-4xl max-h-full overflow-auto p-8 rounded-lg">
      <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
    </div>
  );
}

function getFileType(mimeType: string, filename: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/') || filename.match(/\.(txt|md|json|csv|log)$/i)) {
    return 'text';
  }
  return 'unsupported';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}
