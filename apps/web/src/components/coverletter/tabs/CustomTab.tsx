'use client';

import React, { useState } from 'react';
import { Edit3, Save, FileText, Lightbulb } from 'lucide-react';
import CoverLetterEditor from '../components/CoverLetterEditor';

export default function CustomTab() {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [title, setTitle] = useState('');

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleWordCountChange = (count: number) => {
    setWordCount(count);
  };

  const handleSave = () => {
    console.log('Saving cover letter:', { title, content, wordCount });
    // In real app, this would save to backend
  };

  const writingTips = [
    {
      title: "Start Strong",
      tip: "Begin with a compelling opening that immediately captures the hiring manager's attention."
    },
    {
      title: "Show, Don't Tell",
      tip: "Use specific examples and quantifiable achievements instead of generic statements."
    },
    {
      title: "Match the Job",
      tip: "Tailor your cover letter to the specific job requirements and company culture."
    },
    {
      title: "Keep it Concise",
      tip: "Aim for 250-400 words. Every sentence should add value to your application."
    },
    {
      title: "End with Action",
      tip: "Close with a strong call to action that encourages the hiring manager to contact you."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Edit3 size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Custom Cover Letter</h2>
            <p className="text-sm text-gray-600">Write your cover letter from scratch</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Save size={16} />
          Save Draft
        </button>
      </div>

      {/* Title Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Software Engineer - Tech Corp"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Editor */}
        <div className="lg:col-span-2">
          <CoverLetterEditor
            content={content}
            onContentChange={handleContentChange}
            wordCount={wordCount}
            onWordCountChange={handleWordCountChange}
            placeholder="Start writing your cover letter here...

Dear Hiring Manager,

I am writing to express my strong interest in the [Position Title] position at [Company Name]. With my background in [Your Field] and passion for [Relevant Interest], I am confident that I would be a valuable addition to your team.

[Your Experience and Skills]

[Why You're Interested in This Company/Role]

[Call to Action]

Thank you for your consideration.

Sincerely,
[Your Name]"
          />
        </div>

        {/* Right Column - Writing Tips */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Writing Tips</h3>
          </div>
          
          <div className="space-y-3">
            {writingTips.map((tip, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-900 text-sm mb-1">{tip.title}</h4>
                <p className="text-xs text-yellow-800">{tip.tip}</p>
              </div>
            ))}
          </div>

          {/* Word Count Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-blue-600" />
              <h4 className="font-semibold text-blue-900 text-sm">Word Count</h4>
            </div>
            <p className="text-2xl font-bold text-blue-900 mb-1">{wordCount}</p>
            <p className="text-xs text-blue-700">
              {wordCount < 150 && "Too short - aim for 250-400 words"}
              {wordCount >= 150 && wordCount < 250 && "Getting there - aim for 250-400 words"}
              {wordCount >= 250 && wordCount <= 400 && "Perfect length!"}
              {wordCount > 400 && "Consider shortening - aim for 250-400 words"}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Load Template
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Use AI Generator
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Check Grammar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
