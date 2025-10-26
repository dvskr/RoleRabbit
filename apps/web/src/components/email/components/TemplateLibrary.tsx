'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import TemplateCard from './TemplateCard';
import { EmailTemplate, TemplateCategory } from '../types';

// Mock templates
const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Follow-up on Application',
    category: 'Follow-up',
    subject: 'Follow-up on My Application for {{position}}',
    body: 'Dear {{name}},\n\nI wanted to follow up on my application for the {{position}} position at {{company}}.\n\nI am very interested in this opportunity and would appreciate any updates you might have.\n\nThank you for your time and consideration.\n\nBest regards,\n{{yourName}}',
    variables: ['name', 'position', 'company', 'yourName'],
    isCustom: false,
    usageCount: 15,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Thank You After Interview',
    category: 'Thank You',
    subject: 'Thank You - Interview Discussion',
    body: 'Dear {{name}},\n\nThank you for taking the time to speak with me about the {{position}} position today.\n\nI enjoyed our conversation and was impressed by {{company}} and the team.\n\nI am very interested in this opportunity and look forward to hearing from you.\n\nThank you again for your time and consideration.\n\nBest regards,\n{{yourName}}',
    variables: ['name', 'position', 'company', 'yourName'],
    isCustom: false,
    usageCount: 23,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Networking Introduction',
    category: 'Networking',
    subject: 'Introduction - {{name}}',
    body: 'Hi {{name}},\n\nI hope this email finds you well. I came across your profile and was impressed by your work at {{company}}.\n\nI would love to connect and learn more about your experience in {{field}}.\n\nWould you be available for a brief chat sometime next week?\n\nBest regards,\n{{yourName}}',
    variables: ['name', 'company', 'field', 'yourName'],
    isCustom: false,
    usageCount: 8,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

interface TemplateLibraryProps {
  onSelectTemplate?: (template: EmailTemplate) => void;
}

export default function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
  const [templates] = useState<EmailTemplate[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'All'>('All');

  const filteredTemplates = templates.filter(template => {
    if (categoryFilter !== 'All' && template.category !== categoryFilter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return template.name.toLowerCase().includes(searchLower) ||
             template.subject.toLowerCase().includes(searchLower) ||
             template.body.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TemplateCategory | 'All')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Thank You">Thank You</option>
            <option value="Introduction">Introduction</option>
            <option value="Networking">Networking</option>
            <option value="Application">Application</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        {/* Add Template */}
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          <span className="font-medium">Create Template</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No templates found</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={onSelectTemplate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

