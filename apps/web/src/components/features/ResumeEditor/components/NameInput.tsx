'use client';

import React from 'react';
import { ThemeColors } from '../../../contexts/ThemeContext';

interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
  colors: ThemeColors;
}

export default function NameInput({ name, onChange, colors }: NameInputProps) {
  return (
    <input 
      className="text-xl sm:text-2xl lg:text-3xl font-bold w-full border-none outline-none rounded-xl px-3 py-2 mb-4 break-words overflow-wrap-anywhere transition-all" 
      style={{
        background: 'transparent',
        color: colors.primaryText,
      }}
      value={name || ''} 
      onChange={(e) => onChange(e.target.value)}
      placeholder="Your Name"
      onFocus={(e) => {
        e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
      }}
      onBlur={(e) => {
        e.target.style.outline = 'none';
      }}
    />
  );
}

