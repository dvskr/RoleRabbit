import React from 'react';
import { Sparkles, X, RefreshCw } from 'lucide-react';

interface PanelHeaderProps {
  colors: any;
  onClose: () => void;
  onClear: () => void;
}

export default function PanelHeader({ colors, onClose, onClear }: PanelHeaderProps) {
  return (
    <div 
      className="px-6 py-4 border-b"
      style={{
        background: `linear-gradient(to right, ${colors.badgePurpleBg}40, ${colors.badgeInfoBg}40)`,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(to bottom right, ${colors.badgePurpleText}, ${colors.primaryBlue})`,
            }}
          >
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: colors.primaryText }}>AI Assistant</h3>
            <p className="text-xs" style={{ color: colors.secondaryText }}>Resume Optimization</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClear} 
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Clear analysis"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Close panel"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

