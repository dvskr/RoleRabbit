/* eslint-disable jsx-a11y/aria-props */
import React, { useState } from 'react';
import { AdvancedAIPanelProps } from './types';
import { AVAILABLE_MODELS, DEFAULT_SELECTED_MODEL } from './constants';
import { useAdvancedAI } from './hooks/useAdvancedAI';
import { findModelById } from './utils/helpers';
import {
  AISettingsPanel,
  AIHeader,
  ModelSelector,
  QuickActionsPanel,
  ConversationPanel,
  ChatInputPanel
} from './components';

export const AdvancedAIPanel: React.FC<AdvancedAIPanelProps> = ({
  userId,
  resumeData,
  jobDescription,
  className = ''
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_SELECTED_MODEL);
  const [showSettings, setShowSettings] = useState(false);

  const selectedModelData = findModelById(AVAILABLE_MODELS, selectedModel);

  const {
    aiPrompt,
    conversation,
    isStreaming,
    streamingResponse,
    aiSettings,
    promptRef,
    setAiPrompt,
    setAiSettings,
    handleSendMessage,
    handleKeyPress,
    quickActions
  } = useAdvancedAI({
    userId,
    resumeData,
    jobDescription,
    selectedModel
  });

  return (
    <div className={`advanced-ai-panel bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <AIHeader
        selectedModel={selectedModelData}
        isStreaming={isStreaming}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {/* Model Selection */}
      <ModelSelector
        availableModels={AVAILABLE_MODELS}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* Quick Actions */}
      <QuickActionsPanel
        actions={quickActions}
        isStreaming={isStreaming}
      />

      {/* AI Settings */}
      {showSettings && (
        <AISettingsPanel
          settings={aiSettings}
          onSettingsChange={setAiSettings}
        />
      )}

      {/* Conversation */}
      <ConversationPanel
        messages={conversation}
        isStreaming={isStreaming}
        streamingResponse={streamingResponse}
      />

      {/* Input */}
      <ChatInputPanel
        prompt={aiPrompt}
        isStreaming={isStreaming}
        onPromptChange={setAiPrompt}
        onKeyPress={handleKeyPress}
        onSendMessage={handleSendMessage}
        promptRef={promptRef}
      />
    </div>
  );
};

export default AdvancedAIPanel;

