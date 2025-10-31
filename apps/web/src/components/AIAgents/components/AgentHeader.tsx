import React from 'react';
import { Bot, Settings } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface AgentHeaderProps {
  isAgentEnabled: boolean;
  setIsAgentEnabled: (enabled: boolean) => void;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({ isAgentEnabled, setIsAgentEnabled }) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  // Compute aria-checked value explicitly
  const ariaChecked = isAgentEnabled ? 'true' : 'false';

  return (
    <div 
      className="px-6 py-4 border-b flex items-center justify-between"
      style={{ borderBottom: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center gap-3">
        {/* AI Icon */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: colors.badgePurpleBg }}
        >
          <Bot size={20} style={{ color: colors.badgePurpleText }} />
        </div>
        
        {/* Title and Tagline */}
        <div className="flex flex-col">
          <h1 
            className="text-lg font-bold leading-tight"
            style={{ color: colors.primaryText }}
          >
            AI Agent
          </h1>
          <p 
            className="text-xs leading-tight"
            style={{ color: colors.secondaryText }}
          >
            Your intelligent job application automation assistant
          </p>
        </div>
      </div>

      {/* Toggle, Status and Settings */}
      <div className="flex items-center gap-4">
        {/* Toggle Switch */}
        <div className="flex items-center gap-2">
          <span 
            className="text-sm font-medium"
            style={{ color: colors.secondaryText }}
          >
            {isAgentEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            onClick={() => setIsAgentEnabled(!isAgentEnabled)}
            className="relative inline-flex items-center rounded-full transition-colors focus:outline-none"
            style={{
              width: '44px',
              height: '24px',
              background: isAgentEnabled ? colors.primaryBlue : colors.inputBackground,
              border: `1px solid ${isAgentEnabled ? colors.primaryBlue : colors.border}`,
            }}
            role="switch"
            aria-checked={isAgentEnabled}
            aria-label={isAgentEnabled ? "Disable AI Agent" : "Enable AI Agent"}
            title={isAgentEnabled ? "Disable AI Agent" : "Enable AI Agent"}
          >
            <span
              className="inline-block rounded-full bg-white shadow-sm transform transition-transform"
              style={{
                width: '18px',
                height: '18px',
                transform: isAgentEnabled ? 'translateX(22px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>

        {/* Status Indicator */}
        {isAgentEnabled && (
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ background: '#10b981' }}
            />
            <span 
              className="text-sm font-medium"
              style={{ color: colors.primaryText }}
            >
              Active
            </span>
          </div>
        )}

        {/* Settings Button */}
        <button
          className="p-1.5 rounded transition-all"
          style={{ color: colors.tertiaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.secondaryText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.tertiaryText;
          }}
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
};

