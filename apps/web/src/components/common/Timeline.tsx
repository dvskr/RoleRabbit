import React from 'react';
import { cn } from '../../lib/utils';

export interface TimelineItem {
  title: string;
  description?: string;
  date?: string;
  icon?: React.ReactNode;
  status?: 'completed' | 'active' | 'pending';
}

interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
}

export function Timeline({ items, orientation = 'vertical' }: TimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className="flex items-start">
        {items.map((item, index) => (
          <div key={index} className="flex items-start flex-1">
            <div className="flex flex-col items-center mr-2">
              <div
                className={cn(
                  'w-3 h-3 rounded-full border-2',
                  item.status === 'completed' && 'bg-green-500 border-green-500',
                  item.status === 'active' && 'bg-blue-500 border-blue-500',
                  item.status === 'pending' && 'bg-gray-300 border-gray-300'
                )}
              />
              {index < items.length - 1 && (
                <div className="w-0.5 h-16 bg-gray-300 mt-1" />
              )}
            </div>
            <div className="pb-8">
              <h4 className="font-semibold text-sm">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              )}
              {item.date && (
                <p className="text-xs text-gray-500 mt-1">{item.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {items.map((item, index) => (
        <div key={index} className="flex items-start mb-6">
          <div className="flex flex-col items-center mr-4">
            <div
              className={cn(
                'w-10 h-10 rounded-full border-2 flex items-center justify-center',
                item.status === 'completed' && 'bg-green-500 border-green-500',
                item.status === 'active' && 'bg-blue-500 border-blue-500',
                item.status === 'pending' && 'bg-white border-gray-300'
              )}
            >
              {item.icon ? (
                <span className="text-white text-sm">{item.icon}</span>
              ) : (
                <span className="text-xs text-gray-500">{index + 1}</span>
              )}
            </div>
            {index < items.length - 1 && (
              <div className="w-0.5 h-full bg-gray-300 mt-2 min-h-[60px]" />
            )}
          </div>
          <div className="flex-1 pb-6">
            <h4 className="font-semibold">{item.title}</h4>
            {item.description && (
              <p className="text-gray-600 mt-1">{item.description}</p>
            )}
            {item.date && (
              <p className="text-sm text-gray-500 mt-1">{item.date}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
