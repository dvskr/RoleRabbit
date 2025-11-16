/**
 * Wizard Breadcrumb Navigation
 * Requirements 1.12.1-1.12.3: Breadcrumb navigation, progress indicator, back navigation
 */

'use client';

import React from 'react';
import { ChevronRight, Check } from 'lucide-react';

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

interface WizardBreadcrumbProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  allowBackNavigation?: boolean;
}

/**
 * Wizard Breadcrumb Component
 * Shows current step in multi-step wizard with navigation
 */
export function WizardBreadcrumb({
  steps,
  currentStep,
  onStepClick,
  allowBackNavigation = true,
}: WizardBreadcrumbProps) {
  const handleStepClick = (index: number) => {
    // Only allow navigation to previous steps or current step
    if (allowBackNavigation && index <= currentStep && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className="w-full">
      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>
            Step {currentStep + 1} of {steps.length}
          </span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav aria-label="Progress" className="mb-6">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = allowBackNavigation && index <= currentStep;

            return (
              <li
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={`group flex flex-col items-center ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {/* Step Circle */}
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-blue-600 border-blue-600'
                        : isCurrent
                        ? 'bg-white dark:bg-gray-800 border-blue-600'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    } ${
                      isClickable && !isCurrent
                        ? 'group-hover:border-blue-500 group-hover:scale-105'
                        : ''
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="text-white" size={20} />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          isCurrent
                            ? 'text-blue-600'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <div
                      className={`text-sm font-medium ${
                        isCurrent
                          ? 'text-blue-600'
                          : isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </div>
                    {step.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                        {step.description}
                      </div>
                    )}
                  </div>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 flex items-center px-2 sm:px-4">
                    <div
                      className={`h-0.5 w-full transition-colors duration-200 ${
                        index < currentStep
                          ? 'bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                    <ChevronRight
                      className={`flex-shrink-0 ml-2 ${
                        index < currentStep
                          ? 'text-blue-600'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                      size={16}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile Simplified View */}
      <div className="sm:hidden bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {steps[currentStep].label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          {currentStep > 0 && allowBackNavigation && (
            <button
              onClick={() => handleStepClick(currentStep - 1)}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Progress Indicator
 * Alternative minimal design for tight spaces
 */
export function CompactProgressIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {currentStep + 1} / {totalSteps}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i <= currentStep
                ? 'w-8 bg-blue-600'
                : 'w-2 bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
