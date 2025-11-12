'use client';

import React from 'react';
import { Home as HomeIcon, User, Cloud, Edit, Layout, Briefcase, MessageSquare, Mail, FileText, Globe, Bot, Menu, ChevronLeft, ChevronRight, Zap, Sparkles, Workflow } from 'lucide-react';
import { RabbitLogo, RabbitLogoWithText } from '../ui/RabbitLogo';
import { useTheme } from '../../contexts/ThemeContext';
import NavigationItem from './NavigationItem';

// Map to handle both original IDs and mapped tab names for active state checking
const getActiveTabId = (itemId: string, activeTab: string): boolean => {
  // Direct match
  if (activeTab === itemId) return true;
  
  // Handle mapped names
  const tabMapping: Record<string, string[]> = {
    'tracker': ['jobs', 'tracker'],
    'agents': ['ai-agents', 'agents'],
  };
  
  const mappedVariants = tabMapping[itemId] || [itemId];
  return mappedVariants.includes(activeTab);
};

interface SidebarProps {
  activeTab: string;
  sidebarCollapsed: boolean;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
}

interface NavSection {
  title: string;
  items: { id: string; icon: React.ComponentType<any>; label: string }[];
}

export default function SidebarNew({
  activeTab,
  sidebarCollapsed,
  onTabChange,
  onToggleSidebar
}: SidebarProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

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
        { id: 'portfolio', icon: Globe, label: 'Portfolio Builder' },
        { id: 'templates', icon: Layout, label: 'Templates' },
      ],
    },
    {
      title: 'APPLY',
      items: [
        { id: 'ai-auto-apply', icon: Zap, label: 'AI Auto Apply' },
        { id: 'workflows', icon: Workflow, label: 'Workflows' },
        { id: 'agents', icon: Sparkles, label: 'AI Agents' },
        { id: 'tracker', icon: Briefcase, label: 'Job Tracker' },
      ],
    },
    {
      title: 'CONNECT',
      items: [
        { id: 'email', icon: Mail, label: 'Email Hub' },
        { id: 'discussion', icon: MessageSquare, label: 'Community' },
      ],
    },
  ];

  return (
    <div 
      className={`h-full border-r flex flex-col ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
      style={{
        background: colors.sidebarBackground,
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${colors.border}`,
      }}
    >
      {/* Logo/Header - Floating Widget Style */}
      <div 
        className="px-4 py-4"
      >
            {sidebarCollapsed ? (
              <div className="w-full flex justify-center">
                <RabbitLogo size={100} animated={true} />
              </div>
            ) : (
              <div className="flex items-center gap-1 w-full -ml-2">
                <RabbitLogo size={80} animated={true} />
                  <div className="flex flex-col flex-1 min-w-0 -ml-2">
                    <span className="text-xl font-bold leading-tight">
                      <span className="text-gray-800 dark:text-white">Role</span><span className="text-green-400">Rabbit</span>
                    </span>
                    <span 
                      className="text-sm leading-tight mt-0.5"
                      style={{ color: colors.secondaryText }}
                    >
                      Your Career Companion
                    </span>
                  </div>
                </div>
            )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navSections.map((section, sectionIndex) => {
          // Determine section color for accent bars and headers
          const getSectionColor = (title: string): { accent: string; header: string } => {
            switch (title) {
              case 'WORKSPACE':
                return { accent: '#a855f7', header: '#a855f7' }; // Purple
              case 'PREPARE':
                return { accent: '#3b82f6', header: '#3b82f6' }; // Blue
              case 'APPLY':
                return { accent: 'linear-gradient(to bottom, #06b6d4, #14b8a6)', header: '#14b8a6' }; // Teal gradient for bar, solid teal for header
              case 'CONNECT':
                return { accent: '#8b5cf6', header: '#8b5cf6' }; // Purple
              default:
                return { accent: '#6b7280', header: '#6b7280' }; // Gray fallback
            }
          };

          const sectionColors = getSectionColor(section.title);
          const sectionColor = sectionColors.accent;
          const headerColor = sectionColors.header;

          return (
            <div key={sectionIndex} className="space-y-2">
              {!sidebarCollapsed && (
                <h3 
                  className="text-xs uppercase tracking-wider px-3 mb-2"
                  style={{ 
                    color: headerColor,
                    fontWeight: 600 
                  }}
                >
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  // Check both original ID and mapped tab names for active state
                  const isActive = getActiveTabId(item.id, activeTab);
                  
                  return (
                    <NavigationItem
                      key={item.id}
                      id={item.id}
                      icon={item.icon}
                      label={item.label}
                      isActive={isActive}
                      isCollapsed={sidebarCollapsed}
                      sectionColor={sectionColor}
                      onClick={() => onTabChange(item.id)}
                      colors={colors}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle Button - Bottom of Sidebar */}
      <div 
        className="flex-shrink-0 flex justify-center p-1.5 border-t"
        style={{
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={onToggleSidebar}
          className="p-1 rounded transition-all duration-200 flex items-center justify-center"
          style={{
            background: 'transparent',
            color: colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.primaryText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.secondaryText;
          }}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

