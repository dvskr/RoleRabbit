/**
 * TemplatePreviewModal - Modal for previewing template with full details
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, Heart, Share2, Download, Upload, Plus, CheckCircle, Star, Layout, Loader2 } from 'lucide-react';
import type { ResumeTemplate } from '../../../data/templates';
import type { ThemeColors } from '../types';
import { getDifficultyColor } from '../utils/templateHelpers';
import { generateSampleResumePreview } from '../utils/templateHelpers';
import { getRecommendedTemplates } from '../utils/templateRecommendations';
import RecommendedTemplates from './RecommendedTemplates';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: ResumeTemplate | null;
  allTemplates: ResumeTemplate[];
  isFavorite: boolean;
  addedTemplateId: string | null;
  colors?: ThemeColors;
  onClose: () => void;
  onFavorite: (templateId: string) => void;
  onShare: () => void;
  onDownload: () => void;
  onUse: (templateId: string) => void;
  onOpenUpload: () => void;
  onPreview: (templateId: string) => void;
}

export default function TemplatePreviewModal({
  isOpen,
  template,
  allTemplates,
  isFavorite,
  addedTemplateId,
  colors,
  onClose,
  onFavorite,
  onShare,
  onDownload,
  onUse,
  onOpenUpload,
  onPreview,
}: TemplatePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [previewContent, setPreviewContent] = useState<React.ReactNode>(null);

  // Calculate similar template recommendations
  const recommendations = useMemo(() => {
    if (!template || !allTemplates || allTemplates.length === 0) {
      return [];
    }
    return getRecommendedTemplates(template, allTemplates, 4, 20);
  }, [template, allTemplates]);

  // Handle preview loading when modal opens or template changes
  useEffect(() => {
    if (!isOpen || !template) {
      setIsLoading(true);
      setPreviewContent(null);
      return;
    }

    // Reset loading state when template changes
    setIsLoading(true);
    setPreviewContent(null);

    // Simulate async preview generation
    // In a real scenario, this could be actual async template rendering
    const timer = setTimeout(() => {
      const content = generateSampleResumePreview(template);
      setPreviewContent(content);
      setIsLoading(false);
    }, 150); // Small delay to show loading state, prevents janky UX

    return () => clearTimeout(timer);
  }, [isOpen, template]);

  if (!isOpen || !template) return null;

  const difficultyColor = getDifficultyColor(template.difficulty, colors || {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl p-3 sm:p-6 w-full max-w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <Layout size={24} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Template Preview */}
        <div className="mb-4 sm:mb-6 bg-gray-100 rounded-lg p-2 sm:p-4">
          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-2xl overflow-auto max-h-[400px] sm:max-h-[600px]">
            <div className="p-3 sm:p-6 min-w-0 sm:min-w-[650px]">
              {isLoading ? (
                /* Loading State - Skeleton */
                <div className="space-y-6 animate-pulse">
                  {/* Header Skeleton */}
                  <div className="text-center border-b pb-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>

                  {/* Summary Section Skeleton */}
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>

                  {/* Experience Section Skeleton */}
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="mb-4">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>

                  {/* Skills Section Skeleton */}
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>

                  {/* Loading Indicator */}
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={32} className="text-blue-600 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading preview...</span>
                  </div>
                </div>
              ) : (
                /* Actual Preview */
                previewContent
              )}
            </div>
          </div>
        </div>

        {/* Template Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Features</h3>
            <div className="flex flex-wrap gap-2">
              {template.features.map(feature => (
                <span
                  key={feature}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Specifications</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span
                  className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    ...difficultyColor,
                    color: difficultyColor.text,
                    background: difficultyColor.bg,
                  }}
                >
                  {template.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Layout:</span>
                <span className="font-medium text-gray-900">{template.layout}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Color Scheme:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {template.colorScheme}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rating:</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-900">{template.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Templates */}
        {recommendations.length > 0 && (
          <RecommendedTemplates
            recommendations={recommendations}
            colors={colors || {}}
            onSelectTemplate={onPreview}
          />
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <button
              onClick={() => onFavorite(template.id)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onShare}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Share template"
              title="Share"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={onDownload}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors relative group"
              aria-label="Download sample preview (no resume data)"
              title="Download Sample Preview"
            >
              <Download size={20} />
              {/* Tooltip explaining this is sample only */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                <div className="font-semibold mb-1">Sample Preview Only</div>
                <div className="text-gray-300 text-[10px]">Upload your resume for personalized download</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Close
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Upload & Apply</span>
              <span className="sm:hidden">Upload</span>
            </button>
            <button
              onClick={() => onUse(template.id)}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden text-sm sm:text-base"
            >
              {addedTemplateId === template.id ? (
                <span className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                  <CheckCircle size={16} className="text-green-200 sm:w-[18px] sm:h-[18px]" />
                  Added!
                </span>
              ) : (
                <>
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Add to Editor</span>
                  <span className="sm:hidden">Add</span>
                </>
              )}
              {addedTemplateId === template.id && (
                <span className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

