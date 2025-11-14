/**
 * TemplateCard - Grid view template card component
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
} from 'lucide-react';
import type { ResumeTemplate } from '../../../data/templates';
import type { ThemeColors } from '../types';
import { getDifficultyColor } from '../utils/templateHelpers';
import Tooltip from './Tooltip';

interface TemplateCardProps {
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

function TemplateCard({
  template,
  isAdded,
  isFavorite,
  addedTemplateId,
  colors,
  onFavorite,
  onPreview,
  onUse,
  onRemove,
}: TemplateCardProps) {
  const difficultyColor = getDifficultyColor(template.difficulty, colors);

  // Get comprehensive color scheme palette for accurate preview
  const getColorPalette = () => {
    switch (template.colorScheme) {
      case 'blue':
        return {
          primary: 'bg-blue-600',      // Headers
          accent: 'bg-blue-500',       // Subheadings
          light: 'bg-blue-100',        // Backgrounds
          text: 'text-blue-700',       // Colored text
          border: 'border-blue-300',   // Borders
        };
      case 'green':
        return {
          primary: 'bg-green-600',
          accent: 'bg-green-500',
          light: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-300',
        };
      case 'purple':
        return {
          primary: 'bg-purple-600',
          accent: 'bg-purple-500',
          light: 'bg-purple-100',
          text: 'text-purple-700',
          border: 'border-purple-300',
        };
      case 'red':
        return {
          primary: 'bg-red-600',
          accent: 'bg-red-500',
          light: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-300',
        };
      case 'orange':
        return {
          primary: 'bg-orange-600',
          accent: 'bg-orange-500',
          light: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-300',
        };
      case 'custom':
        return {
          primary: 'bg-gradient-to-r from-teal-500 to-cyan-500',
          accent: 'bg-teal-500',
          light: 'bg-teal-100',
          text: 'text-teal-700',
          border: 'border-teal-300',
        };
      case 'monochrome':
        return {
          primary: 'bg-gray-800',
          accent: 'bg-gray-600',
          light: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-400',
        };
      default:
        return {
          primary: 'bg-gray-800',
          accent: 'bg-gray-600',
          light: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-400',
        };
    }
  };

  const colorPalette = getColorPalette();

  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-200 group flex flex-col h-full"
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
      {/* Template Preview */}
      <div
        className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden group cursor-pointer"
        onClick={() => onPreview(template.id)}
      >
        {/* Mini Resume Preview - Accurate Color Representation */}
        <div className="w-20 h-28 bg-white rounded-lg shadow-xl border border-gray-300 transform rotate-1 group-hover:rotate-0 transition-transform duration-300 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Name/Header Bar - Primary Color */}
            <div className={`h-4 ${colorPalette.primary} flex items-center px-1`}>
              <div className="h-1 bg-white/80 rounded w-3/4"></div>
            </div>

            <div className="p-1.5 flex-1 flex flex-col space-y-0.5">
              {/* Contact Line with Color Accent */}
              <div className={`h-0.5 ${colorPalette.light} rounded w-full`}></div>

              {/* Summary Section */}
              <div className="space-y-0.5">
                {/* Section Header - Accent Color */}
                <div className={`h-1 rounded w-8 ${colorPalette.accent}`}></div>
                <div className="h-1 bg-gray-100 rounded w-full"></div>
                <div className="h-1 bg-gray-100 rounded w-5/6"></div>
              </div>

              {/* Experience Section with Border */}
              <div className={`space-y-0.5 border-l-2 ${colorPalette.border} pl-1`}>
                {/* Section Header - Accent Color */}
                <div className={`h-1 rounded w-7 ${colorPalette.accent}`}></div>
                <div className="h-1 bg-gray-100 rounded w-full"></div>
                <div className="h-1 bg-gray-100 rounded w-4/5"></div>
              </div>

              {/* Bullet Points with Color */}
              <div className="flex items-center gap-1">
                <div className={`w-1 h-1 ${colorPalette.primary} rounded-full`}></div>
                <div className="h-1 bg-gray-100 rounded flex-1"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-1 h-1 ${colorPalette.primary} rounded-full`}></div>
                <div className="h-1 bg-gray-100 rounded flex-1"></div>
              </div>

              {/* Skills Tags with Color Background */}
              <div className="flex gap-1">
                <div className={`h-1.5 ${colorPalette.light} rounded flex-1 border ${colorPalette.border}`}></div>
                <div className={`h-1.5 ${colorPalette.light} rounded flex-1 border ${colorPalette.border}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Crown size={10} />
            Premium
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-2 left-2">
          <Tooltip
            content={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            position="right"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(template.id);
              }}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </Tooltip>
        </div>

        {/* Preview Button (hover) */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip content="Preview template in fullscreen" position="left">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(template.id);
              }}
              className="p-2 bg-white/80 text-gray-600 hover:bg-white rounded-full transition-colors"
              aria-label="Preview template"
            >
              <Eye size={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3
            className="font-semibold text-sm leading-tight"
            style={{ color: colors.primaryText }}
          >
            {template.name}
          </h3>
          <div
            className="flex items-center gap-1 text-sm ml-2"
            style={{ color: colors.secondaryText }}
          >
            <Star size={12} style={{ color: '#fbbf24' }} fill="#fbbf24" />
            <span className="font-medium">{template.rating}</span>
          </div>
        </div>

        <p
          className="text-sm mb-3 line-clamp-2 flex-1"
          style={{ color: colors.secondaryText }}
        >
          {template.description}
        </p>

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
        </div>

        {/* Tags - Display first 3 tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {template.tags.slice(0, 3).map((tag, index) => (
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
            {template.tags.length > 3 && (
              <span
                className="text-xs"
                style={{ color: colors.tertiaryText }}
                title={`+${template.tags.length - 3} more tags`}
              >
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div
            className="flex items-center gap-1 text-sm"
            style={{ color: colors.secondaryText }}
          >
            <Download size={12} />
            <span className="font-medium">
              {(template.downloads / 1000).toFixed(0)}k
            </span>
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
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  aria-label="Remove template"
                >
                  <X size={16} />
                </button>
              </Tooltip>
            )}
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
export default React.memo(TemplateCard, (prevProps, nextProps) => {
  return (
    prevProps.template.id === nextProps.template.id &&
    prevProps.isAdded === nextProps.isAdded &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.addedTemplateId === nextProps.addedTemplateId
    // colors and callbacks are assumed stable
  );
});
