/**
 * TemplateCardList - List view template card component
 * Optimized with React.memo to prevent unnecessary re-renders
 */

import React from 'react';
import {
  Star,
  Download,
  Eye,
  Crown,
  Heart,
  CheckCircle,
  Plus,
  X,
  Clock,
} from 'lucide-react';
import type { ResumeTemplate } from '../../../data/templates';
import type { ThemeColors } from '../types';
import { getDifficultyColor } from '../utils/templateHelpers';
import TemplatePreview from './TemplatePreview';
import Tooltip from './Tooltip';

interface TemplateCardListProps {
  template: ResumeTemplate;
  isAdded: boolean;
  isFavorite: boolean;
  addedTemplateId: string | null;
  colors: ThemeColors;
  onFavorite: (templateId: string) => void;
  onPreview: (templateId: string) => void;
  onUse: (templateId: string) => void;
  onRemove?: (templateId: string) => void;
}

function TemplateCardList({
  template,
  isAdded,
  isFavorite,
  addedTemplateId,
  colors,
  onFavorite,
  onPreview,
  onUse,
  onRemove,
}: TemplateCardListProps) {
  const difficultyColor = getDifficultyColor(template.difficulty, colors);

  return (
    <div
      className="rounded-lg p-4 transition-all duration-200"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.borderFocused;
        e.currentTarget.style.boxShadow = `0 4px 12px ${colors.borderFocused}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start gap-4">
        {/* Template Preview */}
        <div className="relative flex-shrink-0 overflow-hidden">
          <TemplatePreview template={template} size="small" variant="list" />
          {template.isPremium && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Crown size={10} />
              Premium
            </div>
          )}
        </div>

        {/* Template Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-base mb-1 truncate"
                style={{ color: colors.primaryText }}
              >
                {template.name}
              </h3>
              <p
                className="text-sm mb-2 line-clamp-2"
                style={{ color: colors.secondaryText }}
              >
                {template.description}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Tooltip
                content={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                position="left"
              >
                <button
                  onClick={() => onFavorite(template.id)}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: isFavorite ? colors.errorRed : colors.tertiaryText,
                    background: isFavorite ? colors.badgeErrorBg : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isFavorite) {
                      e.currentTarget.style.background = colors.hoverBackground;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFavorite) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </Tooltip>
              <Tooltip content="Preview template in fullscreen" position="left">
                <button
                  onClick={() => onPreview(template.id)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: colors.tertiaryText }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  aria-label="Preview template"
                >
                  <Eye size={14} />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div
              className="flex items-center gap-1 text-sm"
              style={{ color: colors.secondaryText }}
            >
              <Star size={12} style={{ color: '#fbbf24' }} fill="#fbbf24" />
              <span className="font-medium">{template.rating}</span>
            </div>
            <div
              className="flex items-center gap-1 text-sm"
              style={{ color: colors.secondaryText }}
            >
              <Download size={12} />
              <span className="font-medium">
                {(template.downloads / 1000).toFixed(0)}k
              </span>
            </div>
            <div
              className="flex items-center gap-1 text-sm"
              style={{ color: colors.secondaryText }}
            >
              <Clock size={12} />
              <span>{template.createdAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="px-2 py-1 rounded-full text-xs font-semibold"
              style={{
                color: difficultyColor.text,
                background: difficultyColor.bg,
                border: `1px solid ${difficultyColor.border}`,
              }}
            >
              {template.difficulty}
            </span>
            <span
              className="px-2 py-1 rounded-full text-xs font-semibold"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
              }}
            >
              {template.layout}
            </span>
            <span
              className="px-2 py-1 rounded-full text-xs font-semibold"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
              }}
            >
              {template.colorScheme}
            </span>
          </div>

          {/* Tags - Display first 4 tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3 flex-wrap">
              {template.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    background: `${colors.primaryBlue}15`,
                    color: colors.primaryBlue,
                    border: `1px solid ${colors.primaryBlue}30`,
                  }}
                  title={tag}
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 4 && (
                <span
                  className="text-xs"
                  style={{ color: colors.tertiaryText }}
                  title={`${template.tags.slice(4).join(', ')}`}
                >
                  +{template.tags.length - 4} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {template.features.slice(0, 3).map(feature => (
                <span
                  key={feature}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    background: colors.badgeInfoBg,
                    color: colors.badgeInfoText,
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {!isAdded && (
                <Tooltip content="Add this template to your resume editor" position="top">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUse(template.id);
                    }}
                    className={`px-3 py-2 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 relative overflow-hidden ${
                      addedTemplateId === template.id
                        ? 'bg-green-500 shadow-lg scale-105'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {addedTemplateId === template.id ? (
                      <>
                        <CheckCircle size={14} className="animate-bounce" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Add
                      </>
                    )}
                  </button>
                </Tooltip>
              )}
              {isAdded && (
                <div className="px-3 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  <span>Already Added</span>
                </div>
              )}
              <Tooltip content="Preview template in fullscreen" position="top">
                <button
                  onClick={() => onPreview(template.id)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Preview template"
                >
                  <Eye size={16} />
                </button>
              </Tooltip>
              {onRemove && isAdded && (
                <Tooltip content="Remove this template from your editor" position="top">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(template.id);
                    }}
                    className="px-3 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1"
                    style={{
                      background: colors.badgeErrorBg,
                      color: colors.errorRed,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    aria-label="Remove template"
                  >
                    <X size={14} />
                    Remove
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Memoized export to prevent unnecessary re-renders
 * Only re-renders when props actually change
 */
export default React.memo(TemplateCardList, (prevProps, nextProps) => {
  return (
    prevProps.template.id === nextProps.template.id &&
    prevProps.isAdded === nextProps.isAdded &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.addedTemplateId === nextProps.addedTemplateId
    // colors and callbacks are assumed stable
  );
});

