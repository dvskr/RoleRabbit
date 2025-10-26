import React from 'react';
import { Home, Flame, TrendingUp, Clock, Bot, Users } from 'lucide-react';

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
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive 
                  ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200` 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <IconComponent size={14} className="inline" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
