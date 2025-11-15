/**
 * Portfolio Analytics Component
 * Requirements #7-8: Analytics dashboard with charts and metrics
 */

'use client';

import React, { useMemo } from 'react';
import {
  Eye,
  Users,
  Clock,
  TrendingDown,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export interface AnalyticsData {
  // Summary metrics
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number; // in seconds
  bounceRate: number; // percentage

  // Views over time
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;

  // Traffic sources
  trafficSources: Array<{
    source: string;
    views: number;
    percentage: number;
  }>;

  // Geographic distribution
  geoDistribution: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;

  // Device breakdown
  deviceBreakdown: Array<{
    device: 'desktop' | 'mobile' | 'tablet';
    views: number;
    percentage: number;
  }>;

  // Trends (compared to previous period)
  trends?: {
    views: number; // percentage change
    visitors: number;
    avgTime: number;
    bounceRate: number;
  };
}

interface PortfolioAnalyticsProps {
  data: AnalyticsData;
  loading?: boolean;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}m ${secs}s`;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  subtitle?: string;
}) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Icon className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trendPositive
                ? 'text-green-600 dark:text-green-400'
                : trendNegative
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {trendPositive ? (
              <ArrowUp size={16} />
            ) : trendNegative ? (
              <ArrowDown size={16} />
            ) : null}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function SimpleLineChart({ data }: { data: Array<{ date: string; views: number }> }) {
  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: ((maxViews - d.views) / maxViews) * 80 + 10,
  }));

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Views Over Time
      </h3>
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="0.5"
            />
          ))}
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          {/* Area fill */}
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill="rgba(59, 130, 246, 0.1)"
          />
          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill="rgb(59, 130, 246)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
      {/* Labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-600 dark:text-gray-400">
        <span>{data[0]?.date}</span>
        <span>{data[Math.floor(data.length / 2)]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function SimplePieChart({
  data,
  title,
}: {
  data: Array<{ label: string; value: number; percentage: number }>;
  title: string;
}) {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
  ];

  let currentAngle = 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="flex items-center gap-6">
        {/* Pie chart */}
        <svg className="w-32 h-32" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const angle = (item.percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);

            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 + 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 + 40 * Math.sin(endRad);

            const largeArc = angle > 180 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={colors[index % colors.length]}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SimpleBarChart({
  data,
  title,
}: {
  data: Array<{ label: string; value: number }>;
  title: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortfolioAnalytics({ data, loading = false }: PortfolioAnalyticsProps) {
  const deviceIcons = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
  };

  const deviceData = useMemo(
    () =>
      data.deviceBreakdown.map((d) => ({
        label: d.device.charAt(0).toUpperCase() + d.device.slice(1),
        value: d.views,
        percentage: d.percentage,
      })),
    [data.deviceBreakdown]
  );

  const trafficData = useMemo(
    () =>
      data.trafficSources.map((s) => ({
        label: s.source,
        value: s.views,
        percentage: s.percentage,
      })),
    [data.trafficSources]
  );

  const geoData = useMemo(
    () =>
      data.geoDistribution.map((g) => ({
        label: g.country,
        value: g.views,
      })),
    [data.geoDistribution]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your portfolio performance and visitor insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={data.totalViews.toLocaleString()}
          icon={Eye}
          trend={data.trends?.views}
          subtitle="All-time portfolio views"
        />
        <MetricCard
          title="Unique Visitors"
          value={data.uniqueVisitors.toLocaleString()}
          icon={Users}
          trend={data.trends?.visitors}
          subtitle="Individual people who visited"
        />
        <MetricCard
          title="Avg. Time on Page"
          value={formatDuration(data.avgTimeOnPage)}
          icon={Clock}
          trend={data.trends?.avgTime}
          subtitle="Average session duration"
        />
        <MetricCard
          title="Bounce Rate"
          value={`${data.bounceRate}%`}
          icon={TrendingDown}
          trend={data.trends?.bounceRate}
          subtitle="Visitors who left immediately"
        />
      </div>

      {/* Views Over Time - Line Chart */}
      <SimpleLineChart data={data.viewsOverTime} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources - Pie Chart */}
        <SimplePieChart data={trafficData} title="Traffic Sources" />

        {/* Device Breakdown - Pie Chart */}
        <SimplePieChart data={deviceData} title="Device Breakdown" />
      </div>

      {/* Geographic Distribution - Bar Chart */}
      <SimpleBarChart data={geoData} title="Geographic Distribution" />
    </div>
  );
}
