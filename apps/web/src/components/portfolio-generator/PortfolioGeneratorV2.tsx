'use client';

import React, { useState } from 'react';
import { X, Sparkles, Eye, Wand2, Package, CheckCircle } from 'lucide-react';
import SetupStep from './SetupStep';
import ChatInterface from './ChatInterface';
import AnimatedPreview from './AnimatedPreview';
import AICustomizationPanel from './AICustomizationPanel';
import PublishStep from './PublishStep';

interface PortfolioGeneratorV2Props {
  onClose?: () => void;
  profileData?: any;
}

type Step = 'setup' | 'ai-chat' | 'preview-customize' | 'publish';

export default function PortfolioGeneratorV2({ onClose, profileData }: PortfolioGeneratorV2Props) {
  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [setupData, setSetupData] = useState<any>(null);
  const [portfolioData, setPortfolioData] = useState<any>(null);

  // Load profile data from localStorage if not provided
  const [loadedProfileData] = useState(() => {
    if (profileData) return profileData;
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSetupComplete = (data: any) => {
    setSetupData(data);
    setCurrentStep('ai-chat');
  };

  const handleChatComplete = (data: any) => {
    const combined = { ...setupData, ...data };
    setPortfolioData(combined);
    setCurrentStep('preview-customize');
  };

  const handleAICustomization = (updatedData: any) => {
    setPortfolioData(updatedData);
  };

  const getStepIcon = (step: Step) => {
    switch (step) {
      case 'setup': return <Sparkles size={16} />;
      case 'ai-chat': return <Wand2 size={16} />;
      case 'preview-customize': return <Eye size={16} />;
      case 'publish': return <Package size={16} />;
    }
  };

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'setup', label: 'Setup', icon: <Sparkles size={16} /> },
    { id: 'ai-chat', label: 'AI Enhance', icon: <Wand2 size={16} /> },
    { id: 'preview-customize', label: 'Customize', icon: <Eye size={16} /> },
    { id: 'publish', label: 'Publish', icon: <Package size={16} /> }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          {/* Progress Steps - Left */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    // Allow navigation to current or any previous step
                    if (index <= currentStepIndex) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    step.id === currentStep
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                      : index < currentStepIndex
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={index > currentStepIndex}
                  title={
                    index <= currentStepIndex && step.id !== currentStep
                      ? `Click to go back to ${step.label}`
                      : index > currentStepIndex
                      ? `Complete previous steps first`
                      : ''
                  }
                >
                  {index < currentStepIndex ? (
                    <CheckCircle size={16} />
                  ) : (
                    step.icon
                  )}
                  <span className="text-sm font-medium">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-6 h-0.5 bg-gray-200 relative">
                    <div
                      className={`h-full transition-all ${
                        index < currentStepIndex
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentStep === 'setup' && (
          <SetupStep profileData={loadedProfileData} onComplete={handleSetupComplete} />
        )}

        {currentStep === 'ai-chat' && (
          <div className="h-full">
            <ChatInterface 
              onComplete={handleChatComplete} 
              profileData={loadedProfileData}
              initialData={setupData}
            />
          </div>
        )}

        {currentStep === 'preview-customize' && portfolioData && (
          <div className="h-full flex">
            <div className="flex-1 overflow-hidden">
              <AnimatedPreview portfolioData={portfolioData} template={portfolioData.template || 'modern'} />
            </div>
            <AICustomizationPanel 
              portfolioData={portfolioData}
              onUpdate={handleAICustomization}
            />
          </div>
        )}

        {currentStep === 'publish' && (
          <PublishStep portfolioData={portfolioData} onExport={() => setCurrentStep('publish')} />
        )}
      </div>
    </div>
  );
}
