'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import apiService from '@/services/apiService';
import { logger } from '@/utils/logger';

interface ResumeImportProps {
  onResumeImport: (data: any) => void;
}

export default function ResumeImport({ onResumeImport }: ResumeImportProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processResume(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const processResume = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.');
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File too large. Please upload a file smaller than 10MB.');
      }

      // Call API to parse resume
      const response = await apiService.parseResume(file);
      
      if (response && response.success && response.parsedData) {
        logger.debug('Resume parsed successfully:', response.parsedData);
        onResumeImport(response.parsedData);
        // Clear any previous errors on success
        setError(null);
      } else {
        const errorMsg = response?.error || response?.details || 'Failed to parse resume. Please try again.';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      logger.error('Error parsing resume:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to parse resume. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Invalid file type')) {
          errorMessage = 'Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.';
        } else if (error.message.includes('File too large')) {
          errorMessage = 'File too large. Please upload a file smaller than 10MB.';
        } else if (error.message.includes('extract text') || error.message.includes('corrupted') || error.message.includes('image-based') || error.message.includes('scanned')) {
          if (error.message.includes('image-based') || error.message.includes('scanned')) {
            errorMessage = 'PDF appears to be scanned (image-based). Please use a text-based PDF or convert it to text first using OCR.';
          } else {
            errorMessage = 'Could not extract text from file. The file may be corrupted, encrypted, or image-based. Please try a text-based PDF/DOCX file.';
          }
        } else if (error.message.includes('No data could be extracted')) {
          errorMessage = 'No data could be extracted from resume. The format may not be supported.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Cannot connect to server. Please ensure the API server is running.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Import resume file"
        title="Import resume file"
      />
      
      <div className="flex flex-col gap-2">
        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: colors.inputBackground,
            color: colors.primaryText,
            border: `1px solid ${colors.border}`,
          }}
          onMouseEnter={(e) => {
            if (!isUploading) {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
              e.currentTarget.style.borderColor = colors.borderFocused;
            }
          }}
          onMouseLeave={(e) => {
            if (!isUploading) {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }
          }}
        >
          {isUploading ? (
            <>
              <div 
                className="animate-spin rounded-full h-5 w-5 border-b-2"
                style={{ borderColor: colors.primaryBlue, borderTopColor: 'transparent' }}
              ></div>
              <span>Parsing Resume...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>Import Resume</span>
            </>
          )}
        </button>
        {error && (
          <div 
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-md"
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca'
            }}
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </>
  );
}

