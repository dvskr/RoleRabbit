/**
 * Character Count Component
 * Displays character count with limit and color coding
 */

import React from 'react';

interface CharacterCountProps {
  current: number;
  max: number;
  className?: string;
}

export function CharacterCount({ current, max, className = '' }: CharacterCountProps) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 80;
  const isOverLimit = current > max;

  const colorClass = isOverLimit
    ? 'text-red-600'
    : isNearLimit
    ? 'text-yellow-600'
    : 'text-gray-500';

  return (
    <div className={`text-xs ${colorClass} ${className}`}>
      {current}/{max} characters
    </div>
  );
}

export default CharacterCount;
