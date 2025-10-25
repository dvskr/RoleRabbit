'use client';

import React from 'react';
import { ProfileSidebarProps } from '../types/profile';

export default function ProfileSidebar({
  activeTab,
  tabs,
  onTabChange
}: ProfileSidebarProps) {
  return (
    <div className="w-72 bg-white/70 backdrop-blur-sm border-r border-gray-200/50 flex-shrink-0 shadow-lg flex flex-col">
      <nav className="flex-1 overflow-y-auto p-6 pb-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-md transform scale-[1.02]'
                      : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm hover:transform hover:scale-[1.01]'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className="font-medium text-sm truncate">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
