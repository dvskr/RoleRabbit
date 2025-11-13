/**
 * TemplatePreviewModal - Modal for previewing template with full details
 */

import React from 'react';
import { X, Heart, Share2, Download, Upload, Plus, CheckCircle, Star, Layout } from 'lucide-react';
import type { ResumeTemplate } from '../../../data/templates';
import type { ThemeColors } from '../types';
import { getDifficultyColor } from '../utils/templateHelpers';
import { generateSampleResumePreview } from '../utils/templateHelpers';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: ResumeTemplate | null;
  isFavorite: boolean;
  addedTemplateId: string | null;
  colors?: ThemeColors;
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
  if (!isOpen || !template) return null;

  const difficultyColor = getDifficultyColor(template.difficulty, colors || {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
        <div className="mb-6 bg-gray-100 rounded-lg p-4">
          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-2xl overflow-auto max-h-[600px]">
            <div className="p-6 min-w-[650px]">
              {generateSampleResumePreview(template)}
            </div>
          </div>
        </div>

        {/* Template Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
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
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Download template"
              title="Download"
            >
              <Download size={20} />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center gap-2"
            >
              <Upload size={18} />
              Upload & Apply
            </button>
            <button
              onClick={() => onUse(template.id)}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden"
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

