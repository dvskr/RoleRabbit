import React from 'react';
import { MessageSquare, Zap, Brain, Clock } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeTasksCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  activeTasksCount 
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  const tabs = [
    { id: 'chat' as TabType, label: 'Chat', icon: MessageSquare },
    { id: 'active-tasks' as TabType, label: 'Active Tasks', icon: Zap, badge: activeTasksCount },
    { id: 'capabilities' as TabType, label: 'Capabilities', icon: Brain },
    { id: 'history' as TabType, label: 'History', icon: Clock }
  ];

  return (
    <div 
      className="px-6 py-2 border-b flex items-center gap-1"
      style={{ borderBottom: `1px solid ${colors.border}` }}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-t-md transition-all flex items-center gap-2 text-sm font-medium relative"
            style={{
              color: isActive ? colors.primaryText : colors.secondaryText,
              background: isActive ? colors.cardBackground : 'transparent',
            }}
          >
            <Icon size={16} />
            {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span 
                className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: colors.badgePurpleBg, color: colors.badgePurpleText }}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: colors.badgePurpleText }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

