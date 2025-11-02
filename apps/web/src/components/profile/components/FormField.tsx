'use client';

import React, { useId, useMemo } from 'react';
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
  className = '',
  id,
  name
}: FormFieldProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const reactId = useId(); // React 18+ hook for unique IDs

  const { fieldId, fieldName } = useMemo(() => {
    if (id) {
      return {
        fieldId: id,
        fieldName: name || id
      };
    }

    const normalizedLabel = typeof label === 'string' && label.trim().length > 0
      ? label.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : 'field';

    const generatedId = `field-${normalizedLabel}-${reactId.replace(/[:]/g, '-')}`;

    return {
      fieldId: generatedId,
      fieldName: name || generatedId
    };
  }, [id, name, label, reactId]);

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-semibold"
        style={{ color: colors.primaryText }}
      >
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={fieldId}
          name={fieldName}
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
          id={fieldId}
          name={fieldName}
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
