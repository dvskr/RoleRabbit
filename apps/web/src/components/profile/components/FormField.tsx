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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={rows}
          className="w-full px-4 py-3 rounded-xl transition-all duration-200 resize-none"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.borderFocused;
            e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
          disabled={disabled}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl transition-all duration-200"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.borderFocused;
            e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
