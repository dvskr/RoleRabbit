'use client';

import React from 'react';
import { Home as HomeIcon, User, Cloud, Edit, Layout, Briefcase, MessageSquare, Mail, FileText, Globe, BookOpen, Bot, Menu, Users } from 'lucide-react';
import { LogoIcon, Logo } from '../common/Logo';

interface SidebarProps {
  activeTab: string;
  sidebarCollapsed: boolean;
  onTabChange: (tab: string) => void;
}

interface NavSection {
  title: string;
  items: { id: string; icon: React.ComponentType<any>; label: string }[];
}

export default function SidebarNew({
  activeTab,
  sidebarCollapsed,
  onTabChange
}: SidebarProps) {
  const navSections: NavSection[] = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', icon: HomeIcon, label: 'Dashboard' },
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'storage', icon: Cloud, label: 'My Files' },
      ],
    },
    {
      title: 'PREPARE',
      items: [
        { id: 'editor', icon: Edit, label: 'Resume Builder' },
        { id: 'cover-letter', icon: FileText, label: 'Cover Letter' },
        { id: 'portfolio', icon: Globe, label: 'Portfolio Site' },
        { id: 'templates', icon: Layout, label: 'Templates' },
      ],
    },
    {
      title: 'APPLY',
      items: [
        { id: 'agents', icon: Bot, label: 'AI Auto-Apply' },
        { id: 'tracker', icon: Briefcase, label: 'Job Tracker' },
      ],
    },
    {
      title: 'CONNECT',
      items: [
        { id: 'email', icon: Mail, label: 'Email Hub' },
        { id: 'discussion', icon: MessageSquare, label: 'Community' },
        { id: 'learning', icon: BookOpen, label: 'Learning Hub' },
      ],
    },
  ];

  return (
    <div className={`h-full bg-[#11181C] border-r border-[#27272A] flex flex-col transition-all duration-300 ${
      sidebarCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo/Header */}
      <div className="h-16 border-b border-[#27272A] flex items-center px-6">
        {sidebarCollapsed ? (
          <div className="w-full flex justify-center">
            <LogoIcon size={32} />
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <LogoIcon size={32} />
            <span className="text-lg font-semibold bg-gradient-to-r from-[#a855f7] to-[#60a5fa] bg-clip-text text-transparent">
              RoleReady
            </span>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            {!sidebarCollapsed && (
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-3">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center transition-all duration-200 rounded-lg ${
                      sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'
                    } ${
                      isActive
                        ? 'bg-[#34B27B] text-white shadow-lg shadow-[#34B27B]/20'
                        : 'text-[#A0A0A0] hover:bg-[#1A1F26] hover:text-white'
                    }`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <Icon size={20} />
                    {!sidebarCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

