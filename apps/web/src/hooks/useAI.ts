import { useState } from 'react';
import type { TailorResult, CoverLetterDraft, PortfolioDraft } from '../types/ai';

// AI state hook
export const useAI = () => {
  const [aiMode, setAiMode] = useState('tailor');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [showATSScore, setShowATSScore] = useState(false);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [tailorEditMode, setTailorEditMode] = useState('partial');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('concise');
  const [tailorResult, setTailorResult] = useState<TailorResult | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [coverLetterDraft, setCoverLetterDraft] = useState<CoverLetterDraft | null>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [portfolioDraft, setPortfolioDraft] = useState<PortfolioDraft | null>(null);
  const [isGeneratingPortfolio, setIsGeneratingPortfolio] = useState(false);

  return {
    aiMode,
    setAiMode,
    jobDescription,
    setJobDescription,
    isAnalyzing,
    setIsAnalyzing,
    matchScore,
    setMatchScore,
    showATSScore,
    setShowATSScore,
    matchedKeywords,
    setMatchedKeywords,
    missingKeywords,
    setMissingKeywords,
    aiRecommendations,
    setAiRecommendations,
    tailorEditMode,
    setTailorEditMode,
    selectedTone,
    setSelectedTone,
    selectedLength,
    setSelectedLength,
    tailorResult,
    setTailorResult,
    isTailoring,
    setIsTailoring,
    coverLetterDraft,
    setCoverLetterDraft,
    isGeneratingCoverLetter,
    setIsGeneratingCoverLetter,
    portfolioDraft,
    setPortfolioDraft,
    isGeneratingPortfolio,
    setIsGeneratingPortfolio
  };
};
