'use client';

import React, { useState } from 'react';
import { Search, Code, Briefcase, Lightbulb, TrendingUp, GraduationCap, FileText, Grid, List, Eye } from 'lucide-react';
import { CoverLetterTemplate } from '../types/coverletter';
import TemplateCard from '../components/TemplateCard';
import { logger } from '../../../utils/logger';
import { useTheme } from '../../../contexts/ThemeContext';

interface TemplatesTabProps {
  onLoadTemplate?: (template: CoverLetterTemplate) => void;
}

export default function TemplatesTab({ onLoadTemplate }: TemplatesTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewTemplate, setPreviewTemplate] = useState<CoverLetterTemplate | null>(null);

  // Updated template data to match image design
  const templates: CoverLetterTemplate[] = [
    {
      id: '1',
      name: 'Professional Modern',
      category: 'tech',
      description: 'Clean and modern design perfect for tech roles. ATS-optimized with clear sections.',
      content: 'Dear Hiring Manager,\n\nI am writing to express my strong interest...',
      wordCount: 280,
      aiGenerated: true,
      successRate: 98,
      usageCount: 45,
      tags: ['Tech', 'Modern', 'ATS-Friendly']
    },
    {
      id: '2',
      name: 'Executive Classic',
      category: 'executive',
      description: 'Traditional format ideal for senior positions. Emphasizes leadership and achievements.',
      content: 'Dear Hiring Manager,\n\nI am writing to express my strong interest...',
      wordCount: 320,
      aiGenerated: true,
      successRate: 96,
      usageCount: 32,
      tags: ['Executive', 'Classic', 'Leadership']
    },
    {
      id: '3',
      name: 'Creative Bold',
      category: 'creative',
      description: 'Eye-catching design for creative industries. Balances style with professionalism.',
      content: 'Dear Hiring Manager,\n\nI am excited to apply...',
      wordCount: 290,
      aiGenerated: false,
      successRate: 92,
      usageCount: 28,
      tags: ['Creative', 'Design', 'Unique']
    },
    {
      id: '4',
      name: 'Business Professional',
      category: 'business',
      description: 'Straightforward and professional for business roles. Clean typography and layout.',
      content: 'Dear Hiring Manager,\n\nI am writing to apply...',
      wordCount: 300,
      aiGenerated: true,
      successRate: 95,
      usageCount: 38,
      tags: ['Business', 'Corporate', 'Professional']
    },
    {
      id: '5',
      name: 'Academic Formal',
      category: 'academic',
      description: 'Formal template for academic and research positions. Emphasizes publications.',
      content: 'Dear Hiring Manager,\n\nI am writing to express my interest...',
      wordCount: 350,
      aiGenerated: true,
      successRate: 94,
      usageCount: 22,
      tags: ['Academic', 'Research', 'Formal']
    },
    {
      id: '6',
      name: 'Startup Ready',
      category: 'tech',
      description: 'Dynamic format for startup environments. Highlights innovation and adaptability.',
      content: 'Dear Hiring Manager,\n\nI am excited to apply...',
      wordCount: 275,
      aiGenerated: true,
      successRate: 93,
      usageCount: 55,
      tags: ['Startup', 'Tech', 'Dynamic']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Templates', icon: FileText },
    { id: 'tech', label: 'Tech', icon: Code },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'creative', label: 'Creative', icon: Lightbulb },
    { id: 'executive', label: 'Executive', icon: TrendingUp },
    { id: 'academic', label: 'Academic', icon: GraduationCap }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: CoverLetterTemplate) => {
    logger.debug('Using template:', template);
    if (onLoadTemplate) {
      onLoadTemplate(template);
    }
  };

  const handlePreviewTemplate = (template: CoverLetterTemplate) => {
    logger.debug('Previewing template:', template);
    setPreviewTemplate(template);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search 
          size={18} 
          className="absolute left-3 top-1/2 -translate-y-1/2" 
          style={{ color: colors.tertiaryText }}
        />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.borderFocused;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
          }}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(category => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  background: isActive ? colors.primaryBlue : colors.inputBackground,
                  color: isActive ? 'white' : colors.secondaryText,
                  border: `1px solid ${isActive ? colors.primaryBlue : colors.border}`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = colors.hoverBackground;
                    e.currentTarget.style.color = colors.primaryText;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = colors.inputBackground;
                    e.currentTarget.style.color = colors.secondaryText;
                  }
                }}
              >
                <Icon size={16} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div 
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <button
            onClick={() => setViewMode('grid')}
            className="p-1.5 rounded transition-all"
            style={{
              background: viewMode === 'grid' ? colors.primaryBlue : 'transparent',
              color: viewMode === 'grid' ? 'white' : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'grid') {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'grid') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            aria-label="Grid view"
            title="Grid view"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="p-1.5 rounded transition-all"
            style={{
              background: viewMode === 'list' ? colors.primaryBlue : 'transparent',
              color: viewMode === 'list' ? 'white' : colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'list') {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'list') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            aria-label="List view"
            title="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={handleUseTemplate}
            onPreview={handlePreviewTemplate}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} style={{ color: colors.tertiaryText }} className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primaryText }}>
            No templates found
          </h3>
          <p style={{ color: colors.secondaryText }}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setPreviewTemplate(null)}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1" style={{ color: colors.primaryText }}>
                  {previewTemplate.name}
                </h3>
                <p style={{ color: colors.secondaryText }}>{previewTemplate.description}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  color: colors.secondaryText,
                  background: colors.inputBackground,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
                aria-label="Close preview"
                title="Close preview"
              >
                <span style={{ fontSize: '20px' }}>×</span>
              </button>
            </div>

            {/* Template Content Preview */}
            <div 
              className="rounded-lg p-8"
              style={{
                background: 'white',
                border: `1px solid ${colors.border}`,
              }}
            >
              <div 
                className="whitespace-pre-wrap leading-relaxed"
                style={{ 
                  color: '#1a1a1a',
                  fontFamily: 'Georgia, serif',
                  fontSize: '14px'
                }}
              >
                {previewTemplate.content}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
              <div className="flex items-center gap-4 text-sm" style={{ color: colors.secondaryText }}>
                <span>{previewTemplate.wordCount} words</span>
                <span>•</span>
                <span>{previewTemplate.successRate}% ATS Score</span>
                <span>•</span>
                <span>{previewTemplate.usageCount} uses</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: colors.inputBackground,
                    color: colors.secondaryText,
                    border: `1px solid ${colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackgroundStrong;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.inputBackground;
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (onLoadTemplate) {
                      onLoadTemplate(previewTemplate);
                      setPreviewTemplate(null);
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  style={{
                    background: colors.primaryBlue,
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Eye size={16} />
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
