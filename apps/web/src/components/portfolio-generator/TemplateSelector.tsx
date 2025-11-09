'use client';

import React, { useState, useMemo } from 'react';
import { Palette, Layout, Code, Briefcase, Sparkles, ArrowRight, Monitor, Smartphone, Tablet, Eye } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WebsiteConfig, PortfolioTemplateDefinition, TemplateCategory } from '../../types/portfolio';
import TemplatePreviewModal from './TemplatePreviewModal';

interface TemplateSelectorProps {
  onNext: () => void;
  onBack: () => void;
  config: WebsiteConfig;
  onUpdate: (config: Partial<WebsiteConfig>) => void;
}

const templates: PortfolioTemplateDefinition[] = [
  {
    id: 'split-hero',
    name: 'Split Hero Focus',
    description: 'Asymmetric hero section with bold typography',
    category: 'creative',
    preview: 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500',
    accentColor: '#a855f7',
    styles: { layout: 'split', heroStyle: 'asymmetric', cardStyle: 'modern' }
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism Pro',
    description: 'Modern frosted glass effects and depth',
    category: 'tech',
    preview: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600',
    accentColor: '#3b82f6',
    styles: { layout: 'overlay', heroStyle: 'glass', cardStyle: 'frosted' }
  },
  {
    id: 'neobrutalism',
    name: 'Neo Brutalism',
    description: 'Bold, unapologetic design with hard shadows',
    category: 'creative',
    preview: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
    accentColor: '#f59e0b',
    styles: { layout: 'bold', heroStyle: 'brutal', cardStyle: 'hard-shadow' }
  },
  {
    id: 'journal-minimal',
    name: 'Journal Minimal',
    description: 'Elegant typography with breathing space',
    category: 'professional',
    preview: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
    accentColor: '#d97706',
    styles: { layout: 'serif', heroStyle: 'typography', cardStyle: 'minimal' }
  },
  {
    id: 'geometric-bold',
    name: 'Geometric Bold',
    description: 'Sharp angles and geometric patterns',
    category: 'tech',
    preview: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600',
    accentColor: '#10b981',
    styles: { layout: 'geometric', heroStyle: 'angular', cardStyle: 'sharp' }
  },
  {
    id: 'brutalist-dark',
    name: 'Brutalist Dark',
    description: 'Dark mode with high contrast',
    category: 'tech',
    preview: 'bg-gradient-to-br from-gray-950 via-neutral-900 to-black',
    accentColor: '#22c55e',
    styles: { layout: 'dark', heroStyle: 'bold', cardStyle: 'high-contrast', darkMode: true }
  },
  {
    id: 'retro-waves',
    name: 'Retro Waves',
    description: 'Vibrant 80s aesthetic with wave patterns',
    category: 'creative',
    preview: 'bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500',
    accentColor: '#ec4899',
    styles: { layout: 'retro', heroStyle: 'wave', cardStyle: 'neon' }
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    description: 'Classic luxury with serif fonts',
    category: 'professional',
    preview: 'bg-gradient-to-br from-stone-100 via-zinc-50 to-slate-50',
    accentColor: '#52525b',
    styles: { layout: 'elegant', heroStyle: 'serif', cardStyle: 'luxury' }
  },
  {
    id: 'cyber-grid',
    name: 'Cyber Grid',
    description: 'Futuristic grid-based layout',
    category: 'tech',
    preview: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600',
    accentColor: '#06b6d4',
    styles: { layout: 'grid', heroStyle: 'cyber', cardStyle: 'gridded' }
  },
  {
    id: 'organic-blobs',
    name: 'Organic Blobs',
    description: 'Smooth organic shapes and soft curves',
    category: 'creative',
    preview: 'bg-gradient-to-br from-blue-300 via-cyan-400 to-teal-500',
    accentColor: '#0891b2',
    styles: { layout: 'organic', heroStyle: 'blob', cardStyle: 'curved' }
  },
  {
    id: 'newspaper-layout',
    name: 'Newspaper Layout',
    description: 'Editorial style with columns',
    category: 'professional',
    preview: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-50',
    accentColor: '#ca8a04',
    styles: { layout: 'editorial', heroStyle: 'columns', cardStyle: 'editorial' }
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Electric neon glow effects',
    category: 'creative',
    preview: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-900',
    accentColor: '#a855f7',
    styles: { layout: 'neon', heroStyle: 'glow', cardStyle: 'neon-glow', darkMode: true }
  }
];

