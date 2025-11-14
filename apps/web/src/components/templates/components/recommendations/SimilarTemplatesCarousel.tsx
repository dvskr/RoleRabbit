/**
 * SimilarTemplatesCarousel Component
 * Horizontal carousel showing similar templates
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Download,
  Sparkles,
  Crown,
  ExternalLink,
} from 'lucide-react';
import { useRecommendations } from '../../hooks/useRecommendations';

interface SimilarTemplatesCarouselProps {
  templateId: string;
  limit?: number;
  onTemplateClick?: (templateId: string) => void;
  className?: string;
}

export const SimilarTemplatesCarousel: React.FC<SimilarTemplatesCarouselProps> = ({
  templateId,
  limit = 10,
  onTemplateClick,
  className = '',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { similarTemplates, loading, fetchSimilarTemplates, trackInteraction } =
    useRecommendations({
      autoFetch: false,
    });

  // Fetch similar templates on mount
  useEffect(() => {
    if (templateId) {
      fetchSimilarTemplates(templateId, limit);
    }
  }, [templateId, limit, fetchSimilarTemplates]);

  // Check scroll position
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  // Setup scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [similarTemplates]);

  // Scroll functions
  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({
      left: -400,
      behavior: 'smooth',
    });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({
      left: 400,
      behavior: 'smooth',
    });
  };

  // Handle template click
  const handleTemplateClick = async (recId: string, tempId: string) => {
    await trackInteraction(recId, 'click');
    onTemplateClick?.(tempId);
  };

  // Get icon for reason type
  const getReasonIcon = (type: string) => {
    switch (type) {
      case 'similarity':
        return <Sparkles size={12} className="text-green-600" />;
      default:
        return <Sparkles size={12} className="text-gray-600" />;
    }
  };

  if (loading && similarTemplates.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-600" size={20} />
          <h3 className="text-xl font-bold text-gray-900">Similar Templates</h3>
        </div>

        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 animate-pulse">
              <div className="bg-gray-200 rounded-lg h-80 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (similarTemplates.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-600" size={20} />
          <h3 className="text-xl font-bold text-gray-900">Similar Templates</h3>
          <span className="text-sm text-gray-500">Based on your selection</span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`p-2 rounded-lg border transition-colors ${
              canScrollLeft
                ? 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`p-2 rounded-lg border transition-colors ${
              canScrollRight
                ? 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {similarTemplates.map((rec) => (
          <div
            key={rec.id}
            className="flex-shrink-0 w-64 group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleTemplateClick(rec.id, rec.template.id)}
          >
            {/* Match Badge */}
            <div className="relative">
              <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-sm">
                {rec.matchPercentage}% Similar
              </div>

              {/* Template Image */}
              <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={rec.template.imageUrl}
                  alt={rec.template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {rec.template.isPremium && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-sm">
                    <Crown size={10} />
                    Premium
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              {/* Template Name */}
              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm group-hover:text-purple-600 transition-colors">
                {rec.template.name}
              </h4>

              {/* Template Description */}
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {rec.template.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  <span>{rec.template.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download size={10} />
                  <span>{rec.template.downloads.toLocaleString()}</span>
                </div>
              </div>

              {/* Why Similar */}
              {rec.reasons.length > 0 && (
                <div className="border-t border-gray-100 pt-2">
                  <div className="flex items-start gap-1.5">
                    {getReasonIcon(rec.reasons[0].type)}
                    <span className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {rec.reasons[0].description}
                    </span>
                  </div>
                </div>
              )}

              {/* View Button */}
              <button className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-medium text-xs">
                <span>View</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gradient Overlays */}
      {canScrollLeft && (
        <div className="absolute left-0 top-12 bottom-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-12 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default SimilarTemplatesCarousel;
