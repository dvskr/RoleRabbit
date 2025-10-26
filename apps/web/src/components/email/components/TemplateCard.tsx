'use client';

import React from 'react';
import { Mail, Star, Edit, Trash2, FileText } from 'lucide-react';
import { EmailTemplate } from '../types';

interface TemplateCardProps {
  template: EmailTemplate;
  onUse?: (template: EmailTemplate) => void;
  onEdit?: (template: EmailTemplate) => void;
  onDelete?: (template: EmailTemplate) => void;
}

export default function TemplateCard({ template, onUse, onEdit, onDelete }: TemplateCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-xs text-gray-500">{template.category}</p>
          </div>
        </div>
        {template.isCustom && (
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
            Custom
          </span>
        )}
      </div>

      {/* Subject Preview */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
        <p className="text-sm text-gray-600 truncate">{template.subject}</p>
      </div>

      {/* Body Preview */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">Body:</p>
        <p className="text-sm text-gray-600 line-clamp-2">{template.body}</p>
      </div>

      {/* Usage Stats */}
      <div className="flex items-center justify-between mb-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Mail size={14} />
          <span>{template.usageCount} uses</span>
        </div>
        {template.isCustom && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit?.(template)}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Edit"
            >
              <Edit size={14} className="text-gray-600" />
            </button>
            <button
              onClick={() => onDelete?.(template)}
              className="p-1.5 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={14} className="text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      {onUse && (
        <button
          onClick={() => onUse(template)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Use Template
        </button>
      )}
    </div>
  );
}
