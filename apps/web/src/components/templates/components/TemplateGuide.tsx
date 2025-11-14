/**
 * TemplateGuide - Help component explaining template concepts to users
 * Displays helpful information about difficulty levels, layouts, and color schemes
 */

import React, { useState } from 'react';
import { HelpCircle, X, Zap, Layout, Palette } from 'lucide-react';
import type { ThemeColors } from '../types';

interface TemplateGuideProps {
  colors: ThemeColors;
}

export default function TemplateGuide({ colors }: TemplateGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: colors.primaryBlue,
          color: '#ffffff',
        }}
        aria-label="Show template guide"
      >
        <HelpCircle size={16} />
        <span>Help Guide</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        style={{ background: colors.cardBackground }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between p-6 border-b z-10"
          style={{
            borderColor: colors.border,
            background: colors.cardBackground,
          }}
        >
          <div className="flex items-center gap-2">
            <HelpCircle size={24} style={{ color: colors.primaryBlue }} />
            <h2 className="text-2xl font-bold" style={{ color: colors.primaryText }}>
              Template Guide
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            aria-label="Close guide"
          >
            <X size={20} style={{ color: colors.secondaryText }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Difficulty Levels */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={20} style={{ color: colors.primaryBlue }} />
              <h3 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
                Difficulty Levels
              </h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-lg" style={{ background: '#d1fae5', borderLeft: '4px solid #10b981' }}>
                <h4 className="font-semibold text-green-900 mb-2">Beginner (Green Badge)</h4>
                <p className="text-sm text-green-800">
                  Simple, straightforward templates with clean layouts. Perfect for first-time resume builders or those who prefer minimal formatting. These templates are ATS-friendly and easy to customize.
                </p>
                <p className="text-xs text-green-700 mt-2">
                  <strong>Best for:</strong> Entry-level candidates, career changers, traditional industries
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
                <h4 className="font-semibold text-yellow-900 mb-2">Intermediate (Yellow Badge)</h4>
                <p className="text-sm text-yellow-800">
                  Moderate complexity with some visual enhancements. Includes subtle colors, icons, and section styling while maintaining professional appearance and ATS compatibility.
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  <strong>Best for:</strong> Mid-level professionals, competitive industries, modern companies
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ background: '#fee2e2', borderLeft: '4px solid #ef4444' }}>
                <h4 className="font-semibold text-red-900 mb-2">Advanced (Red Badge)</h4>
                <p className="text-sm text-red-800">
                  Complex layouts with advanced features like two-column designs, creative elements, and unique styling. Requires more customization effort but creates standout visual impact.
                </p>
                <p className="text-xs text-red-700 mt-2">
                  <strong>Best for:</strong> Creative fields, senior positions, portfolio showcase, design-forward industries
                </p>
              </div>
            </div>
          </section>

          {/* Layout Types */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Layout size={20} style={{ color: colors.primaryBlue }} />
              <h3 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
                Layout Types
              </h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border" style={{ borderColor: colors.border }}>
                <h4 className="font-semibold mb-2" style={{ color: colors.primaryText }}>
                  Single-Column
                </h4>
                <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>
                  Full-width vertical layout with content flowing from top to bottom. Headers, experience, skills, and education are stacked vertically.
                </p>
                <div className="flex gap-4 text-xs">
                  <span className="px-2 py-1 rounded" style={{ background: '#d1fae5', color: '#065f46' }}>
                    ✓ Best ATS compatibility
                  </span>
                  <span className="px-2 py-1 rounded" style={{ background: '#d1fae5', color: '#065f46' }}>
                    ✓ Easy to scan
                  </span>
                  <span className="px-2 py-1 rounded" style={{ background: '#d1fae5', color: '#065f46' }}>
                    ✓ Print-friendly
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg border" style={{ borderColor: colors.border }}>
                <h4 className="font-semibold mb-2" style={{ color: colors.primaryText }}>
                  Two-Column
                </h4>
                <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>
                  Sidebar (30%) + main content area (70%). Sidebar typically contains contact info, skills, and education. Main area showcases experience and summary.
                </p>
                <div className="flex gap-4 text-xs">
                  <span className="px-2 py-1 rounded" style={{ background: '#dbeafe', color: '#1e40af' }}>
                    ✓ Modern appearance
                  </span>
                  <span className="px-2 py-1 rounded" style={{ background: '#dbeafe', color: '#1e40af' }}>
                    ✓ Space efficient
                  </span>
                  <span className="px-2 py-1 rounded" style={{ background: '#dbeafe', color: '#1e40af' }}>
                    ✓ Visual hierarchy
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg border" style={{ borderColor: colors.border }}>
                <h4 className="font-semibold mb-2" style={{ color: colors.primaryText }}>
                  Hybrid
                </h4>
                <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>
                  Flexible combination of both layouts. Header may be full-width, followed by two-column sections, then back to single-column for detailed content.
                </p>
                <div className="flex gap-4 text-xs">
                  <span className="px-2 py-1 rounded" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                    ✓ Most flexible
                  </span>
                  <span className="px-2 py-1 rounded" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                    ✓ Balanced approach
                  </span>
                  <span className="px-2 py-1 rounded" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                    ✓ Adaptable
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Color Schemes */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette size={20} style={{ color: colors.primaryBlue }} />
              <h3 className="text-xl font-semibold" style={{ color: colors.primaryText }}>
                Color Schemes
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: colors.secondaryText }}>
              Color schemes affect headers, section dividers, and accents throughout your resume:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded" style={{ background: '#2563eb' }}></div>
                  <span className="font-medium" style={{ color: colors.primaryText }}>Blue</span>
                </div>
                <p className="text-xs" style={{ color: colors.secondaryText }}>
                  Professional, trustworthy, corporate. Good for finance, tech, healthcare.
                </p>
              </div>

              <div className="p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded" style={{ background: '#059669' }}></div>
                  <span className="font-medium" style={{ color: colors.primaryText }}>Green</span>
                </div>
                <p className="text-xs" style={{ color: colors.secondaryText }}>
                  Growth, sustainability, fresh. Good for environmental, health, education.
                </p>
              </div>

              <div className="p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded" style={{ background: '#7c3aed' }}></div>
                  <span className="font-medium" style={{ color: colors.primaryText }}>Purple</span>
                </div>
                <p className="text-xs" style={{ color: colors.secondaryText }}>
                  Creative, innovative, unique. Good for design, marketing, startups.
                </p>
              </div>

              <div className="p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded" style={{ background: '#dc2626' }}></div>
                  <span className="font-medium" style={{ color: colors.primaryText }}>Red</span>
                </div>
                <p className="text-xs" style={{ color: colors.secondaryText }}>
                  Bold, energetic, attention-grabbing. Good for sales, entertainment, media.
                </p>
              </div>

              <div className="p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded" style={{ background: '#ea580c' }}></div>
                  <span className="font-medium" style={{ color: colors.primaryText }}>Orange</span>
                </div>
                <p className="text-xs" style={{ color: colors.secondaryText }}>
                  Friendly, approachable, enthusiastic. Good for hospitality, retail, nonprofit.
                </p>
              </div>

              <div className="p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded" style={{ background: '#1f2937' }}></div>
                  <span className="font-medium" style={{ color: colors.primaryText }}>Monochrome</span>
                </div>
                <p className="text-xs" style={{ color: colors.secondaryText }}>
                  Classic, timeless, ATS-safe. Good for conservative industries, law, government.
                </p>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="p-4 rounded-lg" style={{ background: colors.badgeInfoBg }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.primaryText }}>
              💡 Quick Tips
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: colors.secondaryText }}>
              <li className="flex gap-2">
                <span>•</span>
                <span><strong>Applying to ATS systems?</strong> Choose beginner difficulty, single-column layout, and monochrome/blue colors.</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span><strong>Creative industry?</strong> Try advanced difficulty, two-column layout, and bold colors like purple or red.</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span><strong>Not sure?</strong> Start with intermediate difficulty - it offers good balance between visual appeal and ATS compatibility.</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span><strong>Downloading preview?</strong> Note that downloads show sample data only. Upload your resume for a personalized version.</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 p-4 border-t flex justify-end"
          style={{
            borderColor: colors.border,
            background: colors.cardBackground,
          }}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 rounded-lg font-medium"
            style={{
              background: colors.primaryBlue,
              color: '#ffffff',
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
