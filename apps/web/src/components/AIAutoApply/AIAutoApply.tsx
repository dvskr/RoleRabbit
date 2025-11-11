/**
 * AI Auto Apply - Main Component
 * Automated job application system with AI
 */

import React, { useState } from 'react';
import { Zap, Settings, BarChart3, FileText, Layers, User, Sliders } from 'lucide-react';
import JobBoardCredentials from './components/JobBoardCredentials';
import ApplyToJobForm from './components/ApplyToJobForm';
import ApplicationDashboard from './components/ApplicationDashboard';
import BulkApplicationForm from './components/BulkApplicationForm';
import ProfileSettings from './components/ProfileSettings';
import AutomationSettings from './components/AutomationSettings';
import { useTheme } from '../../contexts/ThemeContext';

type Tab = 'apply' | 'bulk' | 'dashboard' | 'credentials' | 'profile' | 'settings';

export default function AIAutoApply() {
  const [activeTab, setActiveTab] = useState<Tab>('apply');
  const { theme } = useTheme();
  const colors = theme?.colors;

  const tabs = [
    { id: 'apply' as Tab, label: 'Apply to Job', icon: Zap },
    { id: 'bulk' as Tab, label: 'Bulk Apply', icon: Layers },
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'credentials' as Tab, label: 'Credentials', icon: FileText },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'settings' as Tab, label: 'Automation', icon: Sliders }
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: colors?.background || '#f9fafb' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Auto Apply</h1>
            <p className="text-sm text-gray-600">Automate your job applications with AI</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'apply' && (
          <div className="max-w-3xl mx-auto">
            <ApplyToJobForm
              onSuccess={() => {
                // Switch to dashboard to see the application
                setActiveTab('dashboard');
              }}
            />
          </div>
        )}

        {activeTab === 'bulk' && <BulkApplicationForm />}

        {activeTab === 'dashboard' && <ApplicationDashboard />}

        {activeTab === 'credentials' && <JobBoardCredentials />}

        {activeTab === 'profile' && <ProfileSettings />}

        {activeTab === 'settings' && <AutomationSettings />}
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>✓ 256-bit Encryption</span>
            <span>✓ Session Persistence</span>
            <span>✓ Rate Limit Protection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>System Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
