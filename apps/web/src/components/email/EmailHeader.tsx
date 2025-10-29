'use client';

import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { EmailHeaderProps } from './types/email';
import { useTheme } from '../../contexts/ThemeContext';

export default function EmailHeader({ onCompose, onSync }: EmailHeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className="px-6 py-4 flex-shrink-0" style={{ background: colors.headerBackground, borderBottom: `1px solid ${colors.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm" style={{ color: colors.secondaryText }}>Send professional emails with AI assistance</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onSync}
            className="px-3 py-1.5 rounded-lg transition-colors text-sm"
            style={{ color: colors.primaryText }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <RefreshCw size={14} className="inline mr-1" />
            Sync
          </button>
          <button
            onClick={onCompose}
            className="px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm"
            style={{
              background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(to right, ${colors.primaryBlueHover}, ${colors.badgePurpleText}dd)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})`;
            }}
          >
            <Plus size={14} className="inline mr-1" />
            Compose
          </button>
        </div>
      </div>
    </div>
  );
}
