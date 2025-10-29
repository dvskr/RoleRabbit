import React from 'react';
import { cn } from '../../lib/utils';

interface RadioProps {
  value: string;
  selectedValue?: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Radio({
  value,
  selectedValue,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className
}: RadioProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const isSelected = value === selectedValue;

  return (
    <label className={cn('flex items-center space-x-2 cursor-pointer', disabled && 'cursor-not-allowed opacity-50', className)}>
      <input
        type="radio"
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={cn(
          'border-2 rounded-full transition-all flex items-center justify-center',
          isSelected && 'border-blue-500',
          !isSelected && 'border-gray-300',
          sizes[size]
        )}
      >
        {isSelected && (
          <div className="w-1/2 h-1/2 bg-blue-500 rounded-full" />
        )}
      </div>
      <span className="text-sm">{label}</span>
    </label>
  );
}

export interface RadioGroupProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({ options, value, onChange, disabled, className }: RadioGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          selectedValue={value}
          onChange={onChange}
          label={option.label}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

