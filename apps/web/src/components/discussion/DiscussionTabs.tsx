import React from 'react';
import { Flame, Clock, TrendingUp, Bot, Users } from 'lucide-react';
import { DiscussionTab } from '../../types/discussion';

interface DiscussionTabsProps {
  activeTab: string;
  onTabChange: (tab: 'hot' | 'new' | 'top' | 'ai' | 'communities') => void;
}

const tabs: DiscussionTab[] = [
  {
    id: 'hot',
    label: 'Hot',
    icon: Flame,
    color: 'orange'
  },
  {
    id: 'new',
    label: 'New',
    icon: Clock,
    color: 'blue'
  },
  {
    id: 'top',
    label: 'Top',
    icon: TrendingUp,
    color: 'green'
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Bot,
    color: 'purple'
  },
  {
    id: 'communities',
    label: 'Communities',
    icon: Users,
    color: 'blue'
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
