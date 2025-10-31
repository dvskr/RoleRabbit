/**
 * Helper functions for template operations
 */

import React from 'react';
import {
  Target,
  Palette,
  Zap,
  Award,
  Crown,
  Layout,
  Users,
  Globe,
  TrendingUp,
  Heart,
  Sparkles
} from 'lucide-react';
import { DifficultyColorScheme } from '../types';
import { SAMPLE_RESUME_DATA } from '../constants';

/**
 * Get color scheme for difficulty level
 */
export const getDifficultyColor = (
  difficulty: string,
  colors: any
): DifficultyColorScheme => {
  switch (difficulty) {
    case 'beginner':
      return {
        text: colors.badgeSuccessText,
        bg: colors.badgeSuccessBg,
        border: colors.badgeSuccessBorder,
      };
    case 'intermediate':
      return {
        text: colors.badgeWarningText,
        bg: colors.badgeWarningBg,
        border: colors.badgeWarningBorder,
      };
    case 'advanced':
      return {
        text: colors.badgeErrorText,
        bg: colors.badgeErrorBg,
        border: colors.badgeErrorBorder,
      };
    default:
      return {
        text: colors.tertiaryText,
        bg: colors.badgeNeutralBg,
        border: colors.badgeNeutralBorder,
      };
  }
};

/**
 * Get icon component for category
 */
export const getCategoryIcon = (category: string): React.ReactNode => {
  switch (category) {
    case 'ats':
      return <Target size={16} />;
    case 'creative':
      return <Palette size={16} />;
    case 'modern':
      return <Zap size={16} />;
    case 'classic':
      return <Award size={16} />;
    case 'executive':
      return <Crown size={16} />;
    case 'minimal':
      return <Layout size={16} />;
    case 'academic':
      return <Users size={16} />;
    case 'technical':
      return <Globe size={16} />;
    case 'startup':
      return <TrendingUp size={16} />;
    case 'freelance':
      return <Heart size={16} />;
    default:
      return <Sparkles size={16} />;
  }
};

/**
 * Get color class based on color scheme
 */
export const getColorSchemeClass = (colorScheme: string): string => {
  switch (colorScheme) {
    case 'blue':
      return 'bg-blue-600';
    case 'green':
      return 'bg-green-600';
    case 'monochrome':
      return 'bg-gray-700';
    default:
      return 'bg-gradient-to-r from-purple-500 to-pink-500';
  }
};

/**
 * Generate sample resume preview component
 */
export const generateSampleResumePreview = (
  template: any
): React.ReactNode => {
  if (!template) return null;

  const sampleData = SAMPLE_RESUME_DATA;

  return (
    <div className="bg-white p-6 shadow-lg">
      {template.layout === 'single-column' && (
        <div className="space-y-4">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold mb-1">{sampleData.name}</h1>
            <p className="text-blue-600 font-semibold">{sampleData.title}</p>
            <p className="text-sm text-gray-600 mt-2">
              {sampleData.email} | {sampleData.phone} | {sampleData.location}
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2 border-b pb-1">
              Professional Summary
            </h2>
            <p className="text-sm text-gray-700">{sampleData.summary}</p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2 border-b pb-1">
              Experience
            </h2>
            {sampleData.experiences.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-semibold">{exp.role}</p>
                    <p className="text-blue-600 text-sm">{exp.company}</p>
                  </div>
                  <span className="text-xs text-gray-600">{exp.period}</span>
                </div>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 ml-2">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2 border-b pb-1">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {sampleData.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2 border-b pb-1">
              Education
            </h2>
            <p className="font-semibold">{sampleData.education.degree}</p>
            <p className="text-sm text-gray-700">
              {sampleData.education.school} - {sampleData.education.year}
            </p>
          </div>
        </div>
      )}

      {template.layout === 'two-column' && (
        <div className="flex gap-6">
          <div className="w-1/3 bg-gray-100 p-4">
            <h1 className="text-xl font-bold mb-2">{sampleData.name}</h1>
            <p className="text-sm mb-3">{sampleData.title}</p>

            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2 border-b pb-1">
                Contact
              </h3>
              <p className="text-xs mb-1">{sampleData.email}</p>
              <p className="text-xs mb-1">{sampleData.phone}</p>
              <p className="text-xs">{sampleData.location}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2 border-b pb-1">
                Skills
              </h3>
              <div className="space-y-1">
                {sampleData.skills.map((skill, i) => (
                  <p key={i} className="text-xs">
                    {skill}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2 border-b pb-1">
                Education
              </h3>
              <p className="text-xs font-semibold">
                {sampleData.education.degree}
              </p>
              <p className="text-xs">{sampleData.education.school}</p>
              <p className="text-xs">{sampleData.education.year}</p>
            </div>
          </div>

          <div className="w-2/3 space-y-4">
            <div>
              <h2 className="font-semibold text-lg mb-2 border-b pb-1">
                Summary
              </h2>
              <p className="text-sm text-gray-700">{sampleData.summary}</p>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-2 border-b pb-1">
                Experience
              </h2>
              {sampleData.experiences.map((exp, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-semibold text-sm">{exp.role}</p>
                      <p className="text-blue-600 text-xs">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-600">{exp.period}</span>
                  </div>
                  <ul className="list-disc list-inside text-xs space-y-1 text-gray-700 ml-2">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {template.layout === 'hybrid' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
            <h1 className="text-3xl font-bold mb-2">{sampleData.name}</h1>
            <p className="text-lg mb-3">{sampleData.title}</p>
            <p className="text-sm">
              {sampleData.email} | {sampleData.phone} | {sampleData.location}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="mb-4">
                <h2 className="font-semibold text-lg mb-2">
                  Professional Summary
                </h2>
                <p className="text-sm text-gray-700">{sampleData.summary}</p>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-2">Experience</h2>
                {sampleData.experiences.map((exp, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-semibold text-sm">{exp.role}</p>
                        <p className="text-blue-600 text-xs">{exp.company}</p>
                      </div>
                      <span className="text-xs text-gray-600">{exp.period}</span>
                    </div>
                    <ul className="list-disc list-inside text-xs space-y-1 text-gray-700 ml-2">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-2">Skills</h3>
                <div className="space-y-1">
                  {sampleData.skills.map((skill, i) => (
                    <p key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {skill}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Education</h3>
                <p className="text-xs font-semibold">
                  {sampleData.education.degree}
                </p>
                <p className="text-xs">{sampleData.education.school}</p>
                <p className="text-xs">{sampleData.education.year}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Download template as HTML file
 */
export const downloadTemplateAsHTML = (
  template: any,
  htmlContent: string
): void => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${template.name.replace(/\s+/g, '-')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Share template (uses Web Share API if available, otherwise copies to clipboard)
 */
export const shareTemplate = async (
  template: { name: string; description: string }
): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: template.name,
        text: template.description,
        url: window.location.href,
      });
    } catch (err) {
      // User cancelled or error occurred
      console.debug('Share failed:', err);
    }
  } else {
    // Fallback: Copy to clipboard
    await navigator.clipboard.writeText(
      `${template.name} - ${template.description}`
    );
    alert('Template link copied to clipboard!');
  }
};

