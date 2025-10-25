'use client';

import React, { useState } from 'react';
import { Eye, Download, Printer, FileText, CheckCircle } from 'lucide-react';
import PreviewPanel from '../components/PreviewPanel';

export default function PreviewTab() {
  const [content, setContent] = useState(`Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at Tech Corp. With my background in full-stack development and passion for creating innovative solutions, I am confident that I would be a valuable addition to your team.

Over the past 3 years, I have developed expertise in JavaScript, React, Node.js, and cloud technologies. I have successfully led the development of several web applications that improved user engagement by 40% and reduced load times by 60%. My experience with agile methodologies and cross-functional collaboration has prepared me well for this role.

I am particularly drawn to Tech Corp's mission of democratizing technology and your commitment to innovation. I would be excited to contribute to your team's efforts in building scalable solutions that impact millions of users.

I am confident that my technical skills, problem-solving abilities, and passion for technology make me an ideal candidate for this position. I would welcome the opportunity to discuss my qualifications further.

Thank you for your consideration.

Sincerely,
[Your Name]`);

  const [title, setTitle] = useState('Software Engineer - Tech Corp');
  const [wordCount, setWordCount] = useState(156);

  const handleExport = (format: 'pdf' | 'word') => {
    console.log(`Exporting as ${format}:`, { title, content, wordCount });
    // In real app, this would trigger the export process
  };

  const handlePrint = () => {
    console.log('Printing cover letter:', { title, content, wordCount });
    // In real app, this would open print dialog
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
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export PDF
          </button>
          <button
            onClick={() => handleExport('word')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export Word
          </button>
          <button
            onClick={handlePrint}
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
          <h3 className="font-semibold text-gray-900">{title}</h3>
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
              {content}
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
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Send via Email
          </button>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Job Application</h4>
          <p className="text-sm text-green-800 mb-3">Attach to a job application</p>
          <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
            Attach to Application
          </button>
        </div>
      </div>
    </div>
  );
}
