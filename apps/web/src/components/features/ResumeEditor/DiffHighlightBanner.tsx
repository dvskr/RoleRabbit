/**
 * Banner component to show tailoring diff summary and toggle highlighting
 */

import React, { useState } from 'react';
import { GitCompare, X, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

interface DiffHighlightBannerProps {
  diffChanges: Array<{
    type: 'added' | 'removed' | 'modified' | 'unchanged';
    section: string;
    field?: string;
    index?: number;
    oldValue?: string;
    newValue?: string;
    path: string;
  }>;
  showHighlighting: boolean;
  onToggleHighlighting: () => void;
  onClose: () => void;
  onApplyChanges?: () => Promise<void>;
  atsScore?: {
    before: number;
    after: number;
    improvement: number;
  };
  colors: any;
}

export function DiffHighlightBanner({
  diffChanges,
  showHighlighting,
  onToggleHighlighting,
  onClose,
  onApplyChanges,
  atsScore,
  colors,
}: DiffHighlightBannerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  
  const addedCount = diffChanges.filter(c => c.type === 'added').length;
  const modifiedCount = diffChanges.filter(c => c.type === 'modified').length;
  const removedCount = diffChanges.filter(c => c.type === 'removed').length;
  const totalChanges = addedCount + modifiedCount + removedCount;

  if (totalChanges === 0) return null;

  const handleApplyChanges = async () => {
    if (!onApplyChanges || isApplying || isApplied) return;
    
    setIsApplying(true);
    try {
      await onApplyChanges();
      setIsApplied(true);
      // Don't hide banner - it will transform to show ATS score
    } catch (error) {
      console.error('Failed to apply changes:', error);
      setIsApplying(false);
    }
  };

  const formatChangeText = (change: typeof diffChanges[0]) => {
    const sectionName = change.section.charAt(0).toUpperCase() + change.section.slice(1);
    const fieldName = change.field ? ` - ${change.field}` : '';
    const indexText = typeof change.index !== 'undefined' ? ` #${change.index + 1}` : '';
    
    if (change.type === 'added') {
      return `${sectionName}${fieldName}${indexText}: Added`;
    } else if (change.type === 'removed') {
      return `${sectionName}${fieldName}${indexText}: Removed`;
    } else if (change.type === 'modified') {
      return `${sectionName}${fieldName}${indexText}: Modified`;
    }
    return '';
  };

  // If applied and ATS score is available, show ATS score banner
  if (isApplied && atsScore) {
    return (
      <div
        className="border-b"
        style={{
          background: colors.cardBackground,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold" style={{ color: colors.primaryText }}>
                  Changes Applied Successfully!
                </span>
                <div className="flex items-center gap-3 text-xs" style={{ color: colors.secondaryText }}>
                  <span>ATS Score: {atsScore.before} → {atsScore.after}</span>
                  <span className="text-green-600 font-semibold">+{atsScore.improvement} points</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-b"
      style={{
        background: colors.cardBackground,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <GitCompare size={20} style={{ color: colors.primaryBlue }} />
          <div className="flex flex-col">
            <span className="text-sm font-semibold" style={{ color: colors.primaryText }}>
              Resume Tailored
            </span>
            <div className="flex items-center gap-3 text-xs" style={{ color: colors.secondaryText }}>
              {addedCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {addedCount} added
                </span>
              )}
              {modifiedCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  {modifiedCount} modified
                </span>
              )}
              {removedCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  {removedCount} removed
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onApplyChanges && (
            <button
              onClick={handleApplyChanges}
              disabled={isApplying || isApplied}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: isApplied ? '#10b981' : isApplying ? colors.badgeInfoBg : colors.badgeSuccessBg,
                color: isApplied ? '#ffffff' : isApplying ? colors.badgeInfoText : colors.badgeSuccessText,
                border: `1px solid ${isApplied ? '#10b981' : isApplying ? colors.badgeInfoBorder : colors.badgeSuccessBorder}`,
                cursor: isApplying || isApplied ? 'not-allowed' : 'pointer',
                opacity: isApplying || isApplied ? 0.8 : 1,
              }}
            >
              {isApplied ? (
                <>
                  <span>✓</span>
                  <span>Applied!</span>
                </>
              ) : isApplying ? (
                <>
                  <span className="animate-spin">⟳</span>
                  <span>Applying...</span>
                </>
              ) : (
                <span>Apply Changes</span>
              )}
            </button>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: colors.inputBackground,
              color: colors.primaryText,
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
            }}
          >
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{showDetails ? 'Hide' : 'Show'} Details</span>
          </button>
          
          <button
            onClick={onToggleHighlighting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: showHighlighting ? colors.badgePurpleBg : colors.inputBackground,
              color: showHighlighting ? colors.badgePurpleText : colors.primaryText,
              border: `1px solid ${showHighlighting ? colors.badgePurpleBorder : colors.border}`,
            }}
            onMouseEnter={(e) => {
              if (!showHighlighting) {
                e.currentTarget.style.background = colors.hoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              if (!showHighlighting) {
                e.currentTarget.style.background = colors.inputBackground;
              }
            }}
          >
            {showHighlighting ? (
              <>
                <Eye size={14} />
                <span>Highlighting On</span>
              </>
            ) : (
              <>
                <EyeOff size={14} />
                <span>Show Changes</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div
          className="px-4 py-3 border-t max-h-64 overflow-y-auto"
          style={{
            background: colors.inputBackground,
            borderColor: colors.border,
          }}
        >
          <div className="space-y-2">
            {diffChanges.map((change, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-xs p-2 rounded"
                style={{
                  background: colors.cardBackground,
                  color: colors.secondaryText,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                  style={{
                    background:
                      change.type === 'added'
                        ? '#10b981'
                        : change.type === 'removed'
                        ? '#ef4444'
                        : '#f59e0b',
                  }}
                ></span>
                <div className="flex-1">
                  <div className="font-medium" style={{ color: colors.primaryText }}>
                    {formatChangeText(change)}
                  </div>
                  {(change.type === 'added' || change.type === 'modified') && change.newValue && (
                    <div className="mt-1">
                      <div className="text-green-600">
                        {change.newValue.substring(0, 200)}{change.newValue.length > 200 ? '...' : ''}
                      </div>
                    </div>
                  )}
                  {change.type === 'removed' && change.oldValue && (
                    <div className="mt-1">
                      <div className="text-red-600 line-through">
                        {change.oldValue.substring(0, 200)}{change.oldValue.length > 200 ? '...' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

