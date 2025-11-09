import { useState } from 'react';
import type { ATSAnalysisResult } from '../../../types/ai';
import { calculateATSScore } from '../utils/atsHelpers';
import type { ResumeData } from '../../../types/resume';

export const useATSData = () => {
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [afterScore, setAfterScore] = useState<number | null>(null);
  const [showApplyButton, setShowApplyButton] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [improvedResumeData, setImprovedResumeData] = useState<ResumeData | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleATSAnalysis = (
    analysis: ATSAnalysisResult | null,
    options: {
      canApply?: boolean;
      improvedResume?: ResumeData | null;
      afterScore?: number | null;
    } = {}
  ) => {
    if (!analysis) {
      return;
    }
    setAtsAnalysis(analysis);
    setBeforeScore(analysis.overall ?? null);
    setShowApplyButton(Boolean(options.canApply));
    setImprovedResumeData(options.improvedResume ?? null);
    if (typeof options.afterScore === 'number') {
      setAfterScore(options.afterScore);
    }
    setIsApplied(false);
  };

  const handleClearAnalysis = () => {
    setAtsAnalysis(null);
    setBeforeScore(null);
    setAfterScore(null);
    setShowApplyButton(false);
    setIsApplied(false);
    setImprovedResumeData(null);
  };

  const setAfterScoreValue = (score: number) => {
    setAfterScore(score);
  };

  const setIsAppliedValue = (value: boolean) => {
    setIsApplied(value);
  };

  const setIsApplyingValue = (value: boolean) => {
    setIsApplying(value);
  };

  return {
    atsAnalysis,
    beforeScore,
    afterScore,
    showApplyButton,
    isApplied,
    improvedResumeData,
    isApplying,
    setAtsAnalysis,
    setImprovedResumeData,
    handleATSAnalysis,
    handleClearAnalysis,
    setAfterScoreValue,
    setIsAppliedValue,
    setIsApplyingValue,
    setShowApplyButton
  };
};

