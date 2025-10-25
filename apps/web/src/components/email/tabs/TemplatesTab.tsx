'use client';

import React, { useState } from 'react';
import { Search, Filter, Plus, Target, RefreshCw, Heart, Users, Briefcase, MessageCircle, Mail } from 'lucide-react';
import { EmailTemplate } from '../types/email';
import TemplateCard from '../components/TemplateCard';

export default function TemplatesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAITemplates, setShowAITemplates] = useState(false);

  // Mock data - in real app, this would come from props or API
  const templates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Cold Outreach - Software Engineer',
      category: 'cold-email',
      subject: 'Software Engineer Position Inquiry',
      content: 'Hi [Name], I hope this email finds you well. I am writing to express my interest in the Software Engineer position at [Company]. With my background in full-stack development and passion for creating innovative solutions, I believe I would be a valuable addition to your team...',
      aiGenerated: true,
      successRate: 85,
      usageCount: 23,
      tags: ['software', 'engineering', 'cold-email']
    },
    {
      id: '2',
      name: 'Follow-up After Application',
      category: 'follow-up',
      subject: 'Following up on my application for [Position]',
      content: 'Dear [Name], I hope you are doing well. I wanted to follow up on my application for the [Position] role that I submitted on [Date]. I remain very interested in this opportunity and would love to discuss how my skills and experience align with your needs...',
      aiGenerated: false,
      successRate: 72,
      usageCount: 15,
      tags: ['follow-up', 'application', 'professional']
    },
    {
      id: '3',
      name: 'Thank You After Interview',
      category: 'thank-you',
      subject: 'Thank you for the interview opportunity',
      content: 'Dear [Name], Thank you for taking the time to interview me for the [Position] role yesterday. I enjoyed our conversation and learning more about [Company] and the team. I am even more excited about the opportunity to contribute to your mission...',
      aiGenerated: true,
      successRate: 90,
      usageCount: 8,
      tags: ['thank-you', 'interview', 'professional']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Templates', icon: Mail },
    { id: 'cold-email', label: 'Cold Email', icon: Target },
    { id: 'follow-up', label: 'Follow-up', icon: RefreshCw },
    { id: 'thank-you', label: 'Thank You', icon: Heart },
    { id: 'networking', label: 'Networking', icon: Users },
    { id: 'application', label: 'Application', icon: Briefcase },
    { id: 'inquiry', label: 'Inquiry', icon: MessageCircle }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesAI = !showAITemplates || template.aiGenerated;
    
    return matchesSearch && matchesCategory && matchesAI;
  });

  const handleUseTemplate = (template: EmailTemplate) => {
    console.log('Using template:', template);
    // In real app, this would open the composer with the template
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
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
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Mail size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create New Template
          </button>
        </div>
      )}
    </div>
  );
}
