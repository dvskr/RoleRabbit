'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { AIPanelProps } from './AIPanel/types/AIPanel.types';
import type { ATSAnalysisResult } from '../../types/ai';
import { useATSData } from './AIPanel/hooks/useATSData';
import PanelHeader from './AIPanel/components/PanelHeader';
import ModeSelector from './AIPanel/components/ModeSelector';
import JobDescriptionInput from './AIPanel/components/JobDescriptionInput';
import ATSSettings from './AIPanel/components/ATSSettings';
import ATSResults from './AIPanel/components/ATSResults';
import KeywordsDisplay from './AIPanel/components/KeywordsDisplay';
import AIRecommendations from './AIPanel/components/AIRecommendations';
import { downloadTextFile } from '../../utils/download';
import TailoredDiffViewer from './AIPanel/components/TailoredDiffViewer';
import { copyToClipboard } from '../../utils/clipboard';

const mapServerAnalysisToATS = (analysis: any): ATSAnalysisResult => ({
  overall: analysis?.overall ?? 0,
  keywords: analysis?.keywords ?? 0,
  format: analysis?.format ?? 0,
  content: analysis?.content ?? 0,
  experience: analysis?.experience ?? 0,
  strengths: analysis?.strengths ?? [],
  improvements: analysis?.improvements ?? [],
  missingKeywords: analysis?.missingKeywords ?? []
});

const buildCoverLetterText = (draft: any) => {
  const paragraphs = Array.isArray(draft.bodyParagraphs) ? draft.bodyParagraphs : [];
  return [draft.greeting, ...paragraphs, `${draft.closing}\n${draft.signature}`]
    .filter(Boolean)
    .join('\n\n');
};

const buildPortfolioText = (draft: any) => {
  const highlights = Array.isArray(draft.highlights) ? draft.highlights : [];
  const projects = Array.isArray(draft.selectedProjects) ? draft.selectedProjects : [];
  const lines = [
    draft.headline,
    draft.tagline,
    '',
    draft.about,
    '',
    highlights.length ? 'Highlights:' : null,
    ...highlights.map((item: string) => `- ${item}`),
    '',
    projects.length ? 'Selected Projects:' : null,
    ...projects.map((project: any) => {
      const tech = project.technologies?.length ? ` [${project.technologies.join(', ')}]` : '';
      return `• ${project.name}: ${project.summary}${tech}`;
    })
  ].filter(Boolean);

  return lines.join('\n');
};

