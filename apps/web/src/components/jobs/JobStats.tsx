import React from 'react';
import { Briefcase, TrendingUp, CheckCircle, XCircle, Star } from 'lucide-react';
import { JobStats as JobStatsType } from '../../types/job';

interface JobStatsProps {
  stats: JobStatsType;
}

export default function JobStats({ stats }: JobStatsProps) {
  const statsData = [
    {
      label: 'Total Applications',
      value: stats.total,
      icon: Briefcase,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Applied',
      value: stats.applied,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Interviews',
      value: stats.interview,
      icon: CheckCircle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'Offers',
      value: stats.offer,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    {
      label: 'Favorites',
      value: stats.favorites,
      icon: Star,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-gray-900">Job Application Statistics</h2>
        <div className="text-xs text-gray-600">
          {stats.total > 0 ? Math.round(((stats.interview + stats.offer) / stats.total) * 100) : 0}% Success Rate
        </div>
      </div>
      
      <div className="grid grid-cols-6 gap-1">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-md p-1.5 text-center`}
            >
              <div className={`${stat.textColor} mb-0.5 flex justify-center`}>
                <IconComponent size={12} />
              </div>
              <div className={`${stat.textColor} text-sm font-bold mb-0.5`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-600 leading-tight">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ultra Compact Progress Bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full"
            style={{ 
              width: `${stats.total > 0 ? ((stats.interview + stats.offer) / stats.total) * 100 : 0}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
