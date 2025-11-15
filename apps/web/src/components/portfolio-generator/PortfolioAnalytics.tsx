/**
 * Portfolio Analytics Component
 * Section 1.7 requirement #3: Shows analytics empty state when no data is available
 * Demonstrates:
 * - Empty state when portfolio is not published
 * - Analytics dashboard with views, clicks, and visitor data
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Eye, MousePointer, Users, TrendingUp, Calendar } from 'lucide-react';
import { NoAnalyticsEmptyState } from '../empty-state';
import { LoadingSpinner } from '../loading/LoadingSpinner';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  avgViewDuration: string;
  lastUpdated: string;
  isPublished: boolean;
}

interface PortfolioAnalyticsProps {
  portfolioId?: string;
  onPublish?: () => void;
}

export function PortfolioAnalytics({ portfolioId, onPublish }: PortfolioAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [portfolioId]);

  const loadAnalytics = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // In a real app: const response = await portfolioApi.getAnalytics(portfolioId);
      // Simulate unpublished portfolio (no analytics data)
      const mockData: AnalyticsData = {
        totalViews: 0,
        totalClicks: 0,
        uniqueVisitors: 0,
        avgViewDuration: '0:00',
        lastUpdated: new Date().toISOString(),
        isPublished: false, // Change to true to see analytics data
      };

      setData(mockData);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    console.log('Navigate to publish step');
    if (onPublish) {
      onPublish();
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Analytics</h2>

      {/* Loading State */}
      {isLoading && <LoadingSpinner size="lg" text="Loading analytics..." />}

      {/* Empty State (Section 1.7 requirement #3) */}
      {!isLoading && data && !data.isPublished && (
        <NoAnalyticsEmptyState onPublish={handlePublish} />
      )}

      {/* Analytics Dashboard */}
      {!isLoading && data && data.isPublished && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Views */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Eye className="text-blue-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {data.totalViews.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>

            {/* Total Clicks */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MousePointer className="text-purple-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {data.totalClicks.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Clicks</p>
            </div>

            {/* Unique Visitors */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {data.uniqueVisitors.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Unique Visitors</p>
            </div>

            {/* Avg View Duration */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="text-orange-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {data.avgViewDuration}
              </p>
              <p className="text-sm text-gray-600">Avg. Duration</p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Last updated:</span>{' '}
              {new Date(data.lastUpdated).toLocaleString()}
            </p>
          </div>

          {/* Placeholder for Charts */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioAnalytics;
