'use client';

import React from 'react';
import { Code, Palette, Megaphone, TrendingUp, DollarSign, FileText, Star, Eye, Target } from 'lucide-react';
import { TemplateCardProps } from '../types/coverletter';

export default function TemplateCard({ template, onUse, onPreview }: TemplateCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'software': return <Code size={16} />;
      case 'design': return <Palette size={16} />;
      case 'marketing': return <Megaphone size={16} />;
      case 'sales': return <TrendingUp size={16} />;
      case 'finance': return <DollarSign size={16} />;
      case 'general': return <FileText size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'software': return 'bg-blue-100 text-blue-700';
      case 'design': return 'bg-purple-100 text-purple-700';
      case 'marketing': return 'bg-green-100 text-green-700';
      case 'sales': return 'bg-orange-100 text-orange-700';
      case 'finance': return 'bg-yellow-100 text-yellow-700';
      case 'general': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'software': return 'Software';
      case 'design': return 'Design';
      case 'marketing': return 'Marketing';
      case 'sales': return 'Sales';
      case 'finance': return 'Finance';
      case 'general': return 'General';
      default: return 'General';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
            {getCategoryIcon(template.category)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-600">{getCategoryLabel(template.category)} Template</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {template.aiGenerated && (
            <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              <Star size={12} />
              AI
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            <Target size={12} />
            {template.successRate}%
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-3 mb-2">{template.description}</p>
        <div className="text-xs text-gray-500">
          {template.wordCount} words • {template.usageCount} uses
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{template.tags.length - 3} more</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onPreview && (
            <button
              onClick={() => onPreview(template)}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <Eye size={14} className="inline mr-1" />
              Preview
            </button>
          )}
          <button
            onClick={() => onUse(template)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}
