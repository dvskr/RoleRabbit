'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Import types
import type { AIPortfolioBuilderProps } from './AIPortfolioBuilder/types/aiPortfolioBuilder';

// Import hooks
import { useAIPortfolioBuilder } from './AIPortfolioBuilder/hooks/useAIPortfolioBuilder';

// Import components
import { Header } from './AIPortfolioBuilder/components/Header';
import { Tabs } from './AIPortfolioBuilder/components/Tabs';
import { ChatPanel } from './AIPortfolioBuilder/components/ChatPanel';
import { StylePanel } from './AIPortfolioBuilder/components/StylePanel';
import { SectionsPanel } from './AIPortfolioBuilder/components/SectionsPanel';
import { PreviewPanel } from './AIPortfolioBuilder/components/PreviewPanel';

export default function AIPortfolioBuilder({ profileData }: AIPortfolioBuilderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const colors = theme.colors;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use custom hook for all state management
  const {
    activeTab,
    setActiveTab,
    currentStep,
    setCurrentStep,
    deviceView,
    setDeviceView,
    designStyle,
    setDesignStyle,
    themeColor,
    setThemeColor,
    typography,
    setTypography,
    messages,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleQuickAction,
    sections,
    toggleSectionVisibility,
    deleteSection,
    addSection
  } = useAIPortfolioBuilder({ profileData });

  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-full flex flex-col" suppressHydrationWarning style={{ background: colors.background }}>
      {/* Header with Progress Steps */}
      <Header
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        colors={colors}
      />

      {/* Main Content Area - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Configuration */}
        <div 
          className="w-96 border-r overflow-y-auto"
          style={{
            background: colors.cardBackground,
            borderRight: `1px solid ${colors.border}`,
          }}
        >
          {/* Tabs */}
          <Tabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            colors={colors}
          />

          {/* Tab Content */}
          <div className="p-4" suppressHydrationWarning>
            {activeTab === 'ai-chat' && (
              <ChatPanel
                messages={messages}
                inputMessage={inputMessage}
                onInputChange={setInputMessage}
                onSendMessage={handleSendMessage}
                onQuickAction={handleQuickAction}
                colors={colors}
              />
            )}

            {activeTab === 'style' && (
              <StylePanel
                designStyle={designStyle}
                themeColor={themeColor}
                typography={typography}
                onDesignStyleChange={setDesignStyle}
                onThemeColorChange={setThemeColor}
                onTypographyChange={setTypography}
                colors={colors}
              />
            )}

            {activeTab === 'sections' && (
              <SectionsPanel
                sections={sections}
                onToggleVisibility={toggleSectionVisibility}
                onDelete={deleteSection}
                onAdd={addSection}
                colors={colors}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <PreviewPanel
          deviceView={deviceView}
          onDeviceViewChange={setDeviceView}
          colors={colors}
        />
      </div>
    </div>
  );
}
