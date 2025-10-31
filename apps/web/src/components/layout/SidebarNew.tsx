'use client';

import React from 'react';
import { Home as HomeIcon, User, Cloud, Edit, Layout, Briefcase, MessageSquare, Mail, FileText, Globe, BookOpen, Bot, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { LogoIcon, Logo } from '../common/Logo';
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
            {/* Floating Widget - Collapsed */}
            <div className="relative">
              {/* Outer Glow Ring - Multiple Layers for Depth */}
              <div 
                className="absolute -inset-3 rounded-full opacity-70 blur-xl animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${colors.primaryBlue} 0%, transparent 80%)`,
                }}
              />
              <div 
                className="absolute -inset-2 rounded-full opacity-50 blur-lg"
                style={{
                  background: `radial-gradient(circle, ${colors.badgePurpleText} 0%, transparent 70%)`,
                }}
              />
              {/* Icon Container with Floating Effect */}
              <div 
                className="relative rounded-full transition-all duration-300 hover:scale-110"
                style={{
                  boxShadow: `0 0 30px ${colors.primaryBlue}40, 0 0 60px ${colors.primaryBlue}20, inset 0 0 15px ${colors.primaryBlue}30`,
                }}
              >
                <LogoIcon size={32} />
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="relative px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 12px ${colors.border}20`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 8px 24px ${colors.primaryBlue}30, 0 0 40px ${colors.primaryBlue}20`;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}20`;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            {/* Outer Glow Effect - Behind the Card */}
            <div 
              className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
              style={{
                background: `radial-gradient(circle at center, ${colors.primaryBlue} 0%, transparent 70%)`,
              }}
            />
            
            <div className="flex items-center gap-3 w-full relative z-10">
              {/* Rocket Icon Container with Enhanced Glow */}
              <div className="relative flex-shrink-0">
                {/* Multiple Glow Rings for Depth */}
                <div 
                  className="absolute -inset-3 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{
                    background: `radial-gradient(circle, ${colors.primaryBlue} 0%, transparent 70%)`,
                  }}
                />
                <div 
                  className="absolute -inset-2 rounded-full opacity-40 blur-lg"
                  style={{
                    background: `radial-gradient(circle, ${colors.badgePurpleText} 0%, transparent 60%)`,
                  }}
                />
                {/* Circular Dark Background Container with Glow */}
                <div 
                  className="relative w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(49, 46, 129, 0.95) 100%)',
                    boxShadow: `0 0 25px ${colors.primaryBlue}60, 0 0 50px ${colors.primaryBlue}30, inset 0 0 15px ${colors.primaryBlue}40`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {/* Icon Container with Inner Glow */}
                  <div 
                    className="relative flex items-center justify-center"
                    style={{
                      filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(96, 165, 250, 0.8))',
                    }}
                  >
                    <LogoIcon size={28} />
                  </div>
                </div>
              </div>
              
              {/* Text Content with Tagline */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-lg font-bold leading-tight roleready-gradient">
                  RoleReady
                </span>
                <span 
                  className="text-xs leading-tight mt-0.5"
                  style={{ color: colors.secondaryText }}
                >
                  Your Career Hub
                </span>
              </div>
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
        className="flex-shrink-0 p-4 border-t"
        style={{
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={onToggleSidebar}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.primaryText;
            e.currentTarget.style.borderColor = colors.borderFocused;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.inputBackground;
            e.currentTarget.style.color = colors.secondaryText;
            e.currentTarget.style.borderColor = colors.border;
          }}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

