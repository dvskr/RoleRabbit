'use client';

import React from 'react';
import { RefreshCw, Settings, TrendingUp, Users, Briefcase, Award } from 'lucide-react';
import { DashboardMetrics, DashboardConfig } from '../types/dashboard';

interface DashboardHeaderProps {
  metrics: DashboardMetrics;
  isLoading: boolean;
  onRefresh: () => void;
  config: DashboardConfig;
  onUpdateConfig: (config: Partial<DashboardConfig>) => void;
}

export function DashboardHeader({
  metrics,
  isLoading,
  onRefresh,
  config,
  onUpdateConfig
}: DashboardHeaderProps) {
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  
  const quickStats = [
    {
      label: 'Applications',
      value: metrics.totalApplications,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Response Rate',
      value: formatPercentage(metrics.responseRate),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Interviews',
      value: metrics.pipelineHealth.interview,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Offers',
      value: metrics.pipelineHealth.offer,
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Stats - Compact Design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-md p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
