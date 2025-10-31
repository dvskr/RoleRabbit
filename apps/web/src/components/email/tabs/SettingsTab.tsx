'use client';

import React, { useState } from 'react';
import { Settings, Mail, RefreshCw, Check, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SettingsTab() {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [integrations, setIntegrations] = useState({
    gmail: { connected: false, email: '' },
    outlook: { connected: false, email: '' },
    custom: { connected: false, host: '', port: '', email: '' },
  });

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primaryText }}>Email Integration Settings</h2>
          <p style={{ color: colors.secondaryText }}>Connect your email accounts to sync messages</p>
        </div>

        {/* Gmail */}
        <div className="rounded-lg p-6" style={{ background: colors.cardBackground, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(220, 38, 38, 0.2)' }}>
                <Mail size={20} style={{ color: '#dc2626' }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: colors.primaryText }}>Gmail</h3>
                <p className="text-sm" style={{ color: colors.secondaryText }}>Connect your Gmail account</p>
              </div>
            </div>
            {integrations.gmail.connected ? (
              <div className="flex items-center gap-2" style={{ color: colors.successGreen }}>
                <Check size={20} />
                <span className="font-medium">Connected</span>
              </div>
            ) : (
              <button className="px-4 py-2 text-white rounded-lg transition-colors" style={{ background: '#dc2626' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#b91c1c'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#dc2626'; }}
              >
                Connect
              </button>
            )}
          </div>
          {integrations.gmail.connected && (
            <p className="text-sm" style={{ color: colors.secondaryText }}>{integrations.gmail.email}</p>
          )}
        </div>

        {/* Outlook */}
        <div className="rounded-lg p-6" style={{ background: colors.cardBackground, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(37, 99, 235, 0.2)' }}>
                <Mail size={20} style={{ color: colors.primaryBlue }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: colors.primaryText }}>Outlook</h3>
                <p className="text-sm" style={{ color: colors.secondaryText }}>Connect your Outlook account</p>
              </div>
            </div>
            {integrations.outlook.connected ? (
              <div className="flex items-center gap-2" style={{ color: colors.successGreen }}>
                <Check size={20} />
                <span className="font-medium">Connected</span>
              </div>
            ) : (
              <button className="px-4 py-2 text-white rounded-lg transition-colors" style={{ background: colors.primaryBlue }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
              >
                Connect
              </button>
            )}
          </div>
          {integrations.outlook.connected && (
            <p className="text-sm" style={{ color: colors.secondaryText }}>{integrations.outlook.email}</p>
          )}
        </div>

        {/* Custom SMTP */}
        <div className="rounded-lg p-6" style={{ background: colors.cardBackground, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: colors.inputBackground }}>
                <Settings size={20} style={{ color: colors.tertiaryText }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: colors.primaryText }}>Custom SMTP</h3>
                <p className="text-sm" style={{ color: colors.secondaryText }}>Configure custom email server</p>
              </div>
            </div>
            {integrations.custom.connected ? (
              <div className="flex items-center gap-2" style={{ color: colors.successGreen }}>
                <Check size={20} />
                <span className="font-medium">Connected</span>
              </div>
            ) : (
              <button className="px-4 py-2 text-white rounded-lg transition-colors" style={{ background: colors.tertiaryText }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Configure
              </button>
            )}
          </div>
          {integrations.custom.connected && (
            <p className="text-sm" style={{ color: colors.secondaryText }}>{integrations.custom.email}</p>
          )}
        </div>

        {/* Sync Settings */}
        <div className="rounded-lg p-6" style={{ background: colors.cardBackground, border: `1px solid ${colors.border}` }}>
          <h3 className="font-semibold mb-4" style={{ color: colors.primaryText }}>Sync Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded" style={{ accentColor: colors.primaryBlue }} />
              <span style={{ color: colors.primaryText }}>Auto-sync every hour</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded" style={{ accentColor: colors.primaryBlue }} />
              <span style={{ color: colors.primaryText }}>Sync on app launch</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded" style={{ accentColor: colors.primaryBlue }} />
              <span style={{ color: colors.primaryText }}>Desktop notifications for new emails</span>
            </label>
            <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{ background: colors.primaryBlue }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
            >
              <RefreshCw size={16} />
              <span>Sync Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

