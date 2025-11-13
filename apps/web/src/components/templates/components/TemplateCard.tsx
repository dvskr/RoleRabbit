/**
 * TemplateCard - Grid view template card component
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
import { getDifficultyColor } from '../utils/templateHelpers';
import Tooltip from './Tooltip';

interface TemplateCardProps {
  template: ResumeTemplate;
  isAdded: boolean;
  isFavorite: boolean;
  addedTemplateId: string | null;
  colors: any;
  onFavorite: (templateId: string) => void;
  onPreview: (templateId: string) => void;
  onUse: (templateId: string) => void;
  onRemove?: (templateId: string) => void;
}

export default function TemplateCard({
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
  
  // Get color scheme class dynamically
  const getColorClass = () => {
    switch (template.colorScheme) {
      case 'blue':
        return 'bg-blue-600';
      case 'green':
        return 'bg-green-600';
      case 'monochrome':
        return 'bg-gray-700';
      default:
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
    }
  };
  
  const colorSchemeClass = getColorClass();

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
        {/* Mini Resume Preview */}
        <div className="w-20 h-28 bg-white rounded-lg shadow-xl border border-gray-300 transform rotate-1 group-hover:rotate-0 transition-transform duration-300">
          <div className="p-1.5 h-full flex flex-col space-y-0.5">
            {/* Name/Header Bar */}
            <div className={`h-2 rounded ${colorSchemeClass}`}></div>

            {/* Contact Line */}
            <div className="h-1 bg-gray-200 rounded w-10/12"></div>

            {/* Summary Section */}
            <div className="space-y-0.5">
              <div className={`h-1 rounded w-8 ${colorSchemeClass}`}></div>
              <div className="h-1 bg-gray-100 rounded w-full"></div>
              <div className="h-1 bg-gray-100 rounded w-5/6"></div>
            </div>

            {/* Experience Section */}
            <div className="space-y-0.5">
              <div className={`h-1 rounded w-7 ${colorSchemeClass}`}></div>
              <div className="h-1 bg-gray-100 rounded w-full"></div>
              <div className="h-1 bg-gray-100 rounded w-4/5"></div>
            </div>

            {/* Bullet Points */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="h-1 bg-gray-100 rounded flex-1"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="h-1 bg-gray-100 rounded flex-1"></div>
            </div>

            {/* Skills Tags */}
            <div className="flex gap-1">
              <div className="h-1 bg-gray-100 rounded flex-1"></div>
              <div className="h-1 bg-gray-100 rounded flex-1"></div>
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

