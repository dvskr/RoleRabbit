'use client';

import React from 'react';
import {
  FileText,
  Upload,
  Layout,
  Download,
  MessageSquare,
  Mail,
  Briefcase,
  Plus,
  Home as HomeIcon,
  Menu,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  sidebarCollapsed: boolean;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
}

const sidebarItems = [
  { id: 'editor', label: 'Resume Editor', icon: FileText, color: 'text-blue-600' },
  { id: 'home', label: 'Home', icon: HomeIcon, color: 'text-green-600' },
  { id: 'tracker', label: 'Job Tracker', icon: Briefcase, color: 'text-purple-600' },
  { id: 'templates', label: 'Templates', icon: Layout, color: 'text-orange-600' },
  { id: 'discussion', label: 'Discussion', icon: MessageSquare, color: 'text-pink-600' },
  { id: 'email', label: 'Email', icon: Mail, color: 'text-indigo-600' },
  { id: 'storage', label: 'Cloud Storage', icon: Upload, color: 'text-cyan-600' },
];

export default function Sidebar({ activeTab, sidebarCollapsed, onTabChange, onToggleSidebar }: SidebarProps) {
  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">RoleReady</h1>
            </div>
          )}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center ${
                sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'
              } rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102'
                  : 'text-gray-700 hover:bg-white/60 hover:shadow-md'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <Icon size={20} />
              {!sidebarCollapsed && <span className="font-semibold">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          className={`w-full flex items-center ${
            sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'
          } rounded-xl transition-all duration-300 text-gray-700 hover:bg-white/60 hover:shadow-md`}
          title={sidebarCollapsed ? 'Settings' : ''}
        >
          <Settings size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Settings</span>}
        </button>
      </div>
    </div>
  );
}