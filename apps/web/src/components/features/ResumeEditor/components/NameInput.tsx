'use client';

import React from 'react';
import { ThemeColors } from '../../../../contexts/ThemeContext';
import { MAX_LENGTHS } from '../../../../utils/validation';

interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
  colors: ThemeColors;
  nameColorClass?: string;
  titleColorClass?: string;
}

export default function NameInput({ name, onChange, colors, nameColorClass, titleColorClass }: NameInputProps) {
  const currentLength = (name || '').length;
  const isNearLimit = currentLength > MAX_LENGTHS.NAME * 0.8;
  const isOverLimit = currentLength > MAX_LENGTHS.NAME;

  return (
    <div className="mb-4">
      <input 
        className={`text-xl sm:text-2xl lg:text-3xl font-bold w-1/2 border-none outline-none rounded-xl px-3 py-2 break-words overflow-wrap-anywhere transition-all ${nameColorClass || ''}`}
        style={{
          background: 'transparent',
          color: colors.primaryText,
        }}
        value={name || ''} 
        maxLength={MAX_LENGTHS.NAME}
        aria-label="Your name"
        aria-describedby="name-character-count"
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= MAX_LENGTHS.NAME) {
            onChange(value);
          }
        }}
        placeholder="Your Name"
        onFocus={(e) => {
          e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
        }}
        onBlur={(e) => {
          e.target.style.outline = 'none';
        }}
      />
      {isNearLimit && (
        <div 
          id="name-character-count"
          className="px-3 text-xs" 
          style={{ color: isOverLimit ? colors.errorRed : colors.tertiaryText }}
          aria-live="polite"
        >
          {currentLength} / {MAX_LENGTHS.NAME} characters
        </div>
      )}
    </div>
  );
}

