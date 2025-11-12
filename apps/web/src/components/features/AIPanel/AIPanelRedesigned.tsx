'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { AIPanelProps, ApplyChangesHandlerDeps } from './types/AIPanel.types';
import { ChevronDown, ChevronUp, X, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AIOperationProgress } from '../../common/AIOperationProgress';
import { InlineProgress } from '../../common/InlineProgress';

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
      await analyzeJobDescription?.();
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
    await onAnalyzeJobDescription?.();
  };

  const handleAutoTailor = async () => {
    if (typeof matchScore?.overall === 'number') {
      setBeforeScore(matchScore.overall);
    }
    setApplyError(null);
    await onTailorResume?.();
  };

  const handleApplyChanges = useCallback(
    () =>
      createApplyChangesHandler({
        confirmTailorChanges: onConfirmTailorChanges,
        analyzeJobDescription: onAnalyzeJobDescription,
        setApplyError,
        setBeforeScore,
      })(),
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
              {jobDescription?.length || 0} characters
            </span>
            {jobDescription && jobDescription.length < 10 && (
              <span className="text-xs" style={{ color: '#ef4444' }}>
                Min 10 characters
              </span>
            )}
          </div>

          {/* ATS Progress or Button */}
          {isAnalyzing && atsProgress?.isActive ? (
            <AIOperationProgress
              operation="ats"
              stage={atsProgress.stage || 'Starting'}
              progress={atsProgress.progress || 0}
              estimatedTime={atsProgress.estimatedTime}
              elapsedTime={atsProgress.elapsedTime || 0}
              message={atsProgress.message}
            />
          ) : (
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !jobDescription || jobDescription.length < 10}
              className="w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: colors.activeBlueText,
                opacity: isAnalyzing || !jobDescription || jobDescription.length < 10 ? 0.5 : 1,
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
          )}
        </div>

        {/* Step 2: ATS Results */}
        {showATSScore && matchScore && (
          <div
            className="p-4 rounded-lg space-y-3"
            style={{
              background: theme.mode === 'light' ? '#fafafa' : colors.hoverBackground,
              border: `1px solid ${colors.border}`,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflowX: 'hidden'
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: colors.text }}>
                {beforeScore ? 'Before' : 'ATS Score'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold" style={{ color: scoreInfo.color }}>
                  {matchScore.overall}/100
                </span>
                <span
                  className="text-xs font-medium px-2 py-1 rounded"
                  style={{ background: scoreInfo.bg, color: scoreInfo.color }}
                >
                  {scoreInfo.label}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div 
              className="w-full h-2 rounded-full" 
              style={{ 
                background: colors.border, 
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden'
              }}
            >
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${matchScore.overall}%`,
                  background: scoreInfo.color
                }}
              />
            </div>

            {/* Quick Summary */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                {effectiveMatchedKeywords.length > 0 ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#10b981' }} />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                )}
                <span className="text-xs" style={{ color: colors.textSecondary }}>
                  {effectiveMatchedKeywords.length} skills matched
                </span>
              </div>
              
              {topMissingSkills.length > 0 && (
                <div className="space-y-1" style={{ width: '100%', maxWidth: '100%' }}>
                  <span className="text-xs font-medium" style={{ color: colors.text }}>
                    Missing Skills:
                  </span>
                  <div className="flex flex-wrap gap-1" style={{ width: '100%', maxWidth: '100%' }}>
                    {topMissingSkills.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: '#fee2e2',
                          color: '#ef4444',
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                          display: 'inline-block'
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Show Details Toggle */}
            <button
              onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
              className="w-full py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              style={{
                color: colors.activeBlueText,
                background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground
              }}
            >
              {showDetailedBreakdown ? 'Hide Details' : 'Show Details'}
              {showDetailedBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Detailed Breakdown */}
            {showDetailedBreakdown && (
              <div className="space-y-2 pt-2 border-t" style={{ borderColor: colors.border }}>
                <div className="text-xs font-medium" style={{ color: colors.text }}>
                  Breakdown:
                </div>
                {matchScore.keywords !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: colors.textSecondary }}>Keywords</span>
                    <span className="text-xs font-medium" style={{ color: colors.text }}>{matchScore.keywords}/100</span>
                  </div>
                )}
                {matchScore.experience !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: colors.textSecondary }}>Experience</span>
                    <span className="text-xs font-medium" style={{ color: colors.text }}>{matchScore.experience}/100</span>
                  </div>
                )}
                {matchScore.format !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: colors.textSecondary }}>Format</span>
                    <span className="text-xs font-medium" style={{ color: colors.text }}>{matchScore.format}/100</span>
                  </div>
                )}
                
                {improvements.length > 0 && (
                  <div className="pt-2 space-y-1">
                    <div className="text-xs font-medium" style={{ color: colors.text }}>
                      Quick Wins:
                    </div>
                    {improvements.map((imp, idx) => (
                      <div key={idx} className="text-xs pl-3" style={{ color: colors.textSecondary }}>
                        • {imp}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Auto-Tailor Button or Progress */}
            {!tailorResult && (
              <>
                {isTailoring && tailorProgress?.isActive ? (
                  <AIOperationProgress
                    operation="tailor"
                    stage={tailorProgress.stage || 'Starting'}
                    progress={tailorProgress.progress || 0}
                    estimatedTime={tailorProgress.estimatedTime}
                    elapsedTime={tailorProgress.elapsedTime || 0}
                    message={tailorProgress.message}
                  />
                ) : (
                  <button
                    onClick={handleAutoTailor}
                    disabled={isTailoring}
                    className="w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: '#10b981',
                      opacity: isTailoring ? 0.5 : 1,
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    {isTailoring ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Tailoring Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Auto-Tailor Resume
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Tailor Results - After Score */}
        {tailorResult && (
          <div
            className="p-4 rounded-lg space-y-3"
            style={{
              background: '#d1fae5',
              border: `1px solid #10b981`
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
              <span className="text-sm font-bold" style={{ color: '#065f46' }}>
                Resume Tailored Successfully!
              </span>
            </div>

            {/* Before/After Comparison */}
            {beforeTailorScore !== null && afterTailorScore !== null && (
              <div className="flex items-center justify-between py-2">
                <div className="text-center flex-1">
                  <div className="text-xs" style={{ color: '#065f46' }}>Before</div>
                  <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{beforeTailorScore}</div>
                </div>
                <div className="text-2xl font-bold" style={{ color: '#065f46' }}>→</div>
                <div className="text-center flex-1">
                  <div className="text-xs" style={{ color: '#065f46' }}>After</div>
                  <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{afterTailorScore}</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs" style={{ color: '#065f46' }}>Improvement</div>
                  <div className="text-xl font-bold" style={{ color: '#10b981' }}>
                    +{afterTailorScore - beforeTailorScore}
                  </div>
                </div>
              </div>
            )}

            {/* Changes Summary */}
            {tailorResult.diff && tailorResult.diff.length > 0 && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium" style={{ color: '#065f46' }}>
                    Changes Made:
                  </div>
                  <div className="text-xs" style={{ color: '#065f46' }}>
                    • Modified {tailorResult.diff.length} {tailorResult.diff.length === 1 ? 'section' : 'sections'}
                  </div>
                  {tailorResult.recommendedKeywords && tailorResult.recommendedKeywords.length > 0 && (
                    <div className="text-xs" style={{ color: '#065f46' }}>
                      • Added {tailorResult.recommendedKeywords.length}{' '}
                      {tailorResult.recommendedKeywords.length === 1 ? 'keyword' : 'keywords'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowDiffPreview((current) => !current)}
                  className="w-full py-2 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  style={{
                    background: '#ffffff',
                    color: '#047857',
                    border: '1px solid rgba(4, 120, 87, 0.2)',
                  }}
                >
                  {showDiffPreview ? 'Hide Detailed Changes' : 'View Detailed Changes'}
                  {showDiffPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {showDiffPreview && (
                  <div
                    className="space-y-3 p-3 rounded-md"
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid rgba(5, 150, 105, 0.25)',
                      maxHeight: '240px',
                      overflowY: 'auto',
                    }}
                  >
                    {diffPreviewEntries.map((entry, index) => (
                      <div
                        key={`${entry.path}-${index}`}
                        className="space-y-2 text-xs"
                        style={{ color: '#065f46' }}
                      >
                        <div className="font-semibold break-words">{entry.path || 'Unknown path'}</div>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <div className="uppercase tracking-wide text-[10px] font-semibold opacity-70">
                              Before
                            </div>
                            <pre
                              className="mt-1 text-[11px] leading-snug whitespace-pre-wrap break-words border rounded-md p-2 bg-white/70"
                              style={{ borderColor: 'rgba(5, 150, 105, 0.15)', color: '#064e3b' }}
                            >
                              {formatDiffValue(entry.before)}
                            </pre>
                          </div>
                          <div>
                            <div className="uppercase tracking-wide text-[10px] font-semibold opacity-70">
                              After
                            </div>
                            <pre
                              className="mt-1 text-[11px] leading-snug whitespace-pre-wrap break-words border rounded-md p-2 bg-white"
                              style={{ borderColor: 'rgba(5, 150, 105, 0.25)', color: '#047857' }}
                            >
                              {formatDiffValue(entry.after)}
                            </pre>
                          </div>
                        </div>
                        {typeof entry.confidence === 'number' && (
                          <div className="text-[10px] uppercase opacity-70">
                            Confidence: {(entry.confidence * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    ))}
                    {tailorResult.diff.length > diffPreviewEntries.length && (
                      <div className="text-[11px]" style={{ color: '#047857' }}>
                        Showing first {diffPreviewEntries.length} of {tailorResult.diff.length} changes.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleApplyChanges}
                disabled={isSavingResume}
                className="flex-1 py-2 px-4 rounded-lg font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: '#10b981' }}
              >
                {isSavingResume ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Apply Changes'
                )}
              </button>
              <button
                onClick={() => setTailorResult?.(null)}
                className="px-4 py-2 rounded-lg font-medium"
                style={{
                  color: '#065f46',
                  background: '#ffffff'
                }}
              >
                Dismiss
              </button>
            </div>
            {applyError && (
              <div className="flex items-start gap-2 mt-2 text-xs" style={{ color: '#b91c1c' }}>
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{applyError}</span>
              </div>
            )}
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
                    onClick={() => setTailorEditMode?.('PARTIAL')}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: (!tailorEditMode || tailorEditMode === 'PARTIAL') ? colors.activeBlueText : colors.inputBackground,
                      color: (!tailorEditMode || tailorEditMode === 'PARTIAL') ? '#ffffff' : colors.text,
                      border: `1px solid ${(!tailorEditMode || tailorEditMode === 'PARTIAL') ? colors.activeBlueText : colors.border}`
                    }}
                  >
                    Partial
                  </button>
                  <button
                    onClick={() => setTailorEditMode?.('FULL')}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: tailorEditMode === 'FULL' ? colors.activeBlueText : colors.inputBackground,
                      color: tailorEditMode === 'FULL' ? '#ffffff' : colors.text,
                      border: `1px solid ${tailorEditMode === 'FULL' ? colors.activeBlueText : colors.border}`
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
                      className="py-2 px-3 rounded-lg text-xs font-medium capitalize transition-colors"
                      style={{
                        background: selectedTone === tone ? colors.activeBlueText : colors.inputBackground,
                        color: selectedTone === tone ? '#ffffff' : colors.text,
                        border: `1px solid ${selectedTone === tone ? colors.activeBlueText : colors.border}`
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
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-medium capitalize transition-colors"
                      style={{
                        background: selectedLength === length ? colors.activeBlueText : colors.inputBackground,
                        color: selectedLength === length ? '#ffffff' : colors.text,
                        border: `1px solid ${selectedLength === length ? colors.activeBlueText : colors.border}`
                      }}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>
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

