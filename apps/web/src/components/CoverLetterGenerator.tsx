'use client';

import React, { useState } from 'react';
import { 
  CoverLetterHeader,
  CoverLetterTabs,
  TemplatesTab,
  AITab,
  CustomTab,
  PreviewTab
} from './coverletter/index';

export default function CoverLetterGenerator() {
  const [activeTab, setActiveTab] = useState<'templates' | 'ai' | 'custom' | 'preview'>('templates');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    console.log('Cover letter saved');
  };

  const handleExport = () => {
    console.log('Exporting cover letter');
    // In real app, this would trigger export functionality
  };

  const handlePrint = () => {
    console.log('Printing cover letter');
    // In real app, this would open print dialog
  };

  const handleTabChange = (tab: 'templates' | 'ai' | 'custom' | 'preview') => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'templates':
        return <TemplatesTab />;
      case 'ai':
        return <AITab />;
      case 'custom':
        return <CustomTab />;
      case 'preview':
        return <PreviewTab />;
      default:
        return <TemplatesTab />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex flex-col overflow-hidden">
      <CoverLetterHeader
        onSave={handleSave}
        onExport={handleExport}
        onPrint={handlePrint}
        wordCount={wordCount}
        isSaving={isSaving}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="px-6 py-4 flex-shrink-0">
          <CoverLetterTabs
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