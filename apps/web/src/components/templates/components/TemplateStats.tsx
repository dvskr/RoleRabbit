/**
 * TemplateStats - Displays statistics about templates
 * Enhanced with popular, new, favorites, and trending metrics
 */

import React from 'react';
import { FileText, Unlock, Crown, Download, TrendingUp, Heart, Sparkles } from 'lucide-react';
import { resumeTemplates } from '../../../data/templates';

interface TemplateStatsProps {
  colors: any;
  favorites?: string[];
  filteredCount?: number;
}

export default function TemplateStats({
  colors,
  favorites = [],
  filteredCount,
}: TemplateStatsProps) {
  const totalTemplates = resumeTemplates.length;
  const freeTemplates = resumeTemplates.filter(t => !t.isPremium).length;
  const premiumTemplates = resumeTemplates.filter(t => t.isPremium).length;
  const totalDownloads = resumeTemplates.reduce((sum, t) => sum + t.downloads, 0);

  // Enhanced stats
  const mostPopular = resumeTemplates.sort((a, b) => b.downloads - a.downloads)[0];
  const newTemplates = resumeTemplates.filter(t => {
    const createdDate = new Date(t.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  }).length;
  const topRated = resumeTemplates.filter(t => t.rating >= 4.5).length;
  const favoritesCount = favorites.length;

  const displayCount = filteredCount !== undefined ? filteredCount : totalTemplates;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
      {/* Total/Filtered Templates */}
      <div
        className="rounded-lg p-3 shadow-sm border transition-all hover:shadow-md"
        style={{
          background: colors.cardBackground,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.secondaryText }}>
              {filteredCount !== undefined && filteredCount < totalTemplates ? 'Showing' : 'Total Templates'}
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.primaryText }}>
              {displayCount}
            </p>
            {filteredCount !== undefined && filteredCount < totalTemplates && (
              <p className="text-[10px] mt-0.5" style={{ color: colors.tertiaryText }}>
                of {totalTemplates} total
              </p>
            )}
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: colors.badgeInfoBg }}
          >
            <FileText size={18} style={{ color: colors.badgeInfoText }} />
          </div>
        </div>
      </div>

      {/* Your Favorites */}
      <div
        className="rounded-lg p-3 shadow-sm border transition-all hover:shadow-md"
        style={{
          background: colors.cardBackground,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.secondaryText }}>
              Your Favorites
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.primaryText }}>
              {favoritesCount}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: colors.tertiaryText }}>
              saved templates
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: colors.badgeErrorBg }}
          >
            <Heart size={18} style={{ color: colors.errorRed }} />
          </div>
        </div>
      </div>

      {/* New Templates */}
      <div
        className="rounded-lg p-3 shadow-sm border transition-all hover:shadow-md"
        style={{
          background: colors.cardBackground,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.secondaryText }}>
              New This Month
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.primaryText }}>
              {newTemplates}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: colors.tertiaryText }}>
              last 30 days
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: colors.badgeSuccessBg }}
          >
            <Sparkles size={18} style={{ color: colors.successGreen }} />
          </div>
        </div>
      </div>

      {/* Top Rated */}
      <div
        className="rounded-lg p-3 shadow-sm border transition-all hover:shadow-md"
        style={{
          background: colors.cardBackground,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.secondaryText }}>
              Top Rated
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.primaryText }}>
              {topRated}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: colors.tertiaryText }}>
              4.5+ stars
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: colors.badgeWarningBg }}
          >
            <TrendingUp size={18} style={{ color: colors.badgeWarningText }} />
          </div>
        </div>
      </div>
    </div>
  );
}