type ColorPalette = {
  name: string;
  colors: string[];
};

const colorPalettes: ColorPalette[] = [
  { name: 'Ocean Blue', colors: ['#0ea5e9', '#3b82f6', '#0284c7', '#0369a1'] },
  { name: 'Forest Green', colors: ['#22c55e', '#16a34a', '#15803d', '#166534'] },
  { name: 'Sunset', colors: ['#f97316', '#ea580c', '#c2410c', '#9a3412'] },
  { name: 'Royal Purple', colors: ['#a855f7', '#9333ea', '#7e22ce', '#6b21a8'] },
  { name: 'Cherry Red', colors: ['#f43f5e', '#e11d48', '#be123c', '#9f1239'] },
  { name: 'Gold', colors: ['#eab308', '#ca8a04', '#a16207', '#854d0e'] },
  { name: 'Slate Gray', colors: ['#64748b', '#475569', '#334155', '#1e293b'] },
  { name: 'Cyan', colors: ['#06b6d4', '#0891b2', '#0e7490', '#155e75'] }
];

export default function TemplateSelector({ onNext, onBack, config, onUpdate }: TemplateSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(config.theme?.templateId || 'minimal');
  const [selectedPalette, setSelectedPalette] = useState<string[]>(config.theme?.colors || ['#3b82f6']);
  const [categoryFilter, setCategoryFilter] = useState<'all' | TemplateCategory>('all');
  const [previewingTemplate, setPreviewingTemplate] = useState<PortfolioTemplateDefinition | null>(null);

  const filteredTemplates = useMemo(() => {
    if (categoryFilter === 'all') return templates;
    return templates.filter(t => t.category === categoryFilter);
  }, [categoryFilter]);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onUpdate({
        theme: {
          templateId,
          primaryColor: template.accentColor,
          colors: [template.accentColor],
          ...template.styles
        }
      });
    }
  };

  const handleSelectPalette = (colors: string[]) => {
    setSelectedPalette(colors);
    onUpdate({
      theme: {
        ...config.theme,
        colors,
        primaryColor: colors[0]
      }
    });
  };

  const categories: Array<{ id: 'all' | TemplateCategory; name: string; icon: LucideIcon }> = [
    { id: 'all', name: 'All', icon: Layout },
    { id: 'creative', name: 'Creative', icon: Palette },
    { id: 'tech', name: 'Tech', icon: Code },
    { id: 'professional', name: 'Professional', icon: Briefcase }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Template</h2>
            <p className="text-gray-600 mt-1">Select a design that matches your style</p>
          </div>
          <button
            type="button"
            onClick={onNext}
            disabled={!selectedTemplateId}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Category Filters */}
          <div className="flex items-center gap-3 mb-6 p-2 bg-white rounded-xl shadow-sm">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Template Grid */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Layout size={20} />
                Templates
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                      selectedTemplateId === template.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Portfolio Preview Mockup - UNIQUE layout per template */}
                      <div className={`w-32 h-40 ${template.preview} shadow-lg flex-shrink-0 relative overflow-hidden border-2 border-gray-200 rounded-lg`}>
                        {/* Split Hero Focus - Asymmetric split layout */}
                        {template.id === 'split-hero' && (
                          <div className="absolute inset-0 p-1 flex">
                            <div className="flex-1 bg-white/90 rounded-l p-1">
                              <div className="w-full h-3 bg-purple-200 rounded mb-1" />
                              <div className="w-3/4 h-2 bg-violet-300 rounded mb-0.5" />
                              <div className="w-2/3 h-1.5 bg-purple-300 rounded" />
                            </div>
                            <div className="flex-1 ${template.preview} rounded-r flex items-center">
                              <div className="w-10 h-10 bg-white/30 rounded-full mx-auto" />
                            </div>
                          </div>
                        )}

                        {/* Glassmorphism - Layered translucent cards */}
                        {template.id === 'glassmorphism' && (
                          <div className="absolute inset-0 ${template.preview}">
                            <div className="absolute inset-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg p-2">
                              <div className="h-4 flex items-center justify-center mb-2">
                                <div className="w-8 h-2 bg-white/60 rounded" />
                              </div>
                              <div className="space-y-1">
                                <div className="h-2 bg-blue-200/50 backdrop-blur rounded" />
                                <div className="h-2 bg-indigo-200/50 backdrop-blur rounded" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Neo Brutalism - Hard borders and black boxes */}
                        {template.id === 'neobrutalism' && (
                          <div className="absolute inset-0 bg-white p-1">
                            <div className="h-8 bg-yellow-400 border-3 border-black flex items-center justify-center">
                              <span className="text-black text-[7px] font-black">DOE</span>
                            </div>
                            <div className="p-1 space-y-1">
                              <div className="h-1.5 bg-orange-400 border-2 border-black" />
                              <div className="h-1.5 bg-red-400 border-2 border-black" />
                              <div className="grid grid-cols-2 gap-1">
                                <div className="h-3 bg-yellow-400 border-3 border-black" />
                                <div className="h-3 bg-orange-400 border-3 border-black" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Geometric Bold - Angled shapes */}
                        {template.id === 'geometric-bold' && (
                          <div className="absolute inset-0 ${template.preview}">
                            <div className="h-10 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/30 skew-x-12 rotate-45 border-2 border-white" />
                            </div>
                            <div className="bg-white p-1 space-y-0.5">
                              <div className="h-2 bg-teal-200 transform skew-x-12" />
                              <div className="h-2 bg-emerald-200 transform -skew-x-12" />
                              <div className="grid grid-cols-2 gap-0.5">
                                <div className="h-3 bg-cyan-200 rotate-1" />
                                <div className="h-3 bg-teal-200 -rotate-1" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Journal Minimal - Editorial layout with columns */}
                        {template.id === 'journal-minimal' && (
                          <div className="absolute inset-0 bg-white">
                            <div className={`h-10 ${template.preview} border-b-2 border-amber-300 flex items-center px-2`}>
                              <div className="w-full h-1.5 bg-white/80 mb-1" />
                            </div>
                            <div className="p-1 space-y-1">
                              <div className="grid grid-cols-2 gap-1">
                                <div className="space-y-0.5">
                                  <div className="h-1.5 bg-amber-50" />
                                  <div className="h-1 bg-gray-200" />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="h-1.5 bg-amber-50" />
                                  <div className="h-1 bg-gray-200" />
                                </div>
                              </div>
                              <div className="h-2 bg-amber-50 border-l-2 border-amber-400" />
                            </div>
                          </div>
                        )}

                        {/* Brutalist Dark - High contrast dark */}
                        {template.id === 'brutalist-dark' && (
                          <div className="absolute inset-0 bg-gray-950">
                            <div className="h-8 bg-green-500 border-b-4 border-black flex items-center justify-center">
                              <span className="text-black text-[7px] font-black">DOE</span>
                            </div>
                            <div className="p-1 space-y-1">
                              <div className="h-1.5 bg-gray-800 border-2 border-green-500" />
                              <div className="h-1.5 bg-gray-900 border border-gray-700" />
                              <div className="h-2 bg-green-600/30" />
                            </div>
                          </div>
                        )}

                        {/* Retro Waves - Curved wave patterns */}
                        {template.id === 'retro-waves' && (
                          <div className="absolute inset-0 ${template.preview} overflow-hidden">
                            <svg className="absolute top-0 left-0 w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                              <path d="M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z" fill="white" opacity="0.1"/>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                              <div className="w-16 h-3 bg-white/30 rounded-full mb-2" />
                              <div className="space-y-1 w-full px-2">
                                <div className="h-2 bg-purple-200/50 rounded" />
                                <div className="h-2 bg-pink-200/50 rounded" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Elegant Serif - Classic typography */}
                        {template.id === 'elegant-serif' && (
                          <div className="absolute inset-0 bg-white border">
                            <div className={`h-12 ${template.preview} flex items-center justify-center`}>
                              <div className="text-center">
                                <div className="w-16 h-2 bg-white/60 mb-1" />
                                <div className="w-12 h-1 bg-white/40" />
                              </div>
                            </div>
                            <div className="p-2 space-y-2">
                              <div className="h-1 bg-stone-200" />
                              <div className="h-1 bg-stone-200" />
                              <div className="h-1 bg-stone-200" />
                              <div className="h-2 bg-stone-100 border border-stone-300" />
                            </div>
                          </div>
                        )}

                        {/* Cyber Grid - Grid-based tech */}
                        {template.id === 'cyber-grid' && (
                          <div className="absolute inset-0 ${template.preview}">
                            <div className="h-full grid grid-cols-4 gap-0.5 p-1">
                              {[...Array(16)].map((_, i) => (
                                <div key={i} className={`${i % 4 === 0 || i % 3 === 0 ? 'bg-cyan-300' : 'bg-cyan-500'} bg-opacity-50`} />
                              ))}
                            </div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur px-2 py-1 rounded">
                              <div className="text-white text-[7px] font-mono">CYBER</div>
                            </div>
                          </div>
                        )}

                        {/* Organic Blobs - Smooth curves */}
                        {template.id === 'organic-blobs' && (
                          <div className="absolute inset-0 ${template.preview}">
                            <div className="absolute top-0 left-0 w-20 h-20 bg-blue-300 rounded-full opacity-60 blur" />
                            <div className="absolute top-4 right-2 w-16 h-16 bg-cyan-300 rounded-full opacity-40 blur" />
                            <div className="absolute bottom-8 left-4 w-12 h-12 bg-teal-300 rounded-full opacity-50 blur" />
                            <div className="absolute inset-0 flex items-center justify-center pt-6">
                              <div className="bg-white/30 backdrop-blur-lg rounded-full px-3 py-2">
                                <div className="text-white text-[7px] font-bold">BL0BS</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Newspaper Layout - Editorial columns */}
                        {template.id === 'newspaper-layout' && (
                          <div className="absolute inset-0 bg-amber-50 border border-amber-200">
                            <div className="h-8 border-b-2 border-amber-400 flex items-center">
                              <div className="text-[7px] font-bold text-amber-900 ml-2">PORTFOLIO DAILY</div>
                            </div>
                            <div className="grid grid-cols-3 gap-0.5 p-1">
                              <div className="col-span-2 space-y-0.5">
                                <div className="h-2 bg-amber-100" />
                                <div className="h-2 bg-amber-100" />
                                <div className="h-1 bg-amber-50" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="h-1 bg-amber-100" />
                                <div className="h-1 bg-amber-50" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Neon Nights - Glowing neon */}
                        {template.id === 'neon-nights' && (
                          <div className="absolute inset-0 bg-gray-900">
                            <div className="relative h-full">
                              <div className="absolute top-2 left-2 right-2 h-6 bg-purple-900 border border-fuchsia-500 rounded">
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-fuchsia-300 text-[7px] font-bold">NEON</div>
                                </div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-1 space-y-0.5">
                                <div className="h-1.5 bg-fuchsia-500/30 border border-fuchsia-400" />
                                <div className="grid grid-cols-2 gap-0.5">
                                  <div className="h-2 bg-purple-500/20 border border-purple-400" />
                                  <div className="h-2 bg-indigo-500/20 border border-indigo-400" />
                                </div>
                              </div>
                              <div className="absolute top-10 left-4 w-6 h-6 bg-fuchsia-500/20 border border-fuchsia-400 rounded" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          {selectedTemplateId === template.id && (
                            <Sparkles className="text-blue-500" size={18} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        
                        {/* Template Features */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                          <Monitor size={14} />
                          <span>Desktop</span>
                          <Tablet size={14} />
                          <span>Tablet</span>
                          <Smartphone size={14} />
                          <span>Mobile</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate(template.id)}
                        className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                          selectedTemplateId === template.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedTemplateId === template.id ? 'Selected' : 'Select'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewingTemplate(template)}
                        className="px-3 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Palette size={20} />
                Color Palette
              </h3>
              <div className="space-y-3">
                {colorPalettes.map((palette) => (
                  <button
                    type="button"
                    key={palette.name}
                    onClick={() => handleSelectPalette(palette.colors)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                      JSON.stringify(selectedPalette) === JSON.stringify(palette.colors)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{palette.name}</span>
                      <div className="flex gap-1">
                        {palette.colors.map((color, idx) => (
                          <div
                            key={idx}
                            style={{ backgroundColor: color }}
                            className="w-6 h-6 rounded-full shadow-inner"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {palette.colors.map((color, idx) => (
                        <div
                          key={idx}
                          style={{ backgroundColor: color }}
                          className="flex-1 h-8 rounded-md shadow-inner"
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Template Preview */}
              {selectedTemplate && (
                <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3">Selected: {selectedTemplate.name}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500" />
                      <span>Primary Color: {selectedTemplate.accentColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layout size={16} />
                      <span>Style: {selectedTemplate.styles.cardStyle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Monitor size={16} />
                      <span>Responsive Design</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedTemplateId}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Builder
        </button>
      </div>

      {/* Template Preview Modal */}
      {previewingTemplate && (
        <TemplatePreviewModal
          template={previewingTemplate}
          config={config}
          onClose={() => setPreviewingTemplate(null)}
        />
      )}
    </div>
  );
}

