import React from 'react';
import { cn } from '../../lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className
}: SwitchProps) {
  const sizes = {
    sm: {
      track: 'h-4 w-8',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      track: 'h-5 w-10',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5'
    },
    lg: {
      track: 'h-6 w-12',
      thumb: 'w-5 h-5',
      translate: 'translate-x-6'
    }
  };

  return (
    <label className={cn('flex items-center space-x-2 cursor-pointer', disabled && 'cursor-not-allowed opacity-50', className)}>
      <div
        className={cn(
          'relative rounded-full transition-colors',
          sizes[size].track,
          checked ? 'bg-blue-500' : 'bg-gray-300',
          disabled && 'cursor-not-allowed'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white transition-transform shadow-md',
            sizes[size].thumb,
            checked && sizes[size].translate
          )}
        />
      </div>
      {label && <span className="text-sm">{label}</span>}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
    </label>
  );
}

