'use client';

import React from 'react';
import { FormFieldProps } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  placeholder,
  rows = 1,
  className = ''
}: FormFieldProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        className="block text-sm font-semibold"
        style={{ color: colors.primaryText }}
      >
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={(e) => {
            if (!disabled) {
              onChange(e.target.value);
            }
          }}
          disabled={disabled}
          rows={rows}
          className={`w-full px-4 py-3 rounded-xl transition-all duration-200 resize-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text'}`}
          style={{
            background: disabled ? colors.inputBackground : colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = colors.borderFocused;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => {
            if (!disabled) {
              onChange(e.target.value);
            }
          }}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-xl transition-all duration-200 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text'}`}
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = colors.borderFocused;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
