'use client';

import React from 'react';
import { FileText, Sparkles, Edit3, Eye } from 'lucide-react';
import { CoverLetterTabsProps } from '../types/coverletter';

export default function CoverLetterTabs({ activeTab, onTabChange }: CoverLetterTabsProps) {
  const tabs = [
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'ai', label: 'AI Generator', icon: Sparkles },
    { id: 'custom', label: 'Custom', icon: Edit3 },
    { id: 'preview', label: 'Preview', icon: Eye }
  ] as const;

  return (
    <div className="flex items-center gap-1 mb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={14} className="inline mr-1" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
