'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Edit3, Save, FileText, Lightbulb } from 'lucide-react';
import CoverLetterEditor from '../components/CoverLetterEditor';
import { logger } from '../../../utils/logger';
import { useTheme } from '../../../contexts/ThemeContext';

interface CustomTabProps {
  content: string;
  setContent: (content: string) => void;
  title: string;
  setTitle: (title: string) => void;
  setWordCount: (count: number) => void;
}

export default function CustomTab({ content, setContent, title, setTitle, setWordCount }: CustomTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Calculate word count from content
  const wordCount = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    return content.trim() === '' ? 0 : words.length;
  }, [content]);

  // Sync word count with parent
  useEffect(() => {
    setWordCount(wordCount);
  }, [wordCount, setWordCount]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleWordCountChange = (count: number) => {
    setWordCount(count);
  };

  const handleSave = () => {
    logger.debug('Saving cover letter:', { title, content, wordCount });
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
          <div 
            className="p-2 rounded-lg"
            style={{ background: colors.badgeInfoBg }}
          >
            <Edit3 size={24} style={{ color: colors.primaryBlue }} />
          </div>
          <div>
            <h2 
              className="text-xl font-semibold"
              style={{ color: colors.primaryText }}
            >
              Custom Cover Letter
            </h2>
            <p 
              className="text-sm"
              style={{ color: colors.secondaryText }}
            >
              Write your cover letter from scratch
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          style={{
            background: colors.primaryBlue,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.primaryBlueHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.primaryBlue;
          }}
        >
          <Save size={16} />
          Save Draft
        </button>
      </div>

      {/* Title Input */}
      <div>
        <label 
          className="block text-sm font-semibold mb-2"
          style={{ color: colors.primaryText }}
        >
          Cover Letter Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.primaryBlue;
            e.target.style.boxShadow = `0 0 0 2px ${colors.primaryBlue}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.border;
            e.target.style.boxShadow = 'none';
          }}
          placeholder="e.g., Software Engineer - Tech Corp"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
            <Lightbulb size={16} style={{ color: colors.warningYellow }} />
            <h3 
              className="font-semibold"
              style={{ color: colors.primaryText }}
            >
              Writing Tips
            </h3>
          </div>
          
          <div className="space-y-3">
            {writingTips.map((tip, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-3"
                style={{
                  background: colors.badgeWarningBg,
                  borderColor: colors.badgeWarningBorder,
                }}
              >
                <h4 
                  className="font-semibold text-sm mb-1"
                  style={{ color: colors.badgeWarningText }}
                >
                  {tip.title}
                </h4>
                <p 
                  className="text-xs"
                  style={{ color: colors.secondaryText }}
                >
                  {tip.tip}
                </p>
              </div>
            ))}
          </div>

          {/* Word Count Info */}
          <div 
            className="border rounded-lg p-3"
            style={{
              background: colors.badgeInfoBg,
              borderColor: colors.badgeInfoBorder,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} style={{ color: colors.primaryBlue }} />
              <h4 
                className="font-semibold text-sm"
                style={{ color: colors.primaryText }}
              >
                Word Count
              </h4>
            </div>
            <p 
              className="text-2xl font-bold mb-1"
              style={{ color: colors.primaryText }}
            >
              {wordCount}
            </p>
            <p 
              className="text-xs"
              style={{ color: colors.secondaryText }}
            >
              {wordCount < 150 && "Too short - aim for 250-400 words"}
              {wordCount >= 150 && wordCount < 250 && "Getting there - aim for 250-400 words"}
              {wordCount >= 250 && wordCount <= 400 && "Perfect length!"}
              {wordCount > 400 && "Consider shortening - aim for 250-400 words"}
            </p>
          </div>

          {/* Quick Actions */}
          <div 
            className="border rounded-lg p-3"
            style={{
              background: colors.inputBackground,
              borderColor: colors.border,
            }}
          >
            <h4 
              className="font-semibold text-sm mb-2"
              style={{ color: colors.primaryText }}
            >
              Quick Actions
            </h4>
            <div className="space-y-2">
              <button 
                className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Load Template
              </button>
              <button 
                className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Use AI Generator
              </button>
              <button 
                className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Check Grammar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
