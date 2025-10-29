import React from 'react';
import { Home, Flame, TrendingUp, Clock, Bot, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface DiscussionTabsProps {
  activeTab: string;
  onTabChange: (tab: 'all' | 'hot' | 'top' | 'new' | 'ai' | 'communities') => void;
}

interface Tab {
  id: 'all' | 'hot' | 'top' | 'new' | 'ai' | 'communities';
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

const tabs: Tab[] = [
  {
    id: 'all',
    label: 'All',
    icon: Home,
    color: 'gray'
  },
  {
    id: 'new',
    label: 'New',
    icon: Clock,
    color: 'blue'
  },
  {
    id: 'hot',
    label: 'Hot',
    icon: Flame,
    color: 'orange'
  },
  {
    id: 'top',
    label: 'Top',
    icon: TrendingUp,
    color: 'green'
  },
  {
    id: 'communities',
    label: 'Communities',
    icon: Users,
    color: 'indigo'
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Bot,
    color: 'purple'
  }
];

export default function DiscussionTabs({ activeTab, onTabChange }: DiscussionTabsProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getTabColor = (color: string) => {
    switch (color) {
      case 'gray': return { bg: colors.inputBackground, text: colors.secondaryText, border: colors.border };
      case 'blue': return { bg: `${colors.primaryBlue}20`, text: colors.activeBlueText, border: `${colors.primaryBlue}40` };
      case 'orange': return { bg: `${colors.badgeWarningBg}20`, text: colors.badgeWarningText, border: `${colors.badgeWarningBorder}40` };
      case 'green': return { bg: `${colors.badgeSuccessBg}20`, text: colors.badgeSuccessText, border: `${colors.badgeSuccessBorder}40` };
      case 'indigo': return { bg: `${colors.badgePurpleBg}20`, text: colors.badgePurpleText, border: `${colors.badgePurpleBorder}40` };
      case 'purple': return { bg: `${colors.badgePurpleBg}20`, text: colors.badgePurpleText, border: `${colors.badgePurpleBorder}40` };
      default: return { bg: colors.inputBackground, text: colors.secondaryText, border: colors.border };
    }
  };

  return (
    <div className="px-4 py-2" style={{ background: colors.headerBackground, borderBottom: `1px solid ${colors.border}` }}>
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          const tabColors = getTabColor(tab.color);
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                background: isActive ? tabColors.bg : 'transparent',
                color: isActive ? tabColors.text : colors.secondaryText,
                border: isActive ? `1px solid ${tabColors.border}` : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = colors.hoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <IconComponent size={16} className="inline" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
