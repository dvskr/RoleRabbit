'use client';

import React from 'react';
import { Code, Briefcase, Lightbulb, TrendingUp, GraduationCap, FileText, Eye, ArrowRight, BarChart } from 'lucide-react';
import { TemplateCardProps } from '../types/coverletter';
import { useTheme } from '../../../contexts/ThemeContext';

const TemplateCard = React.memo(function TemplateCard({ template, onUse, onPreview }: TemplateCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tech':
      case 'software': 
        return <Code size={20} />;
      case 'business': 
        return <Briefcase size={20} />;
      case 'creative': 
        return <Lightbulb size={20} />;
      case 'executive': 
        return <TrendingUp size={20} />;
      case 'academic': 
        return <GraduationCap size={20} />;
      default: 
        return <FileText size={20} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'tech':
      case 'software': return 'Tech';
      case 'business': return 'Business';
      case 'creative': return 'Creative';
      case 'executive': return 'Executive';
      case 'academic': return 'Academic';
      default: return 'General';
    }
  };

  return (
    <div 
      className="rounded-lg p-5 transition-all"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.borderFocused;
        e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.1)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header with Icon and Title */}
      <div className="flex items-start gap-3 mb-3">
        {/* Icon Square */}
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: colors.badgePurpleBg,
            color: 'white',
          }}
        >
          {getCategoryIcon(template.category)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base" style={{ color: colors.primaryText }}>
              {template.name}
            </h3>
            {template.aiGenerated && (
              <span 
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  background: colors.badgePurpleBg,
                  color: 'white',
                }}
              >
                AI
              </span>
            )}
          </div>
          
          {/* ATS Score */}
          <div className="flex items-center gap-1 mb-2">
            <BarChart size={14} style={{ color: colors.successGreen }} />
            <span className="text-sm font-medium" style={{ color: colors.successGreen }}>
              {template.successRate}% ATS Score
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p 
        className="text-sm mb-3 line-clamp-2"
        style={{ color: colors.secondaryText }}
      >
        {template.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {template.tags.slice(0, 3).map((tag, index) => (
          <span 
            key={index}
            className="px-2 py-1 rounded text-xs"
            style={{
              background: colors.inputBackground,
              color: colors.secondaryText,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {onPreview && (
          <button
            onClick={() => onPreview(template)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: colors.inputBackground,
              color: colors.primaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackgroundStrong;
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <Eye size={16} />
            Preview
          </button>
        )}
        <button
          onClick={() => onUse(template)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: colors.primaryBlue,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Use Template
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.template.id === nextProps.template.id;
});

export default TemplateCard;
