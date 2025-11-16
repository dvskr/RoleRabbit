'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ThemeColors } from '../../../../contexts/ThemeContext';
import { MAX_LENGTHS } from '../../../../utils/validation';

interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
  colors: ThemeColors;
  nameColorClass?: string;
  titleColorClass?: string;
  error?: string;
  showRequired?: boolean;
}

export default function NameInput({ 
  name, 
  onChange, 
  colors, 
  nameColorClass, 
  titleColorClass,
  error,
  showRequired = false
}: NameInputProps) {
  const currentLength = (name || '').length;
  const isNearLimit = currentLength > MAX_LENGTHS.NAME * 0.8;
  const isOverLimit = currentLength > MAX_LENGTHS.NAME;
  const isEmpty = !name || name.trim() === '';
  const hasError = !!error || (showRequired && isEmpty);

  return (
    <div className="mb-4">
      <input 
        id="name"
        name="name"
        className={`text-xl sm:text-2xl lg:text-3xl font-bold w-1/2 border-none outline-none rounded-xl px-3 py-2 break-words overflow-wrap-anywhere transition-all ${nameColorClass || ''}`}
        style={{
          background: hasError ? '#fef2f2' : 'transparent',
          color: colors.primaryText,
          border: hasError ? `2px solid ${colors.errorRed}` : 'none',
        }}
        value={name || ''} 
        maxLength={MAX_LENGTHS.NAME}
        aria-label="Your name"
        aria-describedby="name-character-count name-error"
        aria-required="true"
        aria-invalid={hasError}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= MAX_LENGTHS.NAME) {
            onChange(value);
          }
        }}
        placeholder="Your Name *"
        onFocus={(e) => {
          e.target.style.outline = `2px solid ${hasError ? colors.errorRed : colors.primaryBlue}40`;
        }}
        onBlur={(e) => {
          e.target.style.outline = 'none';
        }}
      />
      
      {/* Error Message */}
      {hasError && (
        <div 
          id="name-error"
          className="px-3 mt-1 text-xs flex items-center gap-1" 
          style={{ color: colors.errorRed }}
          role="alert"
        >
          <AlertCircle size={12} />
          <span>{error || 'Name is required'}</span>
        </div>
      )}
      
      {/* Character Counter */}
      {isNearLimit && !hasError && (
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

