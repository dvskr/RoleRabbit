'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { AIPanelProps, ApplyChangesHandlerDeps } from './types/AIPanel.types';
import { ChevronDown, ChevronUp, X, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AIOperationProgress } from '../../common/AIOperationProgress';
import { InlineProgress } from '../../common/InlineProgress';
import ResumeQualityIndicator from './components/ResumeQualityIndicator';
import EnhancedProgressTracker from './components/EnhancedProgressTracker';
import { useSimulatedProgress } from '../../../hooks/useSimulatedProgress';
import { cacheInvalidation } from '../../../utils/cacheInvalidation';

export const createApplyChangesHandler =
  ({ confirmTailorChanges, analyzeJobDescription, setApplyError, setBeforeScore }: ApplyChangesHandlerDeps) =>
  async () => {
    if (!confirmTailorChanges) {
      return;
    }
    setApplyError(null);
    try {
      const success = await confirmTailorChanges();
      if (!success) {
        setApplyError('Failed to save tailored changes. Please try again.');
        return;
      }
      setBeforeScore(null);
      // Don't re-run ATS analysis - keep the success panel visible
      // await analyzeJobDescription?.();
    } catch (error: any) {
      const message =
        typeof error?.message === 'string' ? error.message : 'Failed to save tailored changes. Please try again.';
      setApplyError(message);
    }
  };

