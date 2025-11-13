/**
 * Performance Monitor Component
 *
 * Dev tool for monitoring template filtering/sorting performance.
 * Shows cache stats, render counts, and timing information.
 *
 * Usage:
 * ```tsx
 * {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
 * ```
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, X, TrendingUp, Database, Clock } from 'lucide-react';
import { getCacheStats, clearAllCaches } from '../../../utils/templatePerformance';
import { useThemeColors } from '../../../hooks/useThemeColors';

export interface PerformanceMonitorProps {
  /**
   * Position of the monitor
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Whether to show by default
   * @default false
   */
  defaultOpen?: boolean;
}

export default function PerformanceMonitor({
  position = 'bottom-right',
  defaultOpen = false,
}: PerformanceMonitorProps) {
  const colors = useThemeColors();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [stats, setStats] = useState(getCacheStats());
  const [renderCount, setRenderCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Track renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getCacheStats());
      setLastUpdate(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClearCaches = useCallback(() => {
    clearAllCaches();
    setStats(getCacheStats());
  }, []);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} z-50 p-3 rounded-full shadow-lg transition-transform hover:scale-110`}
        style={{
          background: colors.primaryBlue,
          color: '#ffffff',
        }}
        title="Open Performance Monitor"
      >
        <Activity size={20} />
      </button>
    );
  }

  const totalCacheSize = stats.filter.size + stats.search.size + stats.sort.size;
  const totalCacheCapacity = stats.filter.maxSize + stats.search.maxSize + stats.sort.maxSize;
  const cacheUsagePercent = (totalCacheSize / totalCacheCapacity) * 100;

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 rounded-lg shadow-2xl p-4 w-80`}
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} style={{ color: colors.primaryBlue }} />
          <h3 className="font-semibold text-sm" style={{ color: colors.primaryText }}>
            Performance Monitor
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded hover:bg-opacity-10"
          style={{ color: colors.secondaryText }}
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Render Count */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: colors.hoverBackground }}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} style={{ color: colors.infoBlue }} />
          <span className="text-xs font-medium" style={{ color: colors.secondaryText }}>
            Component Renders
          </span>
        </div>
        <div className="text-2xl font-bold" style={{ color: colors.primaryText }}>
          {renderCount}
        </div>
      </div>

      {/* Cache Stats */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Database size={14} style={{ color: colors.primaryBlue }} />
          <span className="text-xs font-medium" style={{ color: colors.secondaryText }}>
            Cache Status
          </span>
        </div>

        {/* Cache Usage Bar */}
        <div className="mb-3">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: colors.border }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${cacheUsagePercent}%`,
                background:
                  cacheUsagePercent > 80
                    ? colors.warningYellow
                    : cacheUsagePercent > 90
                    ? colors.errorRed
                    : colors.successGreen,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: colors.tertiaryText }}>
              {totalCacheSize} / {totalCacheCapacity}
            </span>
            <span className="text-xs" style={{ color: colors.tertiaryText }}>
              {cacheUsagePercent.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Individual Cache Stats */}
        <div className="space-y-2">
          <CacheStat
            label="Filter Cache"
            size={stats.filter.size}
            maxSize={stats.filter.maxSize}
            ttl={stats.filter.ttl}
            colors={colors}
          />
          <CacheStat
            label="Search Cache"
            size={stats.search.size}
            maxSize={stats.search.maxSize}
            ttl={stats.search.ttl}
            colors={colors}
          />
          <CacheStat
            label="Sort Cache"
            size={stats.sort.size}
            maxSize={stats.sort.maxSize}
            ttl={stats.sort.ttl}
            colors={colors}
          />
        </div>
      </div>

      {/* Last Update */}
      <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: colors.tertiaryText }}>
        <Clock size={12} />
        <span>Updated {Math.floor((Date.now() - lastUpdate) / 1000)}s ago</span>
      </div>

      {/* Actions */}
      <button
        onClick={handleClearCaches}
        className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: colors.errorRed,
          color: '#ffffff',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        Clear All Caches
      </button>

      {/* Info */}
      <div
        className="mt-3 p-2 rounded text-xs"
        style={{
          background: `${colors.infoBlue}15`,
          color: colors.infoBlue,
          border: `1px solid ${colors.infoBlue}30`,
        }}
      >
        <strong>Dev Mode Only:</strong> This monitor is automatically hidden in production.
      </div>
    </div>
  );
}

// Helper component for individual cache stats
function CacheStat({
  label,
  size,
  maxSize,
  ttl,
  colors,
}: {
  label: string;
  size: number;
  maxSize: number;
  ttl: number;
  colors: any;
}) {
  const percent = (size / maxSize) * 100;

  return (
    <div
      className="p-2 rounded"
      style={{
        background: `${colors.primaryBlue}08`,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium" style={{ color: colors.primaryText }}>
          {label}
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background:
              percent > 80
                ? colors.badgeWarningBg
                : percent > 50
                ? colors.badgeInfoBg
                : colors.badgeSuccessBg,
            color:
              percent > 80
                ? colors.badgeWarningText
                : percent > 50
                ? colors.badgeInfoText
                : colors.badgeSuccessText,
          }}
        >
          {size}/{maxSize}
        </span>
      </div>
      <div className="text-xs" style={{ color: colors.tertiaryText }}>
        TTL: {(ttl / 1000).toFixed(0)}s
      </div>
    </div>
  );
}
