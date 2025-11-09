import React from 'react';
import { Target } from 'lucide-react';

interface ModeSelectorColors {
  inputBackground: string;
  cardBackground: string;
  badgePurpleText: string;
  badgePurpleBorder: string;
  border: string;
}

interface ModeSelectorProps {
  setAiMode: (mode: string) => void;
  colors: ModeSelectorColors;
}

export default function ModeSelector({ setAiMode, colors }: ModeSelectorProps) {
  return (
    <div>
      <div className="flex rounded-lg p-1" style={{ background: colors.inputBackground }}>
        <button
          onClick={() => setAiMode('tailor')}
          className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all"
          style={{
            background: colors.cardBackground,
            color: colors.badgePurpleText,
            border: `1px solid ${colors.badgePurpleBorder}`,
            boxShadow: `0 1px 2px ${colors.border}20`,
          }}
        >
          <Target size={14} className="inline mr-1.5" />
          Tailor for Job
        </button>
      </div>
    </div>
  );
}

