'use client';

import React from 'react';
import { X, Bell, Moon, Palette } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            
            <div className="pl-8 space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-gray-700">Email notifications for job updates</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-gray-700">Reminder notifications</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-700">Interview reminders</span>
              </label>
            </div>
          </div>

          {/* Display Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Palette size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Display Preferences</h3>
            </div>
            
            <div className="pl-8 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default View Mode
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Table</option>
                  <option>Kanban</option>
                  <option>List</option>
                  <option>Grid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items Per Page
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Theme</h3>
            </div>
            
            <div className="pl-8">
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="radio" name="theme" value="light" defaultChecked className="text-blue-600" />
                  <span className="text-gray-700">Light</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="theme" value="dark" className="text-blue-600" />
                  <span className="text-gray-700">Dark</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="theme" value="auto" className="text-blue-600" />
                  <span className="text-gray-700">Auto (System)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Settings are currently stored locally. To persist settings across devices, 
              connect your account to sync preferences.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

