'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Target, Clock } from 'lucide-react';
import { DashboardMetrics } from '../../types/dashboard';

interface ProgressMetricsProps {
  metrics: DashboardMetrics;
  isLoading: boolean;
}

export function ProgressMetrics({
  metrics,
  isLoading
}: ProgressMetricsProps) {
  const getTrendIcon = (value: number, previousValue: number = 0) => {
    if (value > previousValue) {
      return <TrendingUp size={14} className="text-green-600" />;
    } else if (value < previousValue) {
      return <TrendingDown size={14} className="text-red-600" />;
    } else {
      return <Minus size={14} className="text-gray-600" />;
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  
  const pipelineStages = [
    { key: 'applied', label: 'Applied', value: metrics.pipelineHealth.applied, color: 'bg-blue-500' },
    { key: 'phoneScreen', label: 'Phone Screen', value: metrics.pipelineHealth.phoneScreen, color: 'bg-purple-500' },
    { key: 'interview', label: 'Interview', value: metrics.pipelineHealth.interview, color: 'bg-orange-500' },
    { key: 'offer', label: 'Offer', value: metrics.pipelineHealth.offer, color: 'bg-green-500' },
    { key: 'rejected', label: 'Rejected', value: metrics.pipelineHealth.rejected, color: 'bg-red-500' }
  ];

  const maxValue = Math.max(...pipelineStages.map(stage => stage.value));

  // Calculate dynamic height based on content
  const getDynamicHeight = () => {
    if (typeof window !== 'undefined') {
      const baseHeight = 100; // Header height
      const metricCardsHeight = 80; // Metric cards height
      const pipelineHeight = 150; // Pipeline section height
      const weeklyHeight = 80; // Weekly activity height
      const maxHeight = window.innerHeight * 0.4; // Max 40% of viewport height
      const calculatedHeight = baseHeight + metricCardsHeight + pipelineHeight + weeklyHeight;
      return Math.min(calculatedHeight, maxHeight);
    }
    return 600;
  };

  const metricCards = [
    {
      title: 'Response Rate',
      value: formatPercentage(metrics.responseRate),
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: getTrendIcon(metrics.responseRate, 10) // Mock previous value
    },
    {
      title: 'Interview Rate',
      value: formatPercentage(metrics.interviewRate),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: getTrendIcon(metrics.interviewRate, 8) // Mock previous value
    },
    {
      title: 'Offer Rate',
      value: formatPercentage(metrics.offerRate),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: getTrendIcon(metrics.offerRate, 1.5) // Mock previous value
    },
    {
      title: 'Avg Response Time',
      value: `${metrics.averageResponseTime}d`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: getTrendIcon(metrics.averageResponseTime, 6) // Mock previous value
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col" style={{ height: `${getDynamicHeight()}px` }}>
      {/* Header - Compact */}
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Progress Metrics</h3>
        <p className="text-xs text-gray-600">Your job search performance</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics - Compact */}
            <div className="grid grid-cols-2 gap-2">
              {metricCards.map((card, index) => (
                <div
                  key={index}
                  className="p-2 rounded border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className={`p-1.5 rounded ${card.bgColor}`}>
                      <card.icon size={14} className={card.color} />
                    </div>
                    {card.trend}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{card.value}</div>
                  <div className="text-xs text-gray-600">{card.title}</div>
                </div>
              ))}
            </div>

            {/* Pipeline Health - Compact */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-2">Pipeline Health</h4>
              <div className="space-y-1.5">
                {pipelineStages.map((stage) => (
                  <div key={stage.key} className="flex items-center gap-2">
                    <div className="w-16 text-xs text-gray-600 text-right">{stage.label}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${stage.color} transition-all duration-500`}
                        style={{ 
                          width: maxValue > 0 ? `${(stage.value / maxValue) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                    <div className="w-6 text-xs text-gray-900 text-right font-medium">
                      {stage.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Activity - Compact */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-2">This Week</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-1.5 bg-blue-50 rounded">
                  <div className="text-sm font-semibold text-blue-600">
                    {metrics.weeklyActivity.applications}
                  </div>
                  <div className="text-xs text-gray-600">Applications</div>
                </div>
                <div className="text-center p-1.5 bg-green-50 rounded">
                  <div className="text-sm font-semibold text-green-600">
                    {metrics.weeklyActivity.responses}
                  </div>
                  <div className="text-xs text-gray-600">Responses</div>
                </div>
                <div className="text-center p-1.5 bg-purple-50 rounded">
                  <div className="text-sm font-semibold text-purple-600">
                    {metrics.weeklyActivity.interviews}
                  </div>
                  <div className="text-xs text-gray-600">Interviews</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
