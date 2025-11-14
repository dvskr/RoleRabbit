/**
 * Usage Analytics Dashboard
 * Comprehensive real-time analytics dashboard for monitoring template usage
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalTemplates: number;
    totalDownloads: number;
    avgRating: number;
    revenue: number;
  };
  timeSeries: {
    date: string;
    views: number;
    downloads: number;
    signups: number;
    revenue: number;
  }[];
  topTemplates: {
    id: string;
    name: string;
    views: number;
    downloads: number;
    rating: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  userActivity: {
    hour: number;
    activeUsers: number;
  }[];
  conversionFunnel: {
    stage: string;
    count: number;
    percentage: number;
  }[];
}

export function UsageAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAnalytics();

    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/usage?range=${timeRange}`);
      const analyticsData = await response.json();
      setData(analyticsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p>Failed to load analytics data</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usage Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time insights into template usage and performance</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            {/* Auto Refresh Toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>

            {/* Refresh Button */}
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
        <MetricCard
          title="Total Users"
          value={data.overview.totalUsers.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon="👥"
        />
        <MetricCard
          title="Active Users"
          value={data.overview.activeUsers.toLocaleString()}
          change="+8.3%"
          trend="up"
          icon="🟢"
        />
        <MetricCard
          title="Total Templates"
          value={data.overview.totalTemplates.toLocaleString()}
          change="+5.2%"
          trend="up"
          icon="📄"
        />
        <MetricCard
          title="Total Downloads"
          value={data.overview.totalDownloads.toLocaleString()}
          change="+15.7%"
          trend="up"
          icon="⬇️"
        />
        <MetricCard
          title="Average Rating"
          value={data.overview.avgRating.toFixed(1)}
          change="+0.3"
          trend="up"
          icon="⭐"
        />
        <MetricCard
          title="Revenue"
          value={`$${(data.overview.revenue / 1000).toFixed(1)}k`}
          change="+22.1%"
          trend="up"
          icon="💰"
        />
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Views & Downloads Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Views & Downloads</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="views"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                name="Views"
              />
              <Area
                type="monotone"
                dataKey="downloads"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Downloads"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ff7300"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Revenue ($)"
              />
              <Line
                type="monotone"
                dataKey="signups"
                stroke="#387908"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="New Signups"
                yAxisId="right"
              />
              <YAxis yAxisId="right" orientation="right" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution & User Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Template Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity by Hour */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Activity by Hour</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.userActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activeUsers" fill="#8884d8" name="Active Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Templates Table */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Top Performing Templates</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topTemplates.map((template, index) => (
                <tr key={template.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {template.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.downloads.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-1">⭐</span>
                      {template.rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {((template.downloads / template.views) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Conversion Funnel</h2>
        <div className="space-y-3">
          {data.conversionFunnel.map((stage, index) => (
            <div key={stage.stage} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                <span className="text-sm text-gray-500">
                  {stage.count.toLocaleString()} ({stage.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div
                  className="bg-blue-600 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium transition-all duration-500"
                  style={{ width: `${stage.percentage}%` }}
                >
                  {stage.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p
            className={`text-sm mt-1 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? '↑' : '↓'} {change}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

export default UsageAnalyticsDashboard;
