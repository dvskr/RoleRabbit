'use client';

import React from 'react';
import { Lightbulb, TrendingUp, Target, Clock } from 'lucide-react';

export function DashboardFooter() {
  const tips = [
    {
      icon: Target,
      title: 'Set Daily Goals',
      description: 'Aim for 3-5 applications per day to maintain momentum',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Clock,
      title: 'Follow Up Promptly',
      description: 'Send follow-ups within 7 days for better response rates',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor your metrics to identify what\'s working',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: Lightbulb,
      title: 'Stay Positive',
      description: 'Job searching is a marathon, not a sprint. Stay consistent!',
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-yellow-600" />
          <h3 className="text-sm font-semibold text-gray-900">Daily Tips</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className={`p-1.5 rounded-md ${tip.color}`}>
                <tip.icon size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-gray-900 mb-1">
                  {tip.title}
                </h4>
                <p className="text-xs text-gray-600">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
