'use client';

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { AIPanelProps } from './AIPanel/types/AIPanel.types';
import { useATSData } from './AIPanel/hooks/useATSData';
import { generateImprovedResume } from './AIPanel/utils/resumeImprovement';
import { calculateATSScore } from './AIPanel/utils/atsHelpers';
import PanelHeader from './AIPanel/components/PanelHeader';
import ModeSelector from './AIPanel/components/ModeSelector';
import JobDescriptionInput from './AIPanel/components/JobDescriptionInput';
import ATSSettings from './AIPanel/components/ATSSettings';
import ATSResults from './AIPanel/components/ATSResults';
import KeywordsDisplay from './AIPanel/components/KeywordsDisplay';
import AIRecommendations from './AIPanel/components/AIRecommendations';
import ChatInterface from './AIPanel/components/ChatInterface';

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
  aiConversation,
  aiPrompt,
  setAiPrompt,
  selectedModel,
  setSelectedModel,
  isMobile,
  resumeData,
  onAnalyzeJobDescription,
  onApplyAIRecommendations,
  onSendAIMessage,
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
  
  const handleATSAnalysis = () => {
    if (!jobDescription.trim() || !resumeData) return;
    
    const result = handleATSAnalysisFromHook(resumeData, jobDescription);
    if (result) {
    setShowATSScore(true);
    }
  };
  
  const handleApplyImprovements = () => {
    if (!resumeData || isApplying || !atsAnalysis) return;
    
    setIsApplyingValue(true);
    
    // Mock AI improvements - in real implementation, this would call an AI API
    setTimeout(() => {
      const improvedData = generateImprovedResume(resumeData, jobDescription, atsAnalysis);
      
      // Calculate after score
      const afterResult = calculateATSScore(improvedData, jobDescription);
      setAfterScoreValue(afterResult.overall);
      setIsApplyingValue(false);
      setIsAppliedValue(true);
      
      // Apply the improvements to the resume
      onApplyAIRecommendations();
      onResumeUpdate?.(improvedData);
    }, 1500);
  };
  
  const handleClear = () => {
    handleClearAnalysis();
    setJobDescription('');
    setShowATSScore(false);
  };
  
  if (!showRightPanel) return null;

  return (
    <div 
      className={`h-full shadow-2xl z-40 ${isMobile ? 'w-full' : 'w-80'} border-l transition-all`}
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
              </div>
            )}

            {/* Chat Mode Content */}
            {aiMode === 'chat' && (
              <ChatInterface
                aiConversation={aiConversation}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                onSendAIMessage={onSendAIMessage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
