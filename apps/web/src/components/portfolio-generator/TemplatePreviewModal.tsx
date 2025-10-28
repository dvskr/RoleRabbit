'use client';

import React from 'react';
import { X, Monitor, Smartphone, Tablet } from 'lucide-react';
import { WebsiteConfig, Section } from '../../types/portfolio';

interface TemplatePreviewModalProps {
  template: any;
  config: WebsiteConfig;
  onClose: () => void;
}

export default function TemplatePreviewModal({ template, config, onClose }: TemplatePreviewModalProps) {
  const [device, setDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const deviceWidths = {
    desktop: 'w-full max-w-7xl',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  };

  const renderSection = (section: Section) => {
    const primaryColor = config.theme?.primaryColor || template.accentColor;
    
    switch (section.type) {
      case 'hero':
        return (
          <div className={`bg-gradient-to-r ${template.preview} text-white p-8 md:p-12 text-center min-h-[60vh] flex flex-col items-center justify-center`}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{section.config.headline || "I'm John Doe"}</h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">{section.config.subheading || "Full-Stack Developer"}</p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition">
                {section.config.ctaText || "Contact Me"}
              </button>
              <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition">
                {section.config.secondaryCta || "View Work"}
              </button>
            </div>
          </div>
        );

      case 'about':
        return (
          <section className="py-12 px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.config.title || "About Me"}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{section.config.description || "Passionate developer creating amazing solutions."}</p>
            </div>
          </section>
        );

      case 'experience':
        const expItems = (section.config.items || []).slice(0, 2);
        return (
          <section className="py-12 px-8 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{section.config.title || "Experience"}</h2>
              <div className="space-y-6">
                {expItems.map((item: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="text-xl font-semibold text-gray-900">{item.position || "Software Engineer"}</h3>
                    <p className="text-gray-600">{item.company || "Tech Corp"} • {item.date || "2020 - Present"}</p>
                    <p className="text-gray-700 mt-2">{item.description || "Leading development of cloud-native applications."}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'projects':
        const projects = (section.config.items || []).slice(0, 2);
        return (
          <section className="py-12 px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{section.config.title || "Projects"}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {projects.map((project: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
                    <div className={`h-48 ${template.preview.includes('blue') ? 'bg-blue-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`} />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{project.name || "E-Commerce Platform"}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.description || "Built a scalable platform handling 10K+ transactions."}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'skills':
        const skills = (section.config.items || []).slice(0, 8);
        return (
          <section className="py-12 px-8 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.config.title || "Skills"}</h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section className={`py-12 px-8 bg-gradient-to-r ${template.preview} text-white text-center`}>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">{section.config.title || "Get In Touch"}</h2>
              <p className="text-lg mb-6">Let's work together!</p>
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition">
                Contact Me
              </button>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const enabledSections = (config.sections || []).filter(s => s.enabled);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Template Preview: {template.name}</h2>
            <p className="text-blue-100 text-sm">See how your portfolio will look</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Device Selector */}
            <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-2 rounded ${device === 'desktop' ? 'bg-white text-blue-600' : 'text-white'}`}
              >
                <Monitor size={18} />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-2 rounded ${device === 'tablet' ? 'bg-white text-blue-600' : 'text-white'}`}
              >
                <Tablet size={18} />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-2 rounded ${device === 'mobile' ? 'bg-white text-blue-600' : 'text-white'}`}
              >
                <Smartphone size={18} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className={`mx-auto transition-all ${deviceWidths[device]}`}>
            <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
              {enabledSections.map((section) => (
                <div key={section.id}>
                  {renderSection(section)}
                </div>
              ))}
              <footer className="bg-gray-900 text-white py-6 text-center">
                <p className="text-gray-400">© {new Date().getFullYear()} My Portfolio. All rights reserved.</p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

