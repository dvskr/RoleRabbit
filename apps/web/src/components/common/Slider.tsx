import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface SliderProps {
  min?: number;
  max?: number;
  value?: number;
  defaultValue?: number;
  step?: number;
  onChange?: (value: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  min = 0,
  max = 100,
  value: controlledValue,
  defaultValue = 0,
  step = 1,
  onChange,
  label,
  disabled = false,
  className
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (newValue: number) => {
    if (disabled) return;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    const track = sliderRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newValue = Math.round((x / rect.width) * (max - min) + min);
    
    handleChange(Math.max(min, Math.min(max, newValue)));
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-500">{value}</span>
        </div>
      )}
      
      <div
        ref={sliderRef}
        onClick={handleTrackClick}
        className={cn(
          'relative h-2 bg-gray-200 rounded-full cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <div
          className="absolute h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
        
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer transition-all hover:scale-110',
            disabled && 'cursor-not-allowed hover:scale-100'
          )}
          style={{ left: `${percentage}%`, marginLeft: '-8px' }}
        />
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{min}</span>
        <span className="text-xs text-gray-500">{max}</span>
      </div>
    </div>
  );
}

