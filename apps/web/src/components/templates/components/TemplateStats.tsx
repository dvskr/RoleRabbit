/**
 * TemplateStats - Displays statistics about templates
 */

import React from 'react';
import { FileText, Unlock, Crown, Download } from 'lucide-react';
import { resumeTemplates } from '../../../data/templates';
import type { ThemeColors } from '../types';

interface TemplateStatsProps {
  colors: ThemeColors;
}

export default function TemplateStats({ colors }: TemplateStatsProps) {
  const totalTemplates = resumeTemplates.length;
  const freeTemplates = resumeTemplates.filter(t => !t.isPremium).length;
  const premiumTemplates = resumeTemplates.filter(t => t.isPremium).length;
  const totalDownloads = resumeTemplates.reduce((sum, t) => sum + t.downloads, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
      <div
        className="rounded-lg p-2 shadow-sm border"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium" style={{ color: colors.secondaryText }}>
              Total
            </p>
            <p className="text-sm font-bold" style={{ color: colors.primaryText }}>
              {totalTemplates}
            </p>
          </div>
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: colors.badgeInfoBg }}
          >
            <FileText size={12} style={{ color: colors.badgeInfoText }} />
          </div>
        </div>
      </div>

      <div
        className="rounded-lg p-2 shadow-sm border"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: colors.secondaryText }}>
              Free
            </p>
            <p className="text-lg font-bold" style={{ color: colors.primaryText }}>
              {freeTemplates}
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: colors.badgeSuccessBg }}
          >
            <Unlock size={16} style={{ color: colors.badgeSuccessText }} />
          </div>
        </div>
      </div>

      <div
        className="rounded-lg p-2 shadow-sm border"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: colors.secondaryText }}>
              Premium
            </p>
            <p className="text-lg font-bold" style={{ color: colors.primaryText }}>
              {premiumTemplates}
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: colors.badgeWarningBg }}
          >
            <Crown size={16} style={{ color: colors.badgeWarningText }} />
          </div>
        </div>
      </div>

      <div
        className="rounded-lg p-2 shadow-sm border"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: colors.secondaryText }}>
              Downloads
            </p>
            <p className="text-lg font-bold" style={{ color: colors.primaryText }}>
              {(totalDownloads / 1000).toFixed(0)}k
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: colors.badgePurpleBg }}
          >
            <Download size={16} style={{ color: colors.badgePurpleText }} />
          </div>
        </div>
      </div>
    </div>
  );
}

