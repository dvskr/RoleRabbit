/**
 * RecommendedTemplates - Display similar template recommendations
 */

import React from 'react';
import { Sparkles, Star, TrendingUp } from 'lucide-react';
import type { ResumeTemplate } from '../../../data/templates';
import type { ThemeColors } from '../types';
import type { RecommendationScore } from '../utils/templateRecommendations';

interface RecommendedTemplatesProps {
  recommendations: RecommendationScore[];
  colors: ThemeColors;
  onSelectTemplate: (templateId: string) => void;
}

export default function RecommendedTemplates({
  recommendations,
  colors,
  onSelectTemplate,
}: RecommendedTemplatesProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t" style={{ borderColor: colors.border }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} style={{ color: colors.primaryBlue }} />
        <h3 className="text-lg font-semibold" style={{ color: colors.primaryText }}>
          Similar Templates
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recommendations.map(({ template, score, reasons }) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className="p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md text-left"
            style={{
              background: colors.cardBackground,
              borderColor: colors.border,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primaryBlue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            {/* Template Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4
                  className="font-semibold text-sm truncate mb-1"
                  style={{ color: colors.primaryText }}
                >
                  {template.name}
                </h4>
                <p
                  className="text-xs line-clamp-1"
                  style={{ color: colors.secondaryText }}
                >
                  {template.description}
                </p>
              </div>
              {template.isPremium && (
                <span className="ml-2 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded flex-shrink-0">
                  PRO
                </span>
              )}
            </div>

            {/* Template Stats */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Star
                  size={12}
                  className="text-yellow-400 fill-current"
                />
                <span className="text-xs font-medium" style={{ color: colors.secondaryText }}>
                  {template.rating}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={12} style={{ color: colors.tertiaryText }} />
                <span className="text-xs" style={{ color: colors.tertiaryText }}>
                  {(template.downloads / 1000).toFixed(0)}k
                </span>
              </div>
              <div
                className="text-xs font-medium ml-auto"
                style={{ color: colors.primaryBlue }}
              >
                {score}% match
              </div>
            </div>

            {/* Recommendation Reasons */}
            {reasons.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {reasons.slice(0, 2).map((reason, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: `${colors.primaryBlue}10`,
                      color: colors.primaryBlue,
                    }}
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      <p
        className="text-xs mt-3 text-center"
        style={{ color: colors.tertiaryText }}
      >
        Based on category, difficulty, layout, and style preferences
      </p>
    </div>
  );
}
