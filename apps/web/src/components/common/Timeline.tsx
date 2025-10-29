import React from 'react';
import { Circle } from 'lucide-react';

interface TimelineItem {
  title: string;
  description?: string;
  date?: string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      {items.map((item, index) => (
        <div key={index} className="relative pl-8 pb-8">
          {index !== items.length - 1 && (
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
          )}
          <div className="absolute left-0 top-1 flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 rounded-full">
            {item.icon || <Circle className="w-4 h-4 text-gray-400" />}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{item.title}</h3>
            {item.description && (
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            )}
            {item.date && (
              <p className="mt-1 text-xs text-gray-400">{item.date}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

