'use client';

import React, { useState } from 'react';
import {
  EmailHeader,
  EmailTabs,
  InboxTab,
  ComposeTab,
  TemplatesTab,
  CampaignsTab,
  AnalyticsTab
} from './email/index';

export default function Email() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'templates' | 'campaigns' | 'analytics'>('inbox');

  const handleCompose = () => {
    setActiveTab('compose');
  };

  const handleSync = () => {
    console.log('Syncing emails...');
    // In real app, this would sync with email service
  };

  const handleTabChange = (tab: 'inbox' | 'compose' | 'templates' | 'campaigns' | 'analytics') => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inbox':
        return <InboxTab />;
      case 'compose':
        return <ComposeTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'campaigns':
        return <CampaignsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <InboxTab />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex flex-col overflow-hidden">
      <EmailHeader
        onCompose={handleCompose}
        onSync={handleSync}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="px-6 py-4 flex-shrink-0">
          <EmailTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}