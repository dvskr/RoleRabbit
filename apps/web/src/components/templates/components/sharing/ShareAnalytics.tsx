/**
 * ShareAnalytics Component
 * Displays analytics and usage statistics for a shared template link
 */

import React, { useEffect } from 'react';
import { Eye, Download, Edit, TrendingUp, Users, Clock } from 'lucide-react';
import { useTemplateSharing, type ShareAnalytics as ShareAnalyticsType } from '../../hooks/useTemplateSharing';

interface ShareAnalyticsProps {
  shareId: string;
  className?: string;
}

export const ShareAnalytics: React.FC<ShareAnalyticsProps> = ({
  shareId,
  className = '',
}) => {
  const { analytics, loading, error, fetchShareAnalytics } = useTemplateSharing({
    templateId: '', // Not needed for analytics fetch
  });

  useEffect(() => {
    if (shareId) {
      fetchShareAnalytics(shareId);
    }
  }, [shareId, fetchShareAnalytics]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 h-24" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-600 mb-2">Failed to load analytics</div>
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={() => fetchShareAnalytics(shareId)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // No data
  if (!analytics) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-2" />
        <p className="text-sm text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const totalActivity = analytics.totalViews + analytics.totalDownloads + analytics.totalEdits;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Views */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Views</span>
            <Eye className="text-blue-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-blue-900">{analytics.totalViews}</div>
          <div className="text-xs text-blue-700 mt-1">Total page views</div>
        </div>

        {/* Downloads */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Downloads</span>
            <Download className="text-green-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-green-900">{analytics.totalDownloads}</div>
          <div className="text-xs text-green-700 mt-1">Template downloads</div>
        </div>

        {/* Edits */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Edits</span>
            <Edit className="text-purple-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-purple-900">{analytics.totalEdits}</div>
          <div className="text-xs text-purple-700 mt-1">Edit sessions</div>
        </div>
      </div>

      {/* Top Users */}
      {analytics.topUsers && analytics.topUsers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-gray-600" size={18} />
            <h3 className="font-semibold text-gray-900">Top Users</h3>
          </div>
          <div className="space-y-3">
            {analytics.topUsers.map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.userName}</div>
                    <div className="text-xs text-gray-500">
                      {user.accessCount} {user.accessCount === 1 ? 'access' : 'accesses'}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-blue-600">#{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Access Log */}
      {analytics.recentAccess && analytics.recentAccess.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-gray-600" size={18} />
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            {analytics.recentAccess.slice(0, 10).map((access) => {
              const actionIcons = {
                VIEW: <Eye size={14} className="text-blue-600" />,
                DOWNLOAD: <Download size={14} className="text-green-600" />,
                EDIT: <Edit size={14} className="text-purple-600" />,
              };

              const actionColors = {
                VIEW: 'bg-blue-50 text-blue-800 border-blue-200',
                DOWNLOAD: 'bg-green-50 text-green-800 border-green-200',
                EDIT: 'bg-purple-50 text-purple-800 border-purple-200',
              };

              return (
                <div
                  key={access.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    {access.userName ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {access.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-500">?</span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {access.userName || 'Anonymous User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(access.accessedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${
                        actionColors[access.action]
                      }`}
                    >
                      {actionIcons[access.action]}
                      {access.action}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {analytics.recentAccess.length > 10 && (
            <div className="mt-3 text-center">
              <span className="text-sm text-gray-500">
                Showing 10 of {analytics.recentAccess.length} recent activities
              </span>
            </div>
          )}
        </div>
      )}

      {/* Views by Date (Simple List) */}
      {analytics.viewsByDate && analytics.viewsByDate.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-gray-600" size={18} />
            <h3 className="font-semibold text-gray-900">Views Over Time</h3>
          </div>
          <div className="space-y-2">
            {analytics.viewsByDate.slice(0, 7).map((item) => {
              const maxCount = Math.max(...analytics.viewsByDate.map((d) => d.count));
              const percentage = (item.count / maxCount) * 100;

              return (
                <div key={item.date} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                      {item.count} views
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalActivity === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No activity yet</h3>
          <p className="text-xs text-gray-600">
            Share your link to start tracking analytics
          </p>
        </div>
      )}
    </div>
  );
};

export default ShareAnalytics;
