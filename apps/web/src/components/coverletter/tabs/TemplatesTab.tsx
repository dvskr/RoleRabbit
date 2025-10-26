'use client';

import React, { useState } from 'react';
import { Search, Filter, Plus, Code, Palette, Megaphone, TrendingUp, DollarSign, FileText, X, Eye } from 'lucide-react';
import { CoverLetterTemplate } from '../types/coverletter';
import TemplateCard from '../components/TemplateCard';
import { logger } from '../../../utils/logger';

interface TemplatesTabProps {
  onLoadTemplate?: (template: CoverLetterTemplate) => void;
}

export default function TemplatesTab({ onLoadTemplate }: TemplatesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAITemplates, setShowAITemplates] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CoverLetterTemplate | null>(null);

  // Mock data - in real app, this would come from props or API
  const templates: CoverLetterTemplate[] = [
    {
      id: '1',
      name: 'Software Engineer - Entry Level',
      category: 'software',
      description: 'Professional cover letter template for entry-level software engineering positions. Emphasizes technical skills, projects, and eagerness to learn.',
      content: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the Software Engineer position at [Company Name]. As a recent computer science graduate with a passion for software development...',
      wordCount: 280,
      aiGenerated: true,
      successRate: 85,
      usageCount: 45,
      tags: ['software', 'entry-level', 'technical']
    },
    {
      id: '2',
      name: 'UX Designer - Creative',
      category: 'design',
      description: 'Creative and engaging cover letter template for UX/UI design positions. Highlights design thinking, user research, and portfolio work.',
      content: 'Dear Design Team,\n\nI am excited to apply for the UX Designer position at [Company Name]. With a background in human-computer interaction and a passion for creating intuitive user experiences...',
      wordCount: 320,
      aiGenerated: false,
      successRate: 78,
      usageCount: 32,
      tags: ['design', 'ux', 'creative']
    },
    {
      id: '3',
      name: 'Marketing Manager - Digital',
      category: 'marketing',
      description: 'Results-driven cover letter template for digital marketing positions. Focuses on campaign performance, analytics, and growth strategies.',
      content: 'Dear Marketing Director,\n\nI am writing to apply for the Marketing Manager position at [Company Name]. With over 5 years of experience in digital marketing and a proven track record of driving growth...',
      wordCount: 350,
      aiGenerated: true,
      successRate: 82,
      usageCount: 28,
      tags: ['marketing', 'digital', 'growth']
    },
    {
      id: '4',
      name: 'Sales Representative - B2B',
      category: 'sales',
      description: 'Persuasive cover letter template for B2B sales positions. Emphasizes relationship building, quota achievement, and market knowledge.',
      content: 'Dear Sales Manager,\n\nI am excited to apply for the Sales Representative position at [Company Name]. With a strong background in B2B sales and a track record of exceeding targets...',
      wordCount: 300,
      aiGenerated: false,
      successRate: 75,
      usageCount: 38,
      tags: ['sales', 'b2b', 'relationship']
    },
    {
      id: '5',
      name: 'Financial Analyst - Corporate',
      category: 'finance',
      description: 'Professional cover letter template for financial analyst positions. Highlights analytical skills, financial modeling, and industry knowledge.',
      content: 'Dear Hiring Manager,\n\nI am writing to express my interest in the Financial Analyst position at [Company Name]. With a strong foundation in financial analysis and a passion for data-driven decision making...',
      wordCount: 290,
      aiGenerated: true,
      successRate: 80,
      usageCount: 22,
      tags: ['finance', 'analysis', 'modeling']
    },
    {
      id: '6',
      name: 'General Professional',
      category: 'general',
      description: 'Versatile cover letter template suitable for various professional positions. Adaptable format that can be customized for different industries.',
      content: 'Dear Hiring Manager,\n\nI am writing to express my interest in the [Position Title] position at [Company Name]. With my background in [Industry] and passion for [Field]...',
      wordCount: 250,
      aiGenerated: false,
      successRate: 70,
      usageCount: 55,
      tags: ['general', 'versatile', 'professional']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Templates', icon: FileText },
    { id: 'software', label: 'Software', icon: Code },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'general', label: 'General', icon: FileText }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesAI = !showAITemplates || template.aiGenerated;
    
    return matchesSearch && matchesCategory && matchesAI;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Cover Letter Templates</h2>
          <p className="text-sm text-gray-600">Choose from professional templates or create your own</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Create Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showAITemplates}
              onChange={(e) => setShowAITemplates(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            AI Generated Only
          </label>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={14} />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create New Template
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-600">{previewTemplate.description}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Full Cover Letter Preview */}
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden shadow-lg">
              <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Cover Letter Preview</h4>
                    <p className="text-sm text-gray-600">{previewTemplate.category} • {previewTemplate.wordCount} words</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {previewTemplate.aiGenerated && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">AI Generated</span>
                    )}
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">{previewTemplate.successRate}% Success</span>
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-8">
                {/* Cover Letter Format */}
                <div className="max-w-3xl mx-auto">
                  {/* Date and Contact Info Placeholder */}
                  <div className="mb-8 text-right text-sm text-gray-600 mb-12">
                    <div>[Current Date]</div>
                    <div className="mt-4 text-left">
                      <div>[Your Name]</div>
                      <div>[Your Address]</div>
                      <div>[Your Phone]</div>
                      <div>[Your Email]</div>
                    </div>
                  </div>

                  {/* Recipient Info */}
                  <div className="mb-6 text-sm text-gray-600">
                    <div>Hiring Manager</div>
                    <div>[Company Name]</div>
                    <div>[Company Address]</div>
                  </div>

                  {/* Salutation */}
                  <div className="mb-4">
                    Dear Hiring Manager,
                  </div>

                  {/* Letter Content */}
                  <div 
                    className="whitespace-pre-wrap text-gray-900 leading-relaxed mb-6"
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      lineHeight: '1.8',
                      fontSize: '14px'
                    }}
                  >
                    {previewTemplate.content}
                  </div>

                  {/* Closing */}
                  <div className="mt-8">
                    <div>Thank you for your consideration.</div>
                    <div className="mt-8">Sincerely,</div>
                    <div className="mt-4">[Your Name]</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{previewTemplate.wordCount} words</span>
                <span>•</span>
                <span>{previewTemplate.successRate}% success rate</span>
                <span>•</span>
                <span>{previewTemplate.usageCount} uses</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
