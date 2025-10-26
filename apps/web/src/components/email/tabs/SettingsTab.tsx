'use client';

import React, { useState } from 'react';
import { Settings, Mail, RefreshCw, Check, X } from 'lucide-react';

export default function SettingsTab() {
  const [integrations, setIntegrations] = useState({
    gmail: { connected: false, email: '' },
    outlook: { connected: false, email: '' },
    custom: { connected: false, host: '', port: '', email: '' },
  });

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Integration Settings</h2>
          <p className="text-gray-600">Connect your email accounts to sync messages</p>
        </div>

        {/* Gmail */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Mail size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gmail</h3>
                <p className="text-sm text-gray-600">Connect your Gmail account</p>
              </div>
            </div>
            {integrations.gmail.connected ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check size={20} />
                <span className="font-medium">Connected</span>
              </div>
            ) : (
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Connect
              </button>
            )}
          </div>
          {integrations.gmail.connected && (
            <p className="text-sm text-gray-600">{integrations.gmail.email}</p>
          )}
        </div>

        {/* Outlook */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Outlook</h3>
                <p className="text-sm text-gray-600">Connect your Outlook account</p>
              </div>
            </div>
            {integrations.outlook.connected ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check size={20} />
                <span className="font-medium">Connected</span>
              </div>
            ) : (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Connect
              </button>
            )}
          </div>
          {integrations.outlook.connected && (
            <p className="text-sm text-gray-600">{integrations.outlook.email}</p>
          )}
        </div>

        {/* Custom SMTP */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Settings size={20} className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Custom SMTP</h3>
                <p className="text-sm text-gray-600">Configure custom email server</p>
              </div>
            </div>
            {integrations.custom.connected ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check size={20} />
                <span className="font-medium">Connected</span>
              </div>
            ) : (
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Configure
              </button>
            )}
          </div>
          {integrations.custom.connected && (
            <p className="text-sm text-gray-600">{integrations.custom.email}</p>
          )}
        </div>

        {/* Sync Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Sync Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              <span className="text-gray-700">Auto-sync every hour</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
              <span className="text-gray-700">Sync on app launch</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-gray-700">Desktop notifications for new emails</span>
            </label>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <RefreshCw size={16} />
              <span>Sync Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

