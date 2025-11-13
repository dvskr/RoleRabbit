import { useState, useEffect, useRef } from 'react';
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
  
  // Track if preferences have been initialized to prevent auto-save on first load
  const [prefsInitialized, setPrefsInitialized] = useState(false);
  const isInitialLoadRef = useRef(true);

  // Apply loaded preferences to state (only once when preferences load)
  useEffect(() => {
    if (!prefsLoading && preferences) {
      setTailorEditMode(preferences.mode);
      setSelectedTone(preferences.tone);
      setSelectedLength(preferences.length);
      // Mark as initialized after applying loaded preferences
      // Use setTimeout to ensure state updates complete before marking as initialized
      setTimeout(() => {
        setPrefsInitialized(true);
        isInitialLoadRef.current = false;
      }, 100);
    }
  }, [prefsLoading, preferences]);

  // Auto-save preferences when they change (with debounce)
  // BUT: Skip auto-save until preferences have been initialized from the server
  useEffect(() => {
    // Skip if still loading, not initialized, or this is the initial load
    if (prefsLoading || !prefsInitialized || isInitialLoadRef.current) {
      return;
    }
    
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
  }, [tailorEditMode, selectedTone, selectedLength, prefsLoading, prefsInitialized, updatePreferences]);

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
