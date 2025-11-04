'use client';

import React, { useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PasswordInputProps } from '../types';

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  showPassword,
  onToggleShowPassword,
  placeholder,
  colors,
  id,
  name,
  autoComplete
}) => {
  const reactId = useId();
  const fieldId = id || `password-${reactId.replace(/:/g, '-')}`;
  const fieldName = name || fieldId;

  return (
    <div>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium mb-2"
        style={{ color: colors.primaryText }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          name={fieldName}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete || 'off'}
          className="w-full px-3 py-2 pr-10 rounded-lg transition-all"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.borderFocused;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
          }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
          style={{ color: colors.tertiaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.primaryText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.tertiaryText;
          }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

