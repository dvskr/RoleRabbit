'use client';

import React from 'react';
import type { Step, StepConfig, ThemeColors } from '../types/aiPortfolioBuilder';
import { STEPS } from '../constants/aiPortfolioBuilder';

interface ProgressStepsProps {
  currentStep: Step;
  onStepClick: (step: Step) => void;
  colors: ThemeColors;
}

export function ProgressSteps({ currentStep, onStepClick, colors }: ProgressStepsProps) {
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => {
              if (index <= currentStepIndex) {
                onStepClick(step.id);
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: step.id === currentStep
                ? colors.badgeInfoBg
                : 'transparent',
              color: step.id === currentStep ? colors.badgeInfoText : index < currentStepIndex ? colors.secondaryText : colors.tertiaryText,
              border: step.id === currentStep ? `1px solid ${colors.badgeInfoBorder}` : '1px solid transparent',
            }}
          >
            {step.label}
          </button>
          {index < STEPS.length - 1 && (
            <div 
              className="w-8 h-0.5"
              style={{ background: colors.border }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

