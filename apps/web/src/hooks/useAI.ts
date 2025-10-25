import { useState } from 'react';
import { AIMessage } from '../types/resume';

// AI state hook
export const useAI = () => {
  const [aiMode, setAiMode] = useState('tailor');
  const [selectedModel, setSelectedModel] = useState('gpt-5');
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
  const [aiConversation, setAiConversation] = useState<AIMessage[]>([]);

  return {
    aiMode,
    setAiMode,
    selectedModel,
    setSelectedModel,
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
    aiConversation,
    setAiConversation
  };
};
