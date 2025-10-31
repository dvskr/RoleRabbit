import { useState } from 'react';
import { ATSAnalysisResult } from '../types/AIPanel.types';
import { calculateATSScore } from '../utils/atsHelpers';

export const useATSData = () => {
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [afterScore, setAfterScore] = useState<number | null>(null);
  const [showApplyButton, setShowApplyButton] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [improvedResumeData, setImprovedResumeData] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleATSAnalysis = (resumeData: any, jobDescription: string) => {
    if (!jobDescription.trim() || !resumeData) return;
    
    const result = calculateATSScore(resumeData, jobDescription);
    setAtsAnalysis(result);
    setBeforeScore(result.overall);
    setShowApplyButton(true);
    return result;
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

