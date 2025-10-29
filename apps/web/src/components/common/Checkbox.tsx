import React from 'react';
import { cn } from '../../lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
  size = 'md',
  className
}: CheckboxProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <label className={cn('flex items-center space-x-2 cursor-pointer', disabled && 'cursor-not-allowed opacity-50', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        ref={(input) => {
          if (input) input.indeterminate = indeterminate;
        }}
        className="sr-only"
      />
      <div
        className={cn(
          'border-2 rounded transition-colors flex items-center justify-center',
          checked && 'bg-blue-500 border-blue-500',
          !checked && 'border-gray-300',
          disabled && 'cursor-not-allowed',
          sizes[size]
        )}
      >
        {checked && !indeterminate && (
          <svg className="w-3/4 h-3/4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {indeterminate && (
          <svg className="w-3/4 h-3/4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

