'use client';

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, CheckCircle } from 'lucide-react';
import type { WebsiteConfig, Section, SectionItem } from '../../types/portfolio';

interface PreviewPanelProps {
  onNext: () => void;
  onBack: () => void;
  config: WebsiteConfig;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPanel({ onNext, onBack, config }: PreviewPanelProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');

  const deviceStyles: Record<DeviceType, string> = {
    desktop: 'w-full max-w-7xl mx-auto',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto'
  };

  const currentStyle = deviceStyles[device];

  const getItems = (items?: SectionItem[]): SectionItem[] => (Array.isArray(items) ? items : []);
  const getString = (value: unknown, fallback: string = ''): string =>
    typeof value === 'string' && value.trim().length > 0 ? value : fallback;

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8 text-center">
            <h2 className="text-3xl font-bold mb-2">{getString(section.config.headline, 'Welcome')}</h2>
            <p className="text-lg opacity-90 mb-4">{getString(section.config.subheading, 'Your professional introduction')}</p>
            <div className="flex justify-center gap-3">
              <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm">
                {getString(section.config.ctaText, 'Contact Me')}
              </button>
              <button className="px-4 py-2 border-2 border-white text-white rounded-lg font-medium text-sm">
                {getString(section.config.secondaryCta, 'View Resume')}
              </button>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{getString(section.config.title, 'About Me')}</h3>
            <p className="text-gray-600 text-sm">{getString(section.config.description, 'Your story...')}</p>
          </div>
        );

      case 'experience':
        const expItems = getItems(section.config.items)
          .slice(0, 2)
          .map((item, index) => {
            const experience = item as Record<string, unknown>;
            return (
              <div key={`experience-${section.id}-${index}`} className="border-l-4 border-blue-500 pl-3 py-2 mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">{getString(experience.position, 'Position')}</h4>
                <p className="text-xs text-gray-600">
                  {getString(experience.company, 'Company')} • {getString(experience.date, 'Date')}
                </p>
              </div>
            );
          });
        return (
          <div className="p-6 bg-gray-50 border-b">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{getString(section.config.title, 'Experience')}</h3>
            <div className="space-y-2">{expItems}</div>
          </div>
        );

      case 'projects':
        const projects = getItems(section.config.items)
          .slice(0, 2)
          .map((item, index) => {
            const project = item as Record<string, unknown>;
            return (
              <div key={`project-${section.id}-${index}`} className="border rounded-lg p-3">
                <div className="w-full h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded mb-2" />
                <h4 className="font-semibold text-gray-900 text-sm">{getString(project.name, 'Project')}</h4>
                <p className="text-xs text-gray-600">{getString(project.description, 'Description')}</p>
              </div>
            );
          });
        return (
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{getString(section.config.title, 'Projects')}</h3>
            <div className="grid grid-cols-2 gap-3">{projects}</div>
          </div>
        );

      case 'skills':
        const skills = getItems(section.config.items)
          .slice(0, 6)
          .map((entry, index) => {
            const skill = typeof entry === 'string' ? entry : String(entry ?? '');
            return (
              <span key={`skill-${section.id}-${index}`} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {skill || 'Skill'}
              </span>
            );
          });
        return (
          <div className="p-6 bg-gray-50 border-b">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{getString(section.config.title, 'Skills')}</h3>
            <div className="flex flex-wrap gap-2">{skills}</div>
          </div>
        );

      case 'education':
        const eduItems = getItems(section.config.items).map((item, index) => {
          const edu = item as Record<string, unknown>;
          return (
            <div key={`education-${section.id}-${index}`} className="border-l-4 border-purple-500 pl-3 py-2">
              <h4 className="font-semibold text-gray-900 text-sm">{getString(edu.degree, 'Degree')}</h4>
              <p className="text-xs text-gray-600">{getString(edu.institution, 'Institution')} • {getString(edu.year, 'Year')}</p>
            </div>
          );
        });
        return (
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{getString(section.config.title, 'Education')}</h3>
            <div className="space-y-2">{eduItems}</div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center border-b">
            <h3 className="text-xl font-bold mb-2">{getString((section.config as Record<string, unknown>).title, 'Get In Touch')}</h3>
            <p className="mb-4 text-sm opacity-90">
              {getString(section.config.email, 'contact@example.com')}
            </p>
            <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm">
              Contact Me
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => {
    const enabledSections = (config.sections || []).filter(s => s.enabled);
    
    return (
      <div className="bg-gray-100 p-8">
        <div className={`bg-white rounded-xl shadow-2xl overflow-hidden ${currentStyle}`}>
          {/* Render actual sections */}
          {enabledSections.map((section) => (
            <div key={section.id}>
              {renderSection(section)}
            </div>
          ))}

          {/* Footer */}
          <footer className="bg-gray-900 text-white p-6 text-center">
            <p className="text-gray-400">© ${new Date().getFullYear()} My Portfolio. All rights reserved.</p>
          </footer>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with Device Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
            <p className="text-gray-600 text-sm mt-1">See how your portfolio looks on different devices</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                device === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Monitor size={20} />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                device === 'tablet' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Tablet size={20} />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                device === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Smartphone size={20} />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto">
        {device === 'desktop' && renderPreview()}
        {device === 'tablet' && (
          <div className="px-4 py-8">
            {renderPreview()}
          </div>
        )}
        {device === 'mobile' && (
          <div className="px-4 py-8">
            {renderPreview()}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle size={16} className="text-green-500" />
              <span>Design</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle size={16} className="text-green-500" />
              <span>Content</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle size={16} className="text-green-500" />
              <span>Responsive</span>
            </div>
          </div>
          <button
            onClick={onNext}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
          >
            Continue to Hosting
          </button>
        </div>
      </div>
    </div>
  );
}
