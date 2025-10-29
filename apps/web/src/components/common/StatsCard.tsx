import React from 'react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatsCard({ title, value, change, icon, trend, className }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const changeColors = {
    up: 'bg-green-50 text-green-600',
    down: 'bg-red-50 text-red-600'
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center space-x-1 mt-1">
              <span className={cn('text-sm font-medium', trendColors[trend || 'neutral'])}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              </span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                change.isPositive ? changeColors.up : changeColors.down
              )}>
                {change.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
