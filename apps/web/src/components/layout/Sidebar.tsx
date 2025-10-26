'use client';

import React from 'react';
import { Sparkles, Home as HomeIcon, User, Cloud, Edit, Layout, Briefcase, MessageSquare, Mail, FileText } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  sidebarCollapsed: boolean;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({
  activeTab,
  sidebarCollapsed,
  onTabChange
}: SidebarProps) {
  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-gradient-to-b from-blue-50/30 to-purple-50/30 border-r border-blue-200/30 shadow-xl flex flex-col`}>
      <div className={`${sidebarCollapsed ? 'p-3' : 'p-4'} border-b border-blue-200/20 bg-gradient-to-r from-blue-100/20 to-purple-100/20`}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RoleReady</h1>
            </div>
          )}
        </div>
      </div>
      
      <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-3'} space-y-1 overflow-y-auto`}>
        <button 
          onClick={() => onTabChange('home')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl ${activeTab === 'home' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Home' : ''}
        >
          <HomeIcon size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Home</span>}
        </button>
        <button 
          onClick={() => onTabChange('profile')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl ${activeTab === 'profile' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 ' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Profile' : ''}
        >
          <User size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Profile</span>}
        </button>
        <button 
          onClick={() => onTabChange('storage')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl ${activeTab === 'storage' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 ' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Cloud Storage' : ''}
        >
          <Cloud size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Cloud Storage</span>}
        </button>
        <button 
          onClick={() => onTabChange('editor')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl ${activeTab === 'editor' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 ' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Resume Editor' : ''}
        >
          <Edit size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Resume Editor</span>}
        </button>
        <button 
          onClick={() => onTabChange('templates')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl ${activeTab === 'templates' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 ' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Templates' : ''}
        >
          <Layout size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Templates</span>}
        </button>
        <button 
          onClick={() => onTabChange('tracker')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl ${activeTab === 'tracker' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 ' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Job Tracker' : ''}
        >
          <Briefcase size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Job Tracker</span>}
        </button>
        <button 
          onClick={() => onTabChange('discussion')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl ${activeTab === 'discussion' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 ' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Discussion' : ''}
        >
          <MessageSquare size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Discussion</span>}
        </button>
        <button 
          onClick={() => onTabChange('email')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl ${activeTab === 'email' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 ' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Email' : ''}
        >
          <Mail size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Email</span>}
        </button>
        <button 
          onClick={() => onTabChange('cover-letter')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl ${activeTab === 'cover-letter' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 ' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Cover Letter' : ''}
        >
          <FileText size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Cover Letter</span>}
        </button>
      </nav>
    </div>
  );
}
