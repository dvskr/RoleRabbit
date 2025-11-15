/**
 * Portfolio Card Component
 * Displays portfolio with thumbnail, metadata, and actions
 * Requirements #2
 */

'use client';

import React from 'react';
import {
  Eye,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Calendar,
  Globe,
  Lock,
} from 'lucide-react';

export interface Portfolio {
  id: string;
  name: string;
  thumbnail?: string;
  status: 'published' | 'draft';
  viewCount: number;
  lastUpdated: Date | string;
  publishedUrl?: string;
  isPasswordProtected?: boolean;
}

interface PortfolioCardProps {
  portfolio: Portfolio;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onViewLive?: (id: string) => void;
}

/**
 * Portfolio Card Component
 * Shows thumbnail, name, status, views, last updated, and actions
 */
export const PortfolioCard = React.memo(function PortfolioCard({
  portfolio,
  onEdit,
  onDuplicate,
  onDelete,
  onViewLive,
}: PortfolioCardProps) {
  const lastUpdated =
    portfolio.lastUpdated instanceof Date
      ? portfolio.lastUpdated
      : new Date(portfolio.lastUpdated);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatViews = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden group border border-gray-200 dark:border-gray-700">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 overflow-hidden">
        {portfolio.thumbnail ? (
          <img
            src={portfolio.thumbnail}
            alt={`${portfolio.name} thumbnail`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe size={48} className="text-gray-400 dark:text-gray-600" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {portfolio.status === 'published' ? (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Published
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full shadow-lg">
              Draft
            </span>
          )}
        </div>

        {/* Password Protected Indicator */}
        {portfolio.isPasswordProtected && (
          <div className="absolute top-3 right-3">
            <div className="bg-orange-500 text-white p-2 rounded-full shadow-lg">
              <Lock size={14} />
            </div>
          </div>
        )}

        {/* Quick View Overlay */}
        {portfolio.status === 'published' && portfolio.publishedUrl && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              onClick={() => onViewLive?.(portfolio.id)}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
              aria-label={`View ${portfolio.name} live`}
            >
              <ExternalLink size={16} />
              View Live
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
          {portfolio.name}
        </h3>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{formatViews(portfolio.viewCount)} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(lastUpdated)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onEdit(portfolio.id)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            aria-label={`Edit ${portfolio.name}`}
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => onDuplicate(portfolio.id)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            aria-label={`Duplicate ${portfolio.name}`}
          >
            <Copy size={16} />
            Duplicate
          </button>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(portfolio.id)}
          className="w-full mt-2 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          aria-label={`Delete ${portfolio.name}`}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
});
