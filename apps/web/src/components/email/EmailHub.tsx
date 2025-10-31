'use client';

import React, { useState } from 'react';
import { Mail, Users, Inbox, FileText, Settings, BarChart3 } from 'lucide-react';
import ContactsTab from './tabs/ContactsTab';
import ComposerTab from './tabs/ComposerTab';
import InboxTab from './tabs/InboxTab';
import TemplatesTab from './tabs/TemplatesTab';
import SettingsTab from './tabs/SettingsTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import { useTheme } from '../../contexts/ThemeContext';

export type EmailHubTab = 'contacts' | 'composer' | 'inbox' | 'templates' | 'settings' | 'analytics';

const tabs: Array<{ id: EmailHubTab; label: string; icon: any }> = [
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'composer', label: 'Composer', icon: Mail },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function EmailHub() {
  const [activeTab, setActiveTab] = useState<EmailHubTab>('contacts');
  const { theme } = useTheme();
  const colors = theme.colors;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'contacts':
        return <ContactsTab />;
      case 'composer':
        return <ComposerTab />;
      case 'inbox':
        return <InboxTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'settings':
        return <SettingsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <ContactsTab />;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: colors.background }}>
      {/* Header - Removed title here */}

      <div className="flex-1 flex min-h-0">
        {/* Sidebar Tabs */}
        <div className="w-64 flex-shrink-0 overflow-y-auto" style={{ background: colors.sidebarBackground, borderRight: `1px solid ${colors.border}` }}>
          <nav className="p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: activeTab === tab.id ? `${colors.primaryBlue}20` : 'transparent',
                    color: activeTab === tab.id ? colors.activeBlueText : colors.primaryText,
                    border: activeTab === tab.id ? `1px solid ${colors.primaryBlue}40` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = colors.hoverBackground;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden" style={{ background: colors.background }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