export default function AIPanelRedesigned({
  showRightPanel,
  setShowRightPanel,
  jobDescription,
  setJobDescription,
  isAnalyzing,
  matchScore,
  showATSScore,
  matchedKeywords = [],
  missingKeywords = [],
  aiRecommendations = [],
  tailorEditMode,
  setTailorEditMode,
  selectedTone,
  setSelectedTone,
  selectedLength,
  setSelectedLength,
  onResetTailoringPreferences,
  resumeData,
  onAnalyzeJobDescription,
  tailorResult,
  setTailorResult,
  isTailoring,
  onTailorResume,
  onGenerateCoverLetter,
  onGeneratePortfolio,
  isGeneratingCoverLetter,
  isGeneratingPortfolio,
  onConfirmTailorChanges,
  isSavingResume = false,
  atsProgress,
  tailorProgress
}: AIPanelProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false); // Collapsed by default, user opens to see options
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [showDiffPreview, setShowDiffPreview] = useState(false);
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [changesApplied, setChangesApplied] = useState(false);
  
  // Error states for retry functionality
  const [atsError, setAtsError] = useState<string | null>(null);
  const [tailorError, setTailorError] = useState<string | null>(null);
  const [lastAtsParams, setLastAtsParams] = useState<any>(null);
  const [lastTailorParams, setLastTailorParams] = useState<any>(null);
  
  // AbortController for canceling operations
  const atsAbortControllerRef = useRef<AbortController | null>(null);
  const tailorAbortControllerRef = useRef<AbortController | null>(null);

  // Enhanced progress tracking
  const tailorProgressSimulator = useSimulatedProgress('tailor');
  const atsProgressSimulator = useSimulatedProgress('ats');

  // Reset changesApplied when tailorResult changes (new tailoring)
  useEffect(() => {
    if (tailorResult) {
      setChangesApplied(false);
    }
  }, [tailorResult]);

  // Calculate score color and label
  const getScoreColor = (score: number) => {
    if (score >= 80) return { color: '#10b981', label: 'Excellent', bg: '#d1fae5' };
    if (score >= 60) return { color: '#f59e0b', label: 'Good', bg: '#fef3c7' };
    return { color: '#ef4444', label: 'Needs Work', bg: '#fee2e2' };
  };

  const scoreInfo = useMemo(() => {
    const score = typeof matchScore?.overall === 'number' ? matchScore.overall : 0;
    return getScoreColor(score);
  }, [matchScore]);

  const effectiveMatchedKeywords = matchedKeywords.length
    ? matchedKeywords
    : matchScore?.matchedKeywords ?? [];
  const effectiveMissingKeywords = missingKeywords.length
    ? missingKeywords
    : matchScore?.missingKeywords ?? [];

  const actionableTips = useMemo(() => {
    const tips = matchScore?.actionable_tips ?? matchScore?.actionableTips ?? [];
    return tips
      .map((tip) => {
        if (typeof tip === 'string') return tip;
        const prefix = tip.priority ? `${tip.priority.toUpperCase()}: ` : '';
        return `${prefix}${tip.action}`;
      })
      .filter(Boolean);
  }, [matchScore]);

  const handleRunAnalysis = async () => {
    setBeforeScore(null);
    setTailorResult?.(null);
    setApplyError(null);
    setAtsError(null);
    
    // Store parameters for retry
    setLastAtsParams({ jobDescription, resumeData });
    
    // Create new AbortController for this operation
    atsAbortControllerRef.current = new AbortController();
    
    try {
      await onAnalyzeJobDescription?.();
      
      // ✅ Mark ATS cache as fresh after successful analysis
      if (currentResumeId) {
        cacheInvalidation.markFresh(currentResumeId, 'ats');
      }
    } catch (error: any) {
      setAtsError(error?.message || 'Analysis failed. Please try again.');
    }
  };

  const handleRetryATS = async () => {
    setAtsError(null);
    await handleRunAnalysis();
  };

  const handleCancelATS = () => {
    if (atsAbortControllerRef.current) {
      atsAbortControllerRef.current.abort();
      atsAbortControllerRef.current = null;
      atsProgressSimulator.complete();
    }
  };

  const handleAutoTailor = async () => {
    if (typeof matchScore?.overall === 'number') {
      setBeforeScore(matchScore.overall);
    }
    setApplyError(null);
    setTailorError(null);
    
    // Store parameters for retry
    setLastTailorParams({ jobDescription, resumeData, matchScore });
    
    // Create new AbortController for this operation
    tailorAbortControllerRef.current = new AbortController();
    
    // Start progress simulation
    tailorProgressSimulator.start();
    
    try {
      await onTailorResume?.();
    } catch (error: any) {
      setTailorError(error?.message || 'Tailoring failed. Please try again.');
      tailorProgressSimulator.complete();
    }
  };

  const handleRetryTailor = async () => {
    setTailorError(null);
    await handleAutoTailor();
  };

  const handleCancelTailor = () => {
    if (tailorAbortControllerRef.current) {
      tailorAbortControllerRef.current.abort();
      tailorAbortControllerRef.current = null;
      tailorProgressSimulator.complete();
    }
  };

  // Complete progress when tailoring finishes
  useEffect(() => {
    if (!isTailoring && tailorProgressSimulator.progressState.isActive) {
      tailorProgressSimulator.complete();
    }
  }, [isTailoring, tailorProgressSimulator]);

  // Start ATS progress when analyzing
  useEffect(() => {
    if (isAnalyzing && !atsProgressSimulator.progressState.isActive) {
      atsProgressSimulator.start();
    } else if (!isAnalyzing && atsProgressSimulator.progressState.isActive) {
      atsProgressSimulator.complete();
    }
  }, [isAnalyzing, atsProgressSimulator]);

  const handleApplyChanges = useCallback(
    async () => {
      await createApplyChangesHandler({
        confirmTailorChanges: onConfirmTailorChanges,
        analyzeJobDescription: onAnalyzeJobDescription,
        setApplyError,
        setBeforeScore,
      })();
      // After applying changes, hide the Apply Changes button
      setChangesApplied(true);
    },
    [onConfirmTailorChanges, onAnalyzeJobDescription, setApplyError, setBeforeScore]
  );

  const topMissingSkills = useMemo(() => {
    return effectiveMissingKeywords.slice(0, 5);
  }, [effectiveMissingKeywords]);

  const improvements = useMemo(() => {
    const combined = [
      ...(matchScore?.improvements ?? []),
      ...actionableTips,
      ...aiRecommendations,
    ].filter(Boolean);
    return combined.slice(0, 3);
  }, [matchScore, actionableTips, aiRecommendations]);

  const afterTailorScore = tailorResult?.ats?.after?.overall ?? null;
  const beforeTailorScore =
    beforeScore ??
    tailorResult?.ats?.before?.overall ??
    matchScore?.overall ??
    null;

  const diffPreviewLimit = 20;
  const diffPreviewEntries = useMemo(
    () => (tailorResult?.diff ?? []).slice(0, diffPreviewLimit),
    [tailorResult]
  );

  useEffect(() => {
    setShowDiffPreview(false);
  }, [tailorResult]);

  const formatDiffValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '—';
    }
    if (typeof value === 'string') {
      return value || '—';
    }
    try {
      const serialized = JSON.stringify(value, null, 2);
      return serialized ?? '—';
    } catch (_error) {
      return String(value);
    }
  };

  if (!showRightPanel) return null;

  return (
    <div
      className="flex-shrink-0 border-l"
      style={{
        width: '100%',
        maxWidth: '420px',
        minWidth: '320px',
        borderColor: colors.border,
        background: colors.cardBackground,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 p-4 border-b flex items-center justify-between"
        style={{
          background: colors.cardBackground,
          borderColor: colors.border
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: colors.activeBlueText }} />
          <div>
            <h3 className="text-base font-semibold" style={{ color: colors.text }}>
              AI Assistant
            </h3>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              Resume Optimization
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowRightPanel?.(false)}
          className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
          style={{ color: colors.textSecondary }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1" 
        style={{ 
          padding: '1rem',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        <div className="space-y-4" style={{ width: '100%', maxWidth: '100%' }}>
        {/* Step 1: Job Description Input */}
        <div className="space-y-2" style={{ width: '100%', maxWidth: '100%' }}>
          <label className="block text-sm font-medium" style={{ color: colors.text }}>
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription?.(e.target.value)}
            placeholder="Paste the job description here..."
            rows={8}
            className="w-full px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2"
            style={{
              background: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              {jobDescription?.length || 0} / 15,000 characters
            </span>
            {jobDescription && jobDescription.length < 100 && (
              <span className="text-xs" style={{ color: '#ef4444' }}>
                ⚠️ Minimum 100 characters for best results
              </span>
            )}
            {jobDescription && jobDescription.length > 15000 && (
              <span className="text-xs font-medium" style={{ color: '#ef4444' }}>
                ❌ Maximum 15,000 characters exceeded
              </span>
            )}
          </div>
          
          {/* Validation warnings */}
          {jobDescription && jobDescription.length > 0 && jobDescription.length < 100 && (
            <div className="text-xs p-2 rounded" style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              💡 Tip: Include job requirements, responsibilities, and qualifications for accurate tailoring
            </div>
          )}
          
          {jobDescription && jobDescription.split(/\s+/).length < 20 && jobDescription.length >= 100 && (
            <div className="text-xs p-2 rounded" style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              color: '#f59e0b',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              ⚠️ Job description seems short. Add more details for better tailoring.
            </div>
          )}

          {/* ATS Error State */}
          {atsError && !isAnalyzing && (
            <div className="space-y-3">
              <div
                className="p-4 rounded-lg border"
                style={{
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  borderColor: '#f87171',
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1" style={{ color: '#991b1b' }}>
                      Analysis Failed
                    </h4>
                    <p className="text-sm" style={{ color: '#7f1d1d' }}>
                      {atsError}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRetryATS}
                className="w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          )}

          {/* ATS Progress or Button */}
          {!atsError && (isAnalyzing && atsProgressSimulator.progressState.isActive ? (
            <div className="space-y-2">
              <EnhancedProgressTracker
                operation="ats"
                currentStage={atsProgressSimulator.progressState.stage}
                progress={atsProgressSimulator.progressState.progress}
                message={atsProgressSimulator.progressState.message}
                elapsedTime={atsProgressSimulator.progressState.elapsedTime}
                estimatedTimeRemaining={atsProgressSimulator.progressState.estimatedTimeRemaining}
                warningMessage={atsProgressSimulator.progressState.warningMessage}
                colors={colors}
              />
              <button
                onClick={handleCancelATS}
                className="w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  color: '#dc2626',
                  border: '1px solid #f87171',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                }}
              >
                <X className="w-4 h-4" />
                Cancel Analysis
              </button>
            </div>
          ) : (
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !jobDescription || jobDescription.length < 100 || jobDescription.length > 15000}
              className="w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: colors.activeBlueText,
                opacity: isAnalyzing || !jobDescription || jobDescription.length < 100 || jobDescription.length > 15000 ? 0.5 : 1,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run ATS Check
                </>
              )}
            </button>
          ))}
        </div>

        {/* Step 2: ATS Score Panel */}
        {showATSScore && matchScore && !tailorResult && (
          <div
            className="p-4 rounded-lg space-y-3"
            style={{
              background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
              border: `2px solid ${scoreInfo.color}`,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* Score Header with Premium Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: scoreInfo.color }}>
                    {matchScore.overall}
                  </div>
                  <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                    /100
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ 
                      background: scoreInfo.bg, 
                      color: scoreInfo.color,
                      border: `1px solid ${scoreInfo.color}`
                    }}
                  >
                    {scoreInfo.label}
                  </span>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff'
                    }}
                  >
                    ✨ Premium Analysis
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ Stale Cache Warning */}
            {currentResumeId && cacheInvalidation.isStale(currentResumeId, 'ats') && (
              <div
                className="p-3 rounded-lg flex items-start gap-2 text-xs"
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#d97706',
                }}
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <strong>ATS score may be outdated.</strong> You've edited your resume since this score was calculated.
                  Run a new ATS check to get the latest score.
                </div>
              </div>
            )}

            {/* Show Details Toggle */}
            <button
              onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
              className="w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
              style={{
                background: colors.inputBackground,
                color: colors.primaryText,
                border: `1px solid ${colors.border}`
              }}
            >
              {showDetailedBreakdown ? 'Hide Details' : 'Show Details'}
              {showDetailedBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Detailed Breakdown */}
            {showDetailedBreakdown && (
              <div className="space-y-3 pt-2 border-t" style={{ borderColor: colors.border }}>
                {/* Skills Matched */}
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#10b981' }} />
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {effectiveMatchedKeywords.length} Skills Matched
                    </div>
                    {effectiveMatchedKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {effectiveMatchedKeywords.slice(0, 10).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: '#d1fae5',
                              color: '#065f46',
                              border: '1px solid #10b981'
                            }}
                          >
                            ✓ {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Missing Skills with Proofs */}
                {topMissingSkills.length > 0 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: colors.text }}>
                        Missing Skills ({topMissingSkills.length})
                      </div>
                      <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                        Adding these skills could improve your score
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {topMissingSkills.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #ef4444'
                            }}
                          >
                            ✕ {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Score Breakdown */}
                {(matchScore.keywords !== undefined || matchScore.experience !== undefined || matchScore.format !== undefined) && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      Score Breakdown
                    </div>
                    {matchScore.keywords !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: colors.textSecondary }}>Keywords</span>
                        <span className="text-xs font-bold" style={{ color: colors.text }}>{matchScore.keywords}/100</span>
                      </div>
                    )}
                    {matchScore.experience !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: colors.textSecondary }}>Experience</span>
                        <span className="text-xs font-bold" style={{ color: colors.text }}>{matchScore.experience}/100</span>
                      </div>
                    )}
                    {matchScore.format !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: colors.textSecondary }}>Format</span>
                        <span className="text-xs font-bold" style={{ color: colors.text }}>{matchScore.format}/100</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tailor Error State */}
        {tailorError && !isTailoring && showATSScore && matchScore && (
          <div className="space-y-3">
            <div
              className="p-4 rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                borderColor: '#f87171',
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1" style={{ color: '#991b1b' }}>
                    Tailoring Failed
                  </h4>
                  <p className="text-sm" style={{ color: '#7f1d1d' }}>
                    {tailorError}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleRetryTailor}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        )}

        {/* Step 3: Tailor Resume Button */}
        {!tailorError && showATSScore && matchScore && !tailorResult && (
          <div className="space-y-2">
            <button
              onClick={handleAutoTailor}
              disabled={isTailoring || !jobDescription || jobDescription.length < 100}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              {isTailoring ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Tailoring Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Tailor Resume
                </>
              )}
            </button>
            {isTailoring && tailorProgressSimulator.progressState.isActive && (
              <button
                onClick={handleCancelTailor}
                className="w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  color: '#dc2626',
                  border: '1px solid #f87171',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                }}
              >
                <X className="w-4 h-4" />
                Cancel Tailoring
              </button>
            )}
          </div>
        )}

        {/* Step 4: Tailoring Results */}
        {tailorResult && (
          <div
            className="p-4 rounded-lg space-y-4"
            style={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              border: '2px solid #10b981'
            }}
          >
            {/* Success Header */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" style={{ color: '#065f46' }} />
              <span className="text-lg font-bold" style={{ color: '#065f46' }}>
                Resume Tailored Successfully!
              </span>
            </div>

            {/* Score Improvement */}
            {beforeTailorScore !== null && afterTailorScore !== null && (
              <div className="flex items-center justify-around py-3 px-4 rounded-lg" style={{ background: '#ffffff' }}>
                <div className="text-center">
                  <div className="text-xs font-medium" style={{ color: '#6b7280' }}>Before</div>
                  <div className="text-3xl font-bold" style={{ color: '#f59e0b' }}>{beforeTailorScore}</div>
                </div>
                <div className="text-3xl font-bold" style={{ color: '#10b981' }}>→</div>
                <div className="text-center">
                  <div className="text-xs font-medium" style={{ color: '#6b7280' }}>After</div>
                  <div className="text-3xl font-bold" style={{ color: '#10b981' }}>{afterTailorScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium" style={{ color: '#6b7280' }}>Improvement</div>
                  <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
                    +{afterTailorScore - beforeTailorScore}
                  </div>
                </div>
              </div>
            )}

            {/* Improvements Summary */}
            <div className="space-y-2">
              <div className="text-sm font-bold" style={{ color: '#065f46' }}>
                What Changed:
              </div>
              {tailorResult.diff && tailorResult.diff.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm" style={{ color: '#047857' }}>
                    ✓ Modified {tailorResult.diff.length} {tailorResult.diff.length === 1 ? 'section' : 'sections'}
                  </div>
                  {tailorResult.recommendedKeywords && tailorResult.recommendedKeywords.length > 0 && (
                    <div className="text-sm" style={{ color: '#047857' }}>
                      ✓ Added {tailorResult.recommendedKeywords.length} relevant {tailorResult.recommendedKeywords.length === 1 ? 'keyword' : 'keywords'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* View Details */}
            <button
              onClick={() => setShowDiffPreview(!showDiffPreview)}
              className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{
                background: '#ffffff',
                color: '#047857',
                border: '1px solid #10b981'
              }}
            >
              {showDiffPreview ? 'Hide' : 'View'} Detailed Changes
              {showDiffPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDiffPreview && (
              <div
                className="space-y-3 p-3 rounded-lg max-h-96 overflow-y-auto"
                style={{
                  background: '#ffffff',
                  border: '1px solid #10b981'
                }}
              >
                {diffPreviewEntries.map((entry, index) => (
                  <div
                    key={`${entry.path}-${index}`}
                    className="p-3 rounded-lg text-sm"
                    style={{ background: '#f0fdf4', border: '1px solid #d1fae5' }}
                  >
                    <div className="font-bold mb-2 text-base" style={{ color: '#065f46' }}>
                      {entry.path}
                    </div>
                    <div className="text-green-700 leading-relaxed whitespace-pre-wrap">
                      {formatDiffValue(entry.after)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {!changesApplied && (
                <button
                  onClick={handleApplyChanges}
                  disabled={isSavingResume}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: '#10b981' }}
                >
                  {isSavingResume ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Applying Changes...
                    </>
                  ) : (
                    'Apply Changes to Resume'
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setTailorResult?.(null);
                  setChangesApplied(false);
                }}
                className="w-full py-2 px-4 rounded-lg font-medium text-sm transition-all"
                style={{
                  background: '#ffffff',
                  color: '#047857',
                  border: '1px solid #10b981'
                }}
              >
                Start New Analysis
              </button>
            </div>
          </div>
        )}

        {/* Advanced Settings - Collapsed by Default */}
        <div
          className="border rounded-lg"
          style={{ 
            borderColor: colors.border,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="w-full py-3 px-4 flex items-center justify-between hover:bg-opacity-5 transition-colors"
            style={{ background: colors.cardBackground }}
          >
            <span className="text-sm font-medium" style={{ color: colors.text }}>
              ⚙️ Advanced Settings
            </span>
            {showAdvancedSettings ? (
              <ChevronUp className="w-4 h-4" style={{ color: colors.textSecondary }} />
            ) : (
              <ChevronDown className="w-4 h-4" style={{ color: colors.textSecondary }} />
            )}
          </button>

          {showAdvancedSettings && (
            <div className="p-4 space-y-4 border-t" style={{ borderColor: colors.border }}>
              {/* Mode */}
              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: colors.text }}>
                  Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTailorEditMode?.('partial')}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: (!tailorEditMode || tailorEditMode?.toLowerCase() === 'partial') ? '#3b82f6' : colors.inputBackground,
                      color: (!tailorEditMode || tailorEditMode?.toLowerCase() === 'partial') ? '#ffffff' : colors.text,
                      border: `1px solid ${(!tailorEditMode || tailorEditMode?.toLowerCase() === 'partial') ? '#3b82f6' : colors.border}`
                    }}
                  >
                    Partial
                  </button>
                  <button
                    onClick={() => setTailorEditMode?.('full')}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: tailorEditMode?.toLowerCase() === 'full' ? '#3b82f6' : colors.inputBackground,
                      color: tailorEditMode?.toLowerCase() === 'full' ? '#ffffff' : colors.text,
                      border: `1px solid ${tailorEditMode?.toLowerCase() === 'full' ? '#3b82f6' : colors.border}`
                    }}
                  >
                    Full
                  </button>
                </div>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: colors.text }}>
                  Writing Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['professional', 'technical', 'creative', 'casual'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone?.(tone)}
                      className="py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all"
                      style={{
                        background: selectedTone === tone ? '#3b82f6' : colors.inputBackground,
                        color: selectedTone === tone ? '#ffffff' : colors.text,
                        border: `1px solid ${selectedTone === tone ? '#3b82f6' : colors.border}`
                      }}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: colors.text }}>
                  Length
                </label>
                <div className="flex gap-2">
                  {['brief', 'thorough', 'complete'].map((length) => (
                    <button
                      key={length}
                      onClick={() => setSelectedLength?.(length)}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all"
                      style={{
                        background: selectedLength === length ? '#3b82f6' : colors.inputBackground,
                        color: selectedLength === length ? '#ffffff' : colors.text,
                        border: `1px solid ${selectedLength === length ? '#3b82f6' : colors.border}`
                      }}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset to Defaults Button */}
              {onResetTailoringPreferences && (
                <div className="pt-2 border-t" style={{ borderColor: colors.border }}>
                  <button
                    onClick={onResetTailoringPreferences}
                    className="w-full py-2 px-3 rounded-md text-xs font-medium transition-all hover:opacity-80"
                    style={{
                      background: 'transparent',
                      color: colors.textSecondary,
                      border: `1px dashed ${colors.border}`,
                    }}
                  >
                    🔄 Reset to Defaults
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Other AI Actions */}
        <div className="space-y-2 pt-2" style={{ width: '100%', maxWidth: '100%' }}>
          <button
            onClick={onGenerateCoverLetter}
            disabled={isGeneratingCoverLetter}
            className="w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: colors.inputBackground,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {isGeneratingCoverLetter ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              'Generate Cover Letter'
            )}
          </button>
          <button
            onClick={onGeneratePortfolio}
            disabled={isGeneratingPortfolio}
            className="w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: colors.inputBackground,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {isGeneratingPortfolio ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              'Generate Portfolio Outline'
            )}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

