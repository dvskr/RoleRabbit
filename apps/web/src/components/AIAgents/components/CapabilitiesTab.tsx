import React from 'react';
import { Zap } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { CapabilityCard } from './CapabilityCard';
import { Capability } from '../types';

interface CapabilitiesTabProps {
  capabilities: Capability[];
  onToggleCapability: (id: string) => void;
}

export const CapabilitiesTab: React.FC<CapabilitiesTabProps> = ({ 
  capabilities, 
  onToggleCapability 
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  if (!colors) return null;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="mb-6">
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Agent Capabilities
        </h2>
        <p 
          className="text-sm"
          style={{ color: colors.secondaryText }}
        >
          Configure what the AI agent can do for you
        </p>
      </div>

      <div className="space-y-3">
        {capabilities.map(cap => (
          <CapabilityCard 
            key={cap.id} 
            capability={cap} 
            onToggle={onToggleCapability}
          />
        ))}
      </div>

      <div 
        className="rounded-lg p-6 mt-6"
        style={{
          background: colors.inputBackground,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-start gap-3">
          <Zap size={24} style={{ color: colors.primaryBlue }} />
          <div className="flex-1">
            <h3 
              className="text-base font-semibold mb-2"
              style={{ color: colors.primaryText }}
            >
              Pro Tip: Combine Multiple Capabilities
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ color: colors.secondaryText }}
            >
              Enable all capabilities for a fully automated job application workflow. The AI will handle everything from resume generation to company research.
            </p>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: colors.badgePurpleBg,
                color: colors.badgePurpleText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgePurpleText;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.badgePurpleBg;
                e.currentTarget.style.color = colors.badgePurpleText;
              }}
            >
              Enable All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

