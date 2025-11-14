/**
 * RecommendedSection Component
 * "Recommended for you" section with AI explanations
 */

import React from 'react';
import {
  Sparkles,
  Star,
  Download,
  TrendingUp,
  Users,
  Target,
  X,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { useRecommendations, type Recommendation } from '../../hooks/useRecommendations';

interface RecommendedSectionProps {
  context?: {
    userId?: string;
    category?: string;
    tags?: string[];
  };
  limit?: number;
  onTemplateClick?: (templateId: string) => void;
  className?: string;
}

export const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  context,
  limit = 6,
  onTemplateClick,
  className = '',
}) => {
  const {
    recommendations,
    loading,
    error,
    trackInteraction,
    dismissRecommendation,
  } = useRecommendations({
    context,
    limit,
    autoFetch: true,
  });

  // Get icon for reason type
  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'trending':
        return <TrendingUp size={14} className="text-orange-600" />;
      case 'popular':
        return <Star size={14} className="text-yellow-600 fill-yellow-600" />;
      case 'personalized':
        return <Target size={14} className="text-blue-600" />;
      case 'collaborative':
        return <Users size={14} className="text-purple-600" />;
      case 'similarity':
        return <Sparkles size={14} className="text-green-600" />;
      case 'category':
        return <Sparkles size={14} className="text-pink-600" />;
      default:
        return <Sparkles size={14} className="text-gray-600" />;
    }
  };

  // Handle template click
  const handleTemplateClick = async (rec: Recommendation) => {
    await trackInteraction(rec.id, 'click');
    onTemplateClick?.(rec.template.id);
  };

  // Handle dismiss
  const handleDismiss = async (e: React.MouseEvent, recId: string) => {
    e.stopPropagation();
    await dismissRecommendation(recId);
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <p className="text-sm text-red-800">Failed to load recommendations: {error}</p>
      </div>
    );
  }

  if (loading && recommendations.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64 mb-3" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-blue-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
        <span className="text-sm text-gray-500">Personalized by AI</span>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => handleTemplateClick(rec)}
          >
            {/* Dismiss Button */}
            <button
              onClick={(e) => handleDismiss(e, rec.id)}
              className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
            >
              <X size={14} className="text-gray-600" />
            </button>

            {/* Match Badge */}
            <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
              {rec.matchPercentage}% Match
            </div>

            {/* Template Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
              <img
                src={rec.template.imageUrl}
                alt={rec.template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {rec.template.isPremium && (
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-sm">
                  <Crown size={12} />
                  Premium
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Template Name */}
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {rec.template.name}
              </h3>

              {/* Template Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {rec.template.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span>{rec.template.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download size={12} />
                  <span>{rec.template.downloads.toLocaleString()}</span>
                </div>
              </div>

              {/* Why Recommended */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Why this template?</p>
                <div className="space-y-1.5">
                  {rec.reasons.slice(0, 2).map((reason, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {getReasonIcon(reason.type)}
                      <span className="text-xs text-gray-600 leading-relaxed">
                        {reason.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Button */}
              <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm">
                <span>View Template</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Loading More */}
      {loading && recommendations.length > 0 && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            Loading more recommendations...
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendedSection;
