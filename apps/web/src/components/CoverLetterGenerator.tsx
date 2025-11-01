'use client';

import React, { useState, useEffect } from 'react';
import { 
  CoverLetterHeader,
  CoverLetterTabs,
  TemplatesTab,
  AITab,
  CustomTab,
  PreviewTab
} from './coverletter/index';
import { logger } from '../utils/logger';
import { CoverLetterTemplate } from './coverletter/types/coverletter';
import { ResumeFile } from '../types/cloudStorage';
import { Cloud, X, Download, Sparkles } from 'lucide-react';
import ExportModal from './coverletter/ExportModal';
import ImportModal from './coverletter/ImportModal';
import CoverLetterAnalytics from './CoverLetterAnalytics';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/apiService';

export default function CoverLetterGenerator() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'templates' | 'ai' | 'custom' | 'preview'>('templates');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSaveToCloudModal, setShowSaveToCloudModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [cloudFiles, setCloudFiles] = useState<ResumeFile[]>([]);

  // Load recent cover letter from API on mount
  useEffect(() => {
    const loadRecentDraft = async () => {
      try {
        const response = await apiService.getCoverLetters();
        if (response && response.coverLetters && response.coverLetters.length > 0) {
          const latest = response.coverLetters[0]; // Most recent
          setContent(latest.content || '');
          setTitle(latest.title || '');
          setDraftId(latest.id);
          logger.debug('Loaded recent cover letter from API');
        }
      } catch (error) {
        logger.error('Failed to load cover letter:', error);
      }
    };
    loadRecentDraft();
  }, []);

  // Auto-save to API every 30 seconds
  useEffect(() => {
    if (!draftId || !content) return;
    
    const autoSaveTimer = setTimeout(async () => {
      try {
        await apiService.updateCoverLetter(draftId, {
          content,
          title,
          wordCount,
        });
        logger.debug('Auto-saved cover letter to API');
      } catch (error) {
        logger.error('Auto-save failed:', error);
      }
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [content, title, wordCount, draftId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (draftId) {
        // Update existing
        await apiService.updateCoverLetter(draftId, {
          content,
          title,
          wordCount,
        });
        logger.debug('Cover letter updated via API');
      } else {
        // Create new
        const response = await apiService.saveCoverLetter({
          content,
          title,
          wordCount,
        });
        if (response && response.coverLetter) {
          setDraftId(response.coverLetter.id);
          logger.debug('Cover letter created via API');
        }
      }
    } catch (error) {
      logger.error('Error saving cover letter:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = (format: 'pdf' | 'word' | 'print') => {
    logger.debug(`Exporting as ${format}:`, { title, content, wordCount });
    
    if (format === 'print') {
      handlePrint();
      return;
    }
    
    if (format === 'pdf') {
      // Create a styled HTML document for printing to PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${title || 'Cover Letter'}</title>
            <style>
              @media print {
                body {
                  margin: 0;
                  padding: 20px;
                }
              }
              body {
                font-family: 'Georgia', 'Times New Roman', serif;
                font-size: 12pt;
                line-height: 1.6;
                max-width: 210mm;
                margin: 0 auto;
                padding: 25.4mm 31.75mm;
                color: #000;
              }
              h1 {
                font-size: 18pt;
                font-weight: bold;
                margin-bottom: 20px;
              }
              pre {
                white-space: pre-wrap;
                font-family: inherit;
                font-size: inherit;
                line-height: inherit;
              }
            </style>
          </head>
          <body>
            <div style="margin-bottom: 40px;">
              <p style="text-align: right; color: #666; font-size: 10pt;">${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="font-weight: bold;">Hiring Manager</p>
              <p>[Company Name]</p>
              <p>[Company Address]</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p>Dear Hiring Manager,</p>
            </div>
            
            <div style="margin-bottom: 20px; line-height: 1.8;">
              <pre style="font-family: inherit; white-space: pre-wrap; margin: 0;">${content}</pre>
            </div>
            
            <div style="margin-top: 40px;">
              <p>Sincerely,</p>
              <br/>
              <p>[Your Name]</p>
            </div>
          </body>
        </html>
      `;
      
      // Open in new window for printing to PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
      
    } else if (format === 'word') {
      // Create RTF (Rich Text Format) file that Word can open
      const escapeRTF = (text: string) => {
        return text
          .replace(/\\/g, '\\\\')
          .replace(/{/g, '\\{')
          .replace(/}/g, '\\}')
          .replace(/\n/g, '\\par ');
      };
      
      const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${escapeRTF(content)}
}`;
      
      const blob = new Blob([rtfContent], { type: 'application/rtf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'cover-letter'}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    logger.debug('Printing cover letter:', { title, content, wordCount });
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title || 'Cover Letter'}</title>
            <style>
              body {
                font-family: Georgia, serif;
                font-size: 14px;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
              }
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            <pre style="white-space: pre-wrap;">${content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleLoadTemplate = (template: CoverLetterTemplate) => {
    setContent(template.content);
    setTitle(template.name);
    setActiveTab('custom');
    logger.debug('Loaded template:', template);
  };

  // Load cloud files on component mount
  useEffect(() => {
    const loadCloudFiles = () => {
      const cloudStorage = localStorage.getItem('cloudStorage');
      if (cloudStorage) {
        try {
          const storage = JSON.parse(cloudStorage);
          const coverLetters = storage.files?.filter((f: ResumeFile) => f.type === 'cover_letter') || [];
          setCloudFiles(coverLetters);
        } catch (e) {
          logger.debug('Error loading cloud files:', e);
        }
      }
    };
    
    loadCloudFiles();
    // Refresh cloud files when modal is opened
    const interval = setInterval(loadCloudFiles, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleSaveToCloud = () => {
    if (!content || !title) {
      logger.debug('Content and title required');
      return;
    }
    setShowSaveToCloudModal(true);
  };

  const handleConfirmSaveToCloud = (fileName: string, description: string, tags: string[]) => {
    // Load current cloud storage
    const cloudStorage = localStorage.getItem('cloudStorage');
    let storage = cloudStorage ? JSON.parse(cloudStorage) : { files: [] };

    // Create new file
    const newFile: ResumeFile = {
      id: `cover_${Date.now()}`,
      name: fileName,
      type: 'cover_letter',
      size: `${(content.length / 1024).toFixed(2)} KB`,
      lastModified: new Date().toISOString().split('T')[0],
      isPublic: false,
      tags: tags,
      version: 1,
      owner: 'current-user@example.com',
      sharedWith: [],
      comments: [],
      downloadCount: 0,
      viewCount: 0,
      isStarred: false,
      isArchived: false,
      description: description,
      // Store the actual content
      thumbnail: content.substring(0, 100) // First 100 chars as preview
    };

    // Store the full content separately
    localStorage.setItem(`cloudFileContent_${newFile.id}`, JSON.stringify({ content, title, wordCount }));

    // Add to storage
    storage.files.push(newFile);
    localStorage.setItem('cloudStorage', JSON.stringify(storage));
    
    logger.debug('Saved to cloud:', newFile);
    setShowSaveToCloudModal(false);
  };

  const handleLoadFromCloud = (file: ResumeFile) => {
    // Load the file content
    const fileContent = localStorage.getItem(`cloudFileContent_${file.id}`);
    if (fileContent) {
      const { content: savedContent, title: savedTitle } = JSON.parse(fileContent);
      setContent(savedContent);
      setTitle(savedTitle);
      setActiveTab('custom');
      logger.debug('Loaded from cloud:', file);
    }
    setShowImportModal(false);
  };

  const handleFileSelected = (file: File) => {
    logger.debug('File selected:', file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        // Try to parse as JSON first
        const data = JSON.parse(text);
        if (data.content) {
          setContent(data.content);
          setTitle(data.title || file.name);
          setActiveTab('custom');
          logger.debug('Loaded from file:', data);
        }
      } catch (e) {
        // If not JSON, treat as plain text
        setContent(text);
        setTitle(file.name);
        setActiveTab('custom');
        logger.debug('Loaded as plain text');
      }
    };
    reader.readAsText(file);
    setShowImportModal(false);
  };

  const handleTabChange = (tab: 'templates' | 'ai' | 'custom' | 'preview') => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'templates':
        return <TemplatesTab onLoadTemplate={handleLoadTemplate} />;
      case 'ai':
        return <AITab 
          content={content} 
          setContent={setContent}
          title={title}
          setTitle={setTitle}
          setWordCount={setWordCount}
          setActiveTab={setActiveTab}
        />;
      case 'custom':
        return <CustomTab 
          content={content}
          setContent={setContent}
          title={title}
          setTitle={setTitle}
          setWordCount={setWordCount}
        />;
      case 'preview':
        return <PreviewTab 
          content={content}
          title={title}
          wordCount={wordCount}
          onExport={handleExport}
          onPrint={handlePrint}
        />;
      default:
        return <TemplatesTab onLoadTemplate={handleLoadTemplate} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: theme.colors.background }}>
      {/* Header with Title and Subtitle */}
      <div className="flex-shrink-0 px-6 pt-6 pb-3" style={{ background: theme.colors.headerBackground }}>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={24} style={{ color: theme.colors.primaryBlue }} />
            <h1 className="text-3xl font-bold" style={{ color: theme.colors.primaryText }}>
              AI Cover Letter Generator
            </h1>
          </div>
          <p className="text-sm mb-3" style={{ color: theme.colors.secondaryText }}>
            Fill in your details and watch your cover letter generate in real-time
          </p>
        </div>
        {/* Separator Line - Full Width */}
        <div 
          style={{ 
            height: '1px',
            background: theme.colors.border,
            marginLeft: '-1.5rem',
            marginRight: '-1.5rem',
            marginBottom: '1rem'
          }}
        />

        {/* Navigation Tabs */}
        <CoverLetterTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 ${activeTab === 'ai' ? 'overflow-hidden' : 'overflow-y-auto'} scroll-smooth`}>
        <div className={activeTab === 'ai' ? 'h-full' : 'p-6'}>
          {renderTabContent()}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        onExport={handleExport}
        onSaveToCloud={handleSaveToCloud}
      />

      {/* Import Modal */}
      <ImportModal
        showImportModal={showImportModal}
        setShowImportModal={setShowImportModal}
        files={cloudFiles}
        onLoad={handleLoadFromCloud}
        onFileSelected={handleFileSelected}
      />

      {/* Save to Cloud Modal */}
      {showSaveToCloudModal && (
        <SaveToCloudModal
          onClose={() => setShowSaveToCloudModal(false)}
          onConfirm={handleConfirmSaveToCloud}
          defaultTitle={title}
        />
      )}

      {/* Analytics Modal */}
      <CoverLetterAnalytics
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />
    </div>
  );
}

// Save to Cloud Modal Component
function SaveToCloudModal({ 
  onClose, 
  onConfirm,
  defaultTitle 
}: { 
  onClose: () => void; 
  onConfirm: (fileName: string, description: string, tags: string[]) => void;
  defaultTitle: string;
}) {
  const [fileName, setFileName] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Cloud size={24} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Save to Cloud</h3>
              <p className="text-sm text-gray-600">Store your cover letter securely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Cover letter name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your cover letter"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-indigo-600"
                    aria-label={`Remove tag ${tag}`}
                    title={`Remove tag ${tag}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(fileName, description, tags)}
            disabled={!fileName.trim()}
            className={`flex-1 px-4 py-2 text-white rounded-lg ${
              !fileName.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Save to Cloud
          </button>
        </div>
      </div>
    </div>
  );
}

