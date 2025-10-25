'use client';

import React from 'react';
import { Mail, Send, FileText, Users, BarChart3 } from 'lucide-react';
import { EmailTabsProps } from '../types/email';

export default function EmailTabs({ activeTab, onTabChange }: EmailTabsProps) {
  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: Mail },
    { id: 'compose', label: 'Compose', icon: Send },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'campaigns', label: 'Campaigns', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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
