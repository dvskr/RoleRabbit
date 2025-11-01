'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import type { Step, ThemeColors } from '../types/aiPortfolioBuilder';
import { ProgressSteps } from './ProgressSteps';

interface HeaderProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
  colors: ThemeColors;
}

export function Header({ currentStep, onStepChange, colors }: HeaderProps) {
  return (
    <div 
      className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
      style={{
        background: colors.headerBackground,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="p-2 rounded-lg"
          style={{
            background: colors.badgePurpleBg,
            border: `1px solid ${colors.badgePurpleBorder}`,
          }}
        >
          <Zap size={20} strokeWidth={2} style={{ color: colors.badgePurpleText }} />
        </div>
        <div>
          <h1 
            className="text-lg font-semibold"
            style={{ color: colors.primaryText }}
          >
            AI Portfolio Builder
          </h1>
          <p 
            className="text-xs"
            style={{ color: colors.secondaryText }}
          >
            Create your personal website in minutes
          </p>
        </div>
      </div>

      <ProgressSteps currentStep={currentStep} onStepClick={onStepChange} colors={colors} />
    </div>
  );
}

