import React from 'react';
import { cn } from '../../lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Rating({ 
  value, 
  max = 5, 
  onChange, 
  readOnly = false,
  size = 'md',
  className 
}: RatingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (newValue: number) => {
    if (!readOnly && onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {Array.from({ length: max }).map((_, index) => {
        const rating = index + 1;
        const filled = rating <= Math.round(value);
        
        return (
          <button
            key={index}
            onClick={() => handleClick(rating)}
            disabled={readOnly}
            className={cn(
              'transition-colors',
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
              sizes[size]
            )}
          >
            <svg
              className={cn(
                'transition-colors',
                filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
              )}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

