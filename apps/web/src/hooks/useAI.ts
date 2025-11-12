import { useState, useEffect } from 'react';
import type { TailorResult, CoverLetterDraft, PortfolioDraft, ATSAnalysisResult } from '../types/ai';
import { useTailoringPreferences } from './useTailoringPreferences';

// AI state hook
export const useAI = () => {
  const [aiMode, setAiMode] = useState('tailor');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchScore, setMatchScore] = useState<ATSAnalysisResult | null>(null);
  const [showATSScore, setShowATSScore] = useState(false);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [tailorEditMode, setTailorEditMode] = useState('partial');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('thorough');
  const [tailorResult, setTailorResult] = useState<TailorResult | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);
  const [coverLetterDraft, setCoverLetterDraft] = useState<CoverLetterDraft | null>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [portfolioDraft, setPortfolioDraft] = useState<PortfolioDraft | null>(null);
  const [isGeneratingPortfolio, setIsGeneratingPortfolio] = useState(false);

  // Load user preferences
  const { preferences, updatePreferences, resetPreferences, loading: prefsLoading } = useTailoringPreferences();

  // Apply loaded preferences to state (only once when preferences load)
  useEffect(() => {
    if (!prefsLoading && preferences) {
      setTailorEditMode(preferences.mode);
      setSelectedTone(preferences.tone);
      setSelectedLength(preferences.length);
    }
  }, [prefsLoading, preferences]);

  // Auto-save preferences when they change (with debounce)
  useEffect(() => {
    if (!prefsLoading) {
      const timer = setTimeout(() => {
        updatePreferences({
          mode: tailorEditMode,
          tone: selectedTone,
          length: selectedLength,
        }).catch(() => {
          // Silent fail - preferences will be restored on next load
        });
      }, 500); // 500ms debounce

      return () => clearTimeout(timer);
    }
  }, [tailorEditMode, selectedTone, selectedLength, prefsLoading, updatePreferences]);

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
    setIsGeneratingPortfolio,
    // Preferences management
    resetTailoringPreferences: resetPreferences,
    prefsLoading,
  };
};
