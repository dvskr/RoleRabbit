import React from 'react';
import { GraduationCap } from 'lucide-react';
import { EMPTY_STATE } from '../constants';

interface EmptyStateProps {
  colors: {
    inputBackground: string;
    tertiaryText: string;
    primaryText: string;
    secondaryText: string;
    primaryBlue: string;
  };
  onAddClick: () => void;
}

export function EmptyState({ colors, onAddClick }: EmptyStateProps) {
  return (
    <div 
      className="text-center py-12 rounded-lg"
      style={{
        background: colors.inputBackground,
      }}
    >
      <GraduationCap size={48} style={{ color: colors.tertiaryText }} className="mx-auto mb-4" />
      <h3 
        className="text-lg font-semibold mb-2"
        style={{ color: colors.primaryText }}
      >
        {EMPTY_STATE.title}
      </h3>
      <p 
        className="mb-4"
        style={{ color: colors.secondaryText }}
      >
        {EMPTY_STATE.description}
      </p>
      <button
        onClick={onAddClick}
        className="px-4 py-2 rounded-lg transition-colors"
        style={{
          background: colors.primaryBlue,
          color: 'white',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        {EMPTY_STATE.buttonText}
      </button>
    </div>
  );
}