export default function AIPanel({
  showRightPanel,
  setShowRightPanel,
  aiMode,
  setAiMode,
  jobDescription,
  setJobDescription,
  isAnalyzing,
  matchScore,
  showATSScore,
  setShowATSScore,
  matchedKeywords,
  missingKeywords,
  aiRecommendations,
  setAiRecommendations,
  tailorEditMode,
  setTailorEditMode,
  selectedTone,
  setSelectedTone,
  selectedLength,
  setSelectedLength,
  isMobile,
  resumeData,
  onAnalyzeJobDescription,
  onApplyAIRecommendations,
  onTailorResume,
  onGenerateCoverLetter,
  onGeneratePortfolio,
  tailorResult,
  setTailorResult,
  coverLetterDraft,
  setCoverLetterDraft,
  portfolioDraft,
  setPortfolioDraft,
  isTailoring,
  isGeneratingCoverLetter,
  isGeneratingPortfolio,
  onResumeUpdate
}: AIPanelProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const {
    atsAnalysis,
    beforeScore,
    afterScore,
    showApplyButton,
    isApplied,
    isApplying,
    setAtsAnalysis,
    handleATSAnalysis: handleATSAnalysisFromHook,
    handleClearAnalysis,
    setAfterScoreValue,
    setIsAppliedValue,
    setIsApplyingValue,
  } = useATSData();
  
  const handleATSAnalysis = async () => {
    if (!jobDescription.trim()) return;
    const response = await onAnalyzeJobDescription?.();
    const analysis = response?.analysis;
    if (analysis) {
      const mapped = mapServerAnalysisToATS(analysis);
      handleATSAnalysisFromHook(mapped, {
        canApply: Boolean(response?.improvements?.length),
        improvedResume: null
      });
      setShowATSScore(true);
    }
  };
  
  const handleApplyImprovements = async () => {
    if (isApplying || !atsAnalysis) return;

    setIsApplyingValue(true);
    try {
      const response = await onApplyAIRecommendations?.();
      const afterScore = response?.ats?.after?.overall;
      if (typeof afterScore === 'number') {
        setAfterScoreValue(afterScore);
      }
      if (response) {
        setIsAppliedValue(true);
        setShowApplyButton(false);
      }
    } finally {
      setIsApplyingValue(false);
    }
  };

  const handleTailorResume = async () => {
    if (!jobDescription.trim()) return;
    await onTailorResume?.();
  };

  const handleGenerateCoverLetter = async () => {
    await onGenerateCoverLetter?.();
  };

  const handleGeneratePortfolio = async () => {
    await onGeneratePortfolio?.();
  };

  const handleClear = () => {
    handleClearAnalysis();
    setJobDescription('');
    setShowATSScore(false);
  };
  
  if (!showRightPanel) return null;

  return (
    <div 
      className={`h-full shadow-2xl z-40 ${isMobile ? 'w-full' : 'w-full'} border-l transition-all`}
      style={{
        background: colors.cardBackground,
        borderLeft: `1px solid ${colors.border}`,
      }}
    >
      <div className="h-full flex flex-col">
        <PanelHeader 
          colors={colors}
          onClose={() => setShowRightPanel(false)}
          onClear={handleClear}
        />

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto" style={{ background: colors.background }}>
          <div className="p-6 space-y-6">
            <ModeSelector 
              aiMode={aiMode}
              setAiMode={setAiMode}
              colors={colors}
            />

            {/* Tailor Mode Content */}
            {aiMode === 'tailor' && (
              <div className="space-y-6">
                <JobDescriptionInput
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  colors={colors}
                  showApplyButton={showApplyButton}
                  isApplied={isApplied}
                  isApplying={isApplying}
                  isAnalyzing={isAnalyzing}
                  resumeData={resumeData}
                  onATSAnalysis={handleATSAnalysis}
                  onApplyImprovements={handleApplyImprovements}
                />

                <ATSSettings
                  colors={colors}
                  tailorEditMode={tailorEditMode}
                  setTailorEditMode={setTailorEditMode}
                  selectedTone={selectedTone}
                  setSelectedTone={setSelectedTone}
                  selectedLength={selectedLength}
                  setSelectedLength={setSelectedLength}
                />

                <div className="space-y-3">
                  <button
                    onClick={handleTailorResume}
                    disabled={!jobDescription.trim() || isTailoring || isAnalyzing}
                    className="w-full px-3 py-2 rounded-md text-sm font-medium text-white transition-all"
                    style={{
                      background: 'linear-gradient(90deg, rgba(79,70,229,1) 0%, rgba(99,102,241,1) 100%)',
                      opacity: !jobDescription.trim() || isTailoring || isAnalyzing ? 0.6 : 1,
                      cursor: !jobDescription.trim() || isTailoring || isAnalyzing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isTailoring ? 'Tailoring…' : 'Tailor Resume with AI'}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleGenerateCoverLetter}
                      disabled={isGeneratingCoverLetter || !jobDescription.trim()}
                      className="px-3 py-2 rounded-md text-sm font-medium border transition-all"
                      style={{
                        borderColor: colors.border,
                        background: colors.cardBackground,
                        color: colors.primaryText,
                        opacity: isGeneratingCoverLetter || !jobDescription.trim() ? 0.6 : 1
                      }}
                    >
                      {isGeneratingCoverLetter ? 'Generating…' : 'Generate Cover Letter'}
                    </button>
                    <button
                      onClick={handleGeneratePortfolio}
                      disabled={isGeneratingPortfolio}
                      className="px-3 py-2 rounded-md text-sm font-medium border transition-all"
                      style={{
                        borderColor: colors.border,
                        background: colors.cardBackground,
                        color: colors.primaryText,
                        opacity: isGeneratingPortfolio ? 0.6 : 1
                      }}
                    >
                      {isGeneratingPortfolio ? 'Generating…' : 'Generate Portfolio Outline'}
                    </button>
                  </div>
                </div>

                {atsAnalysis && (
                  <ATSResults
                    atsAnalysis={atsAnalysis}
                    beforeScore={beforeScore}
                    afterScore={afterScore}
                  />
                )}

                <KeywordsDisplay
                  matchedKeywords={matchedKeywords}
                  missingKeywords={missingKeywords}
                />

                <AIRecommendations
                  aiRecommendations={aiRecommendations}
                  onApplyAIRecommendations={onApplyAIRecommendations}
                  setAiRecommendations={setAiRecommendations}
                />

                {tailorResult && (
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-indigo-900">Tailored Resume Draft Saved</h4>
                        <p className="text-xs text-indigo-700 mt-1">
                          A tailored version has been generated using {tailorResult.mode === 'FULL' ? 'full rewrite' : 'partial edits'} mode. Review the highlights below — the detailed draft lives in Tailored Versions.
                        </p>
                      </div>
                      <button
                        onClick={() => setTailorResult(null)}
                        className="text-xs text-indigo-800 underline"
                      >
                        Dismiss
                      </button>
                    </div>

                    {(tailorResult.ats?.before || tailorResult.ats?.after) && (
                      <div className="grid grid-cols-2 gap-3 text-xs text-indigo-800">
                        <div className="rounded-md bg-white border border-indigo-100 p-3">
                          <p className="font-medium text-indigo-900">ATS Score</p>
                          <p className="mt-1">Before: {tailorResult.ats?.before?.overall ?? '—'}</p>
                          <p>After: {tailorResult.ats?.after?.overall ?? '—'}</p>
                        </div>
                        <div className="rounded-md bg-white border border-indigo-100 p-3">
                          <p className="font-medium text-indigo-900">Confidence</p>
                          <p className="mt-1">{tailorResult.confidence ? `${Math.round(tailorResult.confidence * 100)}%` : 'Not provided'}</p>
                        </div>
                      </div>
                    )}

                    {tailorResult.recommendedKeywords?.length ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-indigo-900">Recommended keywords to weave in</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tailorResult.recommendedKeywords.slice(0, 10).map((keyword) => (
                            <span
                              key={keyword}
                              className="px-2 py-0.5 rounded-full bg-white border border-indigo-200 text-xs text-indigo-700"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {tailorResult.warnings?.length ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-red-600">Warnings</p>
                        <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                          {tailorResult.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {tailorResult.diff?.length ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-indigo-900">Highlighted changes</p>
                        <TailoredDiffViewer diff={tailorResult.diff} />
                      </div>
                    ) : null}
                  </div>
                )}

                {coverLetterDraft && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-900">Cover Letter Draft</h4>
                        <p className="text-xs text-emerald-700 mt-1">Customize this copy before sending. We recommend saving it to your documents workspace.</p>
                      </div>
                      <button
                        onClick={() => setCoverLetterDraft(null)}
                        className="text-xs text-emerald-800 underline"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => copyToClipboard(buildCoverLetterText(coverLetterDraft))}
                        className="px-3 py-1.5 rounded-md border border-emerald-300 text-emerald-800 font-medium bg-white hover:bg-emerald-100 transition-all"
                      >
                        Copy to clipboard
                      </button>
                      <button
                        onClick={() => downloadTextFile(buildCoverLetterText(coverLetterDraft), 'cover-letter-draft.txt')}
                        className="px-3 py-1.5 rounded-md border border-emerald-300 text-emerald-800 font-medium bg-white hover:bg-emerald-100 transition-all"
                      >
                        Download (.txt)
                      </button>
                    </div>
                    <div className="bg-white border border-emerald-100 rounded-md p-3 space-y-2 text-sm text-emerald-900">
                      {coverLetterDraft.subject && <p className="font-medium">Subject: {coverLetterDraft.subject}</p>}
                      {coverLetterDraft.greeting && <p>{coverLetterDraft.greeting}</p>}
                      {coverLetterDraft.bodyParagraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                      <p>{coverLetterDraft.closing}</p>
                      <p className="font-medium">{coverLetterDraft.signature}</p>
                    </div>
                  </div>
                )}

                {portfolioDraft && (
                  <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-purple-900">Portfolio Outline</h4>
                        <p className="text-xs text-purple-700 mt-1">Use this structure to build a quick landing page or personal site.</p>
                      </div>
                      <button
                        onClick={() => setPortfolioDraft(null)}
                        className="text-xs text-purple-800 underline"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => copyToClipboard(buildPortfolioText(portfolioDraft))}
                        className="px-3 py-1.5 rounded-md border border-purple-300 text-purple-800 font-medium bg-white hover:bg-purple-100 transition-all"
                      >
                        Copy outline
                      </button>
                      <button
                        onClick={() => downloadTextFile(buildPortfolioText(portfolioDraft), 'portfolio-outline.txt')}
                        className="px-3 py-1.5 rounded-md border border-purple-300 text-purple-800 font-medium bg-white hover:bg-purple-100 transition-all"
                      >
                        Download (.txt)
                      </button>
                    </div>
                    <div className="bg-white border border-purple-100 rounded-md p-3 space-y-2 text-sm text-purple-900">
                      <p className="text-lg font-semibold">{portfolioDraft.headline}</p>
                      <p className="italic text-purple-700">{portfolioDraft.tagline}</p>
                      <p>{portfolioDraft.about}</p>
                      {portfolioDraft.highlights?.length ? (
                        <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                          {portfolioDraft.highlights.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      ) : null}
                      {portfolioDraft.selectedProjects?.length ? (
                        <div className="space-y-2">
                          {portfolioDraft.selectedProjects.map((project, index) => (
                            <div key={index} className="border border-purple-100 rounded-md p-2">
                              <p className="font-medium text-purple-900">{project.name}</p>
                              <p className="text-sm text-purple-800">{project.summary}</p>
                              {project.technologies?.length ? (
                                <p className="text-xs text-purple-700 mt-1">Tech: {project.technologies.join(', ')}</p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
