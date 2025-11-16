import React from 'react';

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

/**
 * CharacterCounter Component
 * 
 * Displays character count with visual feedback
 * Turns red when approaching limit (90%+)
 * 
 * @param current - Current character count
 * @param max - Maximum allowed characters
 * @param className - Optional CSS classes
 */
export function CharacterCounter({ current, max, className = '' }: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 90;
  const isOverLimit = current > max;

  const getColor = () => {
    if (isOverLimit) return '#dc2626'; // Red
    if (isNearLimit) return '#f59e0b'; // Orange
    return '#6b7280'; // Gray
  };

  return (
    <div className={`text-xs font-medium ${className}`} style={{ color: getColor() }}>
      {current} / {max} characters
      {isNearLimit && !isOverLimit && <span className="ml-1">⚠️</span>}
      {isOverLimit && <span className="ml-1">❌</span>}
    </div>
  );
}

