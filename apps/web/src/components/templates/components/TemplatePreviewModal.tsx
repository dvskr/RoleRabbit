/**
 * TemplatePreviewModal - Modal for previewing template with full details
 * Enhanced with smooth animations for better UX
 */

import React, { useEffect, useState } from 'react';
import { X, Heart, Share2, Download, Upload, Plus, CheckCircle, Star, Layout } from 'lucide-react';
import type { ResumeTemplate } from '../../../data/templates';
import { getDifficultyColor } from '../utils/templateHelpers';
import { generateSampleResumePreview } from '../utils/templateHelpers';
import { TemplateReviews } from './ratings/TemplateReviews';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: ResumeTemplate | null;
  isFavorite: boolean;
  addedTemplateId: string | null;
  colors?: any;
  onClose: () => void;
  onFavorite: (templateId: string) => void;
  onShare: () => void;
  onDownload: () => void;
  onUse: (templateId: string) => void;
  onOpenUpload: () => void;
}

export default function TemplatePreviewModal({
  isOpen,
  template,
  isFavorite,
  addedTemplateId,
  colors,
  onClose,
  onFavorite,
  onShare,
  onDownload,
  onUse,
  onOpenUpload,
}: TemplatePreviewModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger enter animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for exit animation before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!shouldRender || !template) return null;

  const difficultyColor = getDifficultyColor(template.difficulty, colors || {});

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-0 sm:p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black bg-opacity-50 backdrop-blur-sm' : 'bg-black bg-opacity-0'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white rounded-none sm:rounded-xl p-4 sm:p-6 w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ background: colors?.cardBackground || '#ffffff' }}
      >
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex items-start space-x-2 sm:space-x-4 flex-1">
            <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Layout size={20} className="text-gray-400 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                id="modal-title"
                className="text-lg sm:text-2xl font-bold truncate"
                style={{ color: colors?.primaryText || '#111827' }}
              >
                {template.name}
              </h2>
              <p
                className="text-xs sm:text-sm line-clamp-2"
                style={{ color: colors?.secondaryText || '#4b5563' }}
              >
                {template.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 -mt-1"
            aria-label="Close modal"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <>
            {/* Template Preview Image */}
            <div className="mb-4 sm:mb-6 bg-gray-100 rounded-lg p-3 sm:p-8">
              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-3 sm:p-8 min-h-[400px] sm:min-h-[600px] overflow-hidden">
                <div className="transform scale-50 sm:scale-75 origin-top-left">
                  {generateSampleResumePreview(template)}
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
          </>
        ) : (
          /* Reviews Tab */
          <div className="mb-6">
            <TemplateReviews
              templateId={template.id}
              currentUserId={undefined} // TODO: Get from auth context
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <button
              onClick={() => onFavorite(template.id)}
              className={`p-3 sm:p-2 rounded-lg transition-colors touch-manipulation ${
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
              className="p-3 sm:p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              aria-label="Share template"
              title="Share"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={onDownload}
              className="p-3 sm:p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              aria-label="Download template"
              title="Download"
            >
              <Download size={20} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-4 py-3 sm:py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base touch-manipulation order-last sm:order-none"
            >
              Close
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-3 sm:py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Upload & Apply</span>
              <span className="sm:hidden">Upload</span>
            </button>
            <button
              onClick={() => onUse(template.id)}
              className="px-6 py-3 sm:py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden text-sm sm:text-base touch-manipulation"
            >
              {addedTemplateId === template.id ? (
                <span className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                  <CheckCircle size={18} className="text-green-200" />
                  Added!
                </span>
              ) : (
                <>
                  <Plus size={18} />
                  Add to Editor
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

