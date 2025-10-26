'use client';

import React, { useState } from 'react';
import { Eye, Download, Printer, FileText, CheckCircle, Mail, Paperclip, X } from 'lucide-react';
import PreviewPanel from '../components/PreviewPanel';
import { logger } from '../../../utils/logger';

interface PreviewTabProps {
  content?: string;
  title?: string;
  wordCount?: number;
  onExport?: (format: 'pdf' | 'word') => void;
  onPrint?: () => void;
}

export default function PreviewTab({ content = '', title = '', wordCount = 0, onExport, onPrint }: PreviewTabProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [internalContent] = useState(`Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at Tech Corp. With my background in full-stack development and passion for creating innovative solutions, I am confident that I would be a valuable addition to your team.

Over the past 3 years, I have developed expertise in JavaScript, React, Node.js, and cloud technologies. I have successfully led the development of several web applications that improved user engagement by 40% and reduced load times by 60%. My experience with agile methodologies and cross-functional collaboration has prepared me well for this role.

I am particularly drawn to Tech Corp's mission of democratizing technology and your commitment to innovation. I would be excited to contribute to your team's efforts in building scalable solutions that impact millions of users.

I am confident that my technical skills, problem-solving abilities, and passion for technology make me an ideal candidate for this position. I would welcome the opportunity to discuss my qualifications further.

Thank you for your consideration.

Sincerely,
[Your Name]`);

  const displayContent = content || internalContent;
  const displayTitle = title || 'Software Engineer - Tech Corp';

  const handleExportClick = (format: 'pdf' | 'word') => {
    if (onExport) {
      onExport(format);
    } else {
      logger.debug(`Exporting as ${format}:`, { title: displayTitle, content: displayContent, wordCount });
    }
  };

  const handlePrintClick = () => {
    if (onPrint) {
      onPrint();
    } else {
      logger.debug('Printing cover letter:', { title: displayTitle, content: displayContent, wordCount });
    }
  };

  const handleSendEmail = () => {
    setEmailData({
      to: '',
      subject: `Application for ${displayTitle}`,
      body: displayContent
    });
    setShowEmailModal(true);
  };

  const handleSubmitEmail = () => {
    if (!emailData.to || !emailData.subject) {
      logger.debug('Email to and subject are required');
      return;
    }
    
    // Create mailto link
    const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.location.href = mailtoLink;
    
    logger.debug('Email sent:', emailData);
    setShowEmailModal(false);
  };

  const handleAttachToApplication = () => {
    // In a real app, this would integrate with a job application system
    logger.debug('Attaching cover letter to application:', { 
      title: displayTitle, 
      content: displayContent, 
      wordCount 
    });
    
    // Show success message or redirect
    alert('Cover letter is ready to be attached to your job application!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Eye size={24} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Preview & Export</h2>
            <p className="text-sm text-gray-600">Review your cover letter before sending</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText size={16} />
            <span>{wordCount} words</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle size={16} />
            <span>Ready to send</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Export Options</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportClick('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export PDF
          </button>
          <button
            onClick={() => handleExportClick('word')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export Word
          </button>
          <button
            onClick={handlePrintClick}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{displayTitle}</h3>
        </div>
        <div className="p-6">
          <div className="prose prose-sm max-w-none">
            <div 
              className="whitespace-pre-wrap text-gray-900 leading-relaxed"
              style={{ 
                fontFamily: 'Georgia, serif',
                lineHeight: '1.6',
                fontSize: '14px'
              }}
            >
              {displayContent}
            </div>
          </div>
        </div>
      </div>

      {/* Formatting Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Final Checklist</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>✓ Keep your cover letter to 1 page (250-400 words)</li>
          <li>✓ Use a professional font like Arial or Times New Roman</li>
          <li>✓ Include your contact information at the top</li>
          <li>✓ Address the hiring manager by name if possible</li>
          <li>✓ Highlight relevant skills and achievements</li>
          <li>✓ End with a strong call to action</li>
          <li>✓ Proofread for grammar and spelling errors</li>
        </ul>
      </div>

      {/* Additional Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Email Integration</h4>
          <p className="text-sm text-blue-800 mb-3">Send your cover letter directly via email</p>
          <button 
            onClick={handleSendEmail}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
          >
            <Mail size={16} />
            Send via Email
          </button>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Job Application</h4>
          <p className="text-sm text-green-800 mb-3">Attach to a job application</p>
          <button 
            onClick={handleAttachToApplication}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
          >
            <Paperclip size={16} />
            Attach to Application
          </button>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Send via Email</h3>
                  <p className="text-sm text-gray-600">Compose your email</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  value={emailData.body}
                  onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will open your default email client with the compose window pre-filled.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEmail}
                disabled={!emailData.to || !emailData.subject}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  !emailData.to || !emailData.subject
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Mail size={16} />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
