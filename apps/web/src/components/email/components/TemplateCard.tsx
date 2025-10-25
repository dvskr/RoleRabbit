'use client';

import React from 'react';
import { Target, RefreshCw, Heart, Users, Briefcase, MessageCircle, Mail, Star, TrendingUp } from 'lucide-react';
import { TemplateCardProps } from '../types/email';

export default function TemplateCard({ template, onUse, onEdit, onDelete }: TemplateCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cold-email': return <Target size={16} />;
      case 'follow-up': return <RefreshCw size={16} />;
      case 'thank-you': return <Heart size={16} />;
      case 'networking': return <Users size={16} />;
      case 'application': return <Briefcase size={16} />;
      case 'inquiry': return <MessageCircle size={16} />;
      default: return <Mail size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cold-email': return 'bg-red-100 text-red-700';
      case 'follow-up': return 'bg-blue-100 text-blue-700';
      case 'thank-you': return 'bg-green-100 text-green-700';
      case 'networking': return 'bg-purple-100 text-purple-700';
      case 'application': return 'bg-orange-100 text-orange-700';
      case 'inquiry': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
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
            <p className="text-sm text-gray-600">{template.subject}</p>
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
            <TrendingUp size={12} />
            {template.successRate}%
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
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
          <span className="text-xs text-gray-500">{template.usageCount} uses</span>
          <button
            onClick={() => onUse(template)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}
