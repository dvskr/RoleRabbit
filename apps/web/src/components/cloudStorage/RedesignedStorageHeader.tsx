'use client';

import React from 'react';
import { RefreshCcw, Cloud } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { StorageInfo } from '../../types/cloudStorage';

interface RedesignedStorageHeaderProps {
  storageInfo: StorageInfo;
  onRefresh: () => void;
  colors?: any;
}

export const RedesignedStorageHeader: React.FC<RedesignedStorageHeaderProps> = ({
  storageInfo,
  onRefresh,
  colors,
}) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;

  return (
    <div
      className="px-6 py-5 flex flex-col gap-4"
      style={{
        background: palette.headerBackground ?? palette.cardBackground,
        borderBottom: `1px solid ${palette.border}`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: palette.badgeInfoBg ?? palette.inputBackground,
              }}
            >
              <Cloud size={18} style={{ color: palette.primaryBlue }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: palette.primaryText }}>
              My Files
            </h1>
          </div>
          <p className="text-sm" style={{ color: palette.secondaryText }}>
            Manage your files and documents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
            style={{
              background: palette.inputBackground,
              color: palette.secondaryText,
              border: `1px solid ${palette.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = palette.hoverBackground ?? palette.inputBackground;
              e.currentTarget.style.color = palette.primaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = palette.inputBackground;
              e.currentTarget.style.color = palette.secondaryText;
            }}
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedesignedStorageHeader;
