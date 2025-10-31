import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Capability } from '../types';

interface CapabilityCardProps {
  capability: Capability;
  onToggle: (id: string) => void;
}

export const CapabilityCard: React.FC<CapabilityCardProps> = ({ capability, onToggle }) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  return (
    <div
      className="rounded-lg p-4 transition-all flex items-start justify-between"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.borderFocused;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
      }}
    >
      <div className="flex items-start gap-3 flex-1">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: colors.inputBackground }}
        >
          <div style={{ color: colors.badgePurpleText }}>
            {capability.icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 
            className="text-base font-semibold mb-1"
            style={{ color: colors.primaryText }}
          >
            {capability.title}
          </h3>
          <p 
            className="text-sm"
            style={{ color: colors.secondaryText }}
          >
            {capability.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ background: '#10b981' }}
            />
            <span 
              className="text-xs font-medium"
              style={{ color: '#10b981' }}
            >
              Active
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onToggle(capability.id)}
        className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${
          capability.enabled ? 'bg-green-500' : 'bg-gray-400'
        }`}
        style={{ background: capability.enabled ? '#10b981' : colors.border }}
        title={capability.enabled ? `Disable ${capability.title}` : `Enable ${capability.title}`}
        aria-label={capability.enabled ? `Disable ${capability.title}` : `Enable ${capability.title}`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all bg-white shadow-sm`}
          style={{
            transform: capability.enabled ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
};

