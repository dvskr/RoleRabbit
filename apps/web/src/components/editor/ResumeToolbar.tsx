'use client';

import React from 'react';
import {
  Eye,
  EyeOff,
  Download,
  Save,
  Undo,
  Redo,
  Settings,
  Layout,
  Type,
  Palette,
  Sparkles,
  Bot,
  FileText,
  Share2,
  Copy
} from 'lucide-react';

interface ResumeToolbarProps {
  showPreview: boolean;
  onTogglePreview: () => void;
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
  layoutMode: string;
  onLayoutModeChange: (mode: string) => void;
}

const templates = [
  { id: 'ats', name: 'ATS Optimized', description: 'Clean, ATS-friendly design' },
  { id: 'modern', name: 'Modern', description: 'Contemporary layout' },
  { id: 'creative', name: 'Creative', description: 'Unique, eye-catching design' },
  { id: 'executive', name: 'Executive', description: 'Professional, executive style' }
];

const layoutModes = [
  { id: 'one-column', name: 'One Column', description: 'Single column layout' },
  { id: 'two-column', name: 'Two Column', description: 'Two column layout' },
  { id: 'hybrid', name: 'Hybrid', description: 'Mixed layout' }
];

export default function ResumeToolbar({
  showPreview,
  onTogglePreview,
  selectedTemplate,
  onTemplateChange,
  layoutMode,
  onLayoutModeChange
}: ResumeToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Main Actions */}
        <div className="flex items-center gap-3">
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Save size={16} />
            Save
          </button>
          
          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Undo size={16} />
            Undo
          </button>
          
          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Redo size={16} />
            Redo
          </button>
        </div>

        {/* Center - Template and Layout */}
        <div className="flex items-center gap-4">
          {/* Template Selector */}
          <div className="flex items-center gap-2">
            <Layout size={16} className="text-gray-600" />
            <select
              value={selectedTemplate}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Layout Mode */}
          <div className="flex items-center gap-2">
            <Type size={16} className="text-gray-600" />
            <select
              value={layoutMode}
              onChange={(e) => onLayoutModeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {layoutModes.map(mode => (
                <option key={mode.id} value={mode.id}>
                  {mode.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side - Preview and Export */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePreview}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showPreview
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>

          <button className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2">
            <Bot size={16} />
            AI Optimize
          </button>

          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download size={16} />
            Export
          </button>

          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}