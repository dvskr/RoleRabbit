/**
 * Portfolio Management Component
 * Combines AI Portfolio Builder and Portfolio Management
 */

'use client';

import React, { useState } from 'react';
import { Briefcase, Sparkles, Grid, List } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PortfolioListContainer, TemplateGalleryContainer } from './portfolio';

// Lazy load the AI Portfolio Builder
const AIPortfolioBuilder = dynamic(
  () => import('./portfolio-generator/AIPortfolioBuilder'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading AI Builder...</p>
        </div>
      </div>
    ),
  }
);

type TabType = 'my-portfolios' | 'ai-builder' | 'templates';

export default function PortfolioManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('my-portfolios');

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* My Portfolios Tab */}
            <button
              onClick={() => setActiveTab('my-portfolios')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'my-portfolios'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Grid size={18} />
              My Portfolios
            </button>

            {/* AI Builder Tab */}
            <button
              onClick={() => setActiveTab('ai-builder')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'ai-builder'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Sparkles size={18} />
              AI Builder
            </button>

            {/* Templates Tab */}
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'templates'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <List size={18} />
              Templates
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'my-portfolios' && (
            <div>
              <PortfolioListContainer />
            </div>
          )}

          {activeTab === 'ai-builder' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Portfolio Builder
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Let our AI help you create a stunning portfolio in minutes.
                </p>
              </div>
              <AIPortfolioBuilder />
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Portfolio Templates
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse and select from our collection of professional portfolio templates.
                </p>
              </div>
              <TemplateGalleryContainer
                onSelectTemplate={(template) => {
                  console.log('Selected template:', template);
                  // TODO: Navigate to create portfolio with template
                }}
                onPreview={(template) => {
                  console.log('Preview template:', template);
                  // TODO: Open preview modal
                }}
                userIsPremium={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

