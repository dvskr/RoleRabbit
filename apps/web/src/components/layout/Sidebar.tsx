'use client';

import React from 'react';
import { Sparkles, Home as HomeIcon, User, Cloud, Edit, Layout, Briefcase, MessageSquare, Mail, FileText, Plus, Upload } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  sidebarCollapsed: boolean;
  onTabChange: (tab: string) => void;
  onShowNewResumeModal: () => void;
  onShowImportModal: () => void;
}

export default function Sidebar({
  activeTab,
  sidebarCollapsed,
  onTabChange,
  onShowNewResumeModal,
  onShowImportModal
}: SidebarProps) {
  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-gradient-to-b from-blue-50/30 to-purple-50/30 backdrop-blur-xl border-r border-blue-200/30 shadow-xl flex flex-col mt-2`}>
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
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'home' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Home' : ''}
        >
          <HomeIcon size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Home</span>}
        </button>
        <button 
          onClick={() => onTabChange('profile')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'profile' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Profile' : ''}
        >
          <User size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Profile</span>}
        </button>
        <button 
          onClick={() => onTabChange('storage')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'storage' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Cloud Storage' : ''}
        >
          <Cloud size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Cloud Storage</span>}
        </button>
        <button 
          onClick={() => onTabChange('editor')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'editor' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Resume Editor' : ''}
        >
          <Edit size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Resume Editor</span>}
        </button>
        <button 
          onClick={() => onTabChange('templates')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'templates' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Templates' : ''}
        >
          <Layout size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Templates</span>}
        </button>
        <button 
          onClick={() => onTabChange('tracker')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'tracker' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Job Tracker' : ''}
        >
          <Briefcase size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Job Tracker</span>}
        </button>
        <button 
          onClick={() => onTabChange('discussion')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'discussion' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Discussion' : ''}
        >
          <MessageSquare size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Discussion</span>}
        </button>
        <button 
          onClick={() => onTabChange('email')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'email' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Email' : ''}
        >
          <Mail size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Email</span>}
        </button>
        <button 
          onClick={() => onTabChange('cover-letter')} 
          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'cover-letter' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
          title={sidebarCollapsed ? 'Cover Letter' : ''}
        >
          <FileText size={20} />
          {!sidebarCollapsed && <span className="font-semibold">Cover Letter</span>}
        </button>
      </nav>
      
      <div className={`${sidebarCollapsed ? 'p-2' : 'p-3'} border-t border-blue-200/20 bg-gradient-to-r from-blue-100/20 to-purple-100/20`}>
        <button 
          onClick={onShowNewResumeModal} 
          className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3.5'} rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} font-semibold mb-2`}
          title={sidebarCollapsed ? 'New Resume' : ''}
        >
          <Plus size={20} />
          {!sidebarCollapsed && <span>New Resume</span>}
        </button>
        <button 
          onClick={onShowImportModal} 
          className={`w-full border-2 border-gray-200 bg-white text-gray-700 ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-2.5'} rounded-xl hover:border-green-500 hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} font-semibold ${sidebarCollapsed ? 'text-base' : 'text-sm'}`}
          title={sidebarCollapsed ? 'Import Resume' : ''}
        >
          <Upload size={18} />
          {!sidebarCollapsed && <span>Import Resume</span>}
        </button>
      </div>
    </div>
  );
}
