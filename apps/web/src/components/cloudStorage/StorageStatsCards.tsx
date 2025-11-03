'use client';

import React from 'react';
import { FileText, UploadCloud, Globe, Star } from 'lucide-react';
import { StorageInfo } from '../../types/cloudStorage';
import { useTheme } from '../../contexts/ThemeContext';

interface StorageStatsCardsProps {
  totalFiles: number;
  storageInfo: StorageInfo;
  publicFilesCount: number;
  starredFilesCount: number;
  colors?: any;
}

const CARD_CONFIG = [
  {
    key: 'totalFiles' as const,
    label: 'Total Files',
    icon: FileText,
    accent: '#6366F1',
  },
  {
    key: 'storageUsed' as const,
    label: 'Storage Used',
    icon: UploadCloud,
    accent: '#22C55E',
  },
  {
    key: 'publicFiles' as const,
    label: 'Public Files',
    icon: Globe,
    accent: '#A855F7',
  },
  {
    key: 'starredFiles' as const,
    label: 'Starred',
    icon: Star,
    accent: '#F97316',
  },
];

export const StorageStatsCards: React.FC<StorageStatsCardsProps> = ({
  totalFiles,
  storageInfo,
  publicFilesCount,
  starredFilesCount,
  colors,
}) => {
  const { theme } = useTheme();
  const palette = colors || theme.colors;

  const cards = CARD_CONFIG.map((card) => {
    switch (card.key) {
      case 'totalFiles':
        return { ...card, value: totalFiles.toString(), helper: 'Files uploaded' };
      case 'storageUsed': {
        const usedLabel = Number.isFinite(storageInfo.used)
          ? `${storageInfo.used.toFixed(1)} GB`
          : '0.0 GB';
        const limitLabel = Number.isFinite(storageInfo.limit)
          ? `${storageInfo.limit.toFixed(1)} GB`
          : '—';
        const percentage = Number.isFinite(storageInfo.percentage)
          ? `${storageInfo.percentage.toFixed(1)}%`
          : '0%';
        return {
          ...card,
          value: usedLabel,
          helper: `${percentage} of ${limitLabel}`,
        };
      }
      case 'publicFiles':
        return { ...card, value: publicFilesCount.toString(), helper: 'Shared publicly' };
      case 'starredFiles':
        return { ...card, value: starredFilesCount.toString(), helper: 'Favorited files' };
      default:
        return card;
    }
  });

  return (
    <div className="px-6 pt-6 pb-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, value, helper, accent }) => (
          <div
            key={key}
            className="rounded-2xl p-4 shadow-inner flex flex-col gap-3 transition-transform"
            style={{
              background: palette.cardBackground,
              border: `1px solid ${palette.border}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `${accent}22`,
                  color: accent,
                }}
              >
                <Icon size={18} />
              </div>
              <span className="text-sm font-semibold" style={{ color: palette.secondaryText }}>
                {label}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold" style={{ color: palette.primaryText }}>
                {value}
              </span>
              <span className="text-xs mt-1" style={{ color: palette.tertiaryText }}>
                {helper}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StorageStatsCards;
