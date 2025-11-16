import React from 'react';
import { AlertCircle } from 'lucide-react';

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
  showWarning?: boolean;
  warningThreshold?: number; // Percentage (e.g., 90 for 90%)
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  className = '',
  showWarning = true,
  warningThreshold = 90,
}) => {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= warningThreshold;
  const isOverLimit = current > max;

  const getColorClass = () => {
    if (isOverLimit) {
      return 'text-red-600 dark:text-red-400';
    }
    if (isNearLimit) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${getColorClass()} ${className}`}>
      {showWarning && (isNearLimit || isOverLimit) && (
        <AlertCircle className="h-4 w-4" />
      )}
      <span className="font-medium">
        {current.toLocaleString()} / {max.toLocaleString()}
      </span>
      {isOverLimit && (
        <span className="text-xs">
          ({(current - max).toLocaleString()} over limit)
        </span>
      )}
    </div>
  );
};

export default CharacterCounter;


