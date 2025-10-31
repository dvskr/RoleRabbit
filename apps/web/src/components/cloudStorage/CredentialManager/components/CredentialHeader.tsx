import React from 'react';
import { GraduationCap } from 'lucide-react';
import { CREDENTIAL_HEADER } from '../constants';

interface CredentialHeaderProps {
  colors: {
    primaryText: string;
    secondaryText: string;
    primaryBlue: string;
  };
  onAddClick: () => void;
}

export function CredentialHeader({ colors, onAddClick }: CredentialHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 
          className="text-xl font-semibold"
          style={{ color: colors.primaryText }}
        >
          {CREDENTIAL_HEADER.title}
        </h2>
        <p 
          className="text-sm mt-1"
          style={{ color: colors.secondaryText }}
        >
          {CREDENTIAL_HEADER.description}
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
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
        <GraduationCap size={18} />
        Add Credential
      </button>
    </div>
  );
}
