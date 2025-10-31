'use client';

import React from 'react';
import { Folder, GraduationCap } from 'lucide-react';
import { TabNavigationProps } from './types';

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  filesCount,
  credentialsCount,
  expiringCredentialsCount,
  colors,
}) => {
  return (
    <div 
      className="flex-shrink-0 border-b px-4 py-2.5"
      style={{ 
        borderBottom: `1px solid ${colors.border}`,
        background: colors.headerBackground,
      }}
    >
      <div className="flex gap-1">
        <button
          onClick={() => onTabChange('files')}
          className="flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors"
          style={{
            borderBottomColor: activeTab === 'files' ? colors.primaryBlue : 'transparent',
            color: activeTab === 'files' ? colors.primaryBlue : colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'files') {
              e.currentTarget.style.color = colors.primaryText;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'files') {
              e.currentTarget.style.color = colors.secondaryText;
            }
          }}
        >
          <Folder size={14} />
          <span className="font-medium text-sm">My Files</span>
          <span 
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              background: activeTab === 'files' ? colors.badgeInfoBg : colors.inputBackground,
              color: activeTab === 'files' ? colors.badgeInfoText : colors.secondaryText,
            }}
          >
            {filesCount}
          </span>
        </button>
        <button
          onClick={() => onTabChange('credentials')}
          className="flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors"
          style={{
            borderBottomColor: activeTab === 'credentials' ? colors.primaryBlue : 'transparent',
            color: activeTab === 'credentials' ? colors.primaryBlue : colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'credentials') {
              e.currentTarget.style.color = colors.primaryText;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'credentials') {
              e.currentTarget.style.color = colors.secondaryText;
            }
          }}
        >
          <GraduationCap size={14} />
          <span className="font-medium text-sm">Credentials</span>
          <span 
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              background: activeTab === 'credentials' ? colors.badgeInfoBg : colors.inputBackground,
              color: activeTab === 'credentials' ? colors.badgeInfoText : colors.secondaryText,
            }}
          >
            {credentialsCount}
          </span>
          {expiringCredentialsCount > 0 && (
            <span 
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                background: colors.badgeWarningBg,
                color: colors.badgeWarningText,
              }}
            >
              {expiringCredentialsCount} expiring
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

