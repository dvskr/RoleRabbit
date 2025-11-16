/**
 * Onboarding Tour Component
 * Requirements #27-29: Tooltip tour, contextual help, first-time user experience
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  HelpCircle,
  Lightbulb,
  Zap,
  Target,
  PlayCircle,
} from 'lucide-react';

export interface TourStep {
  id: string;
  target: string; // CSS selector or element ID
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  showProgress?: boolean;
  allowSkip?: boolean;
}

/**
 * Onboarding Tour Component
 */
export function OnboardingTour({
  steps,
  isOpen,
  onComplete,
  onSkip,
  showProgress = true,
  allowSkip = true,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Calculate tooltip position
  useEffect(() => {
    if (!isOpen || !step) return;

    const updatePosition = () => {
      // Center placement
      if (step.placement === 'center' || !step.target) {
        setTooltipPosition({
          top: window.innerHeight / 2 - 200,
          left: window.innerWidth / 2 - 250,
        });
        return;
      }

      // Target element placement
      const target = document.querySelector(step.target);
      if (!target) {
        setTooltipPosition({
          top: window.innerHeight / 2 - 200,
          left: window.innerWidth / 2 - 250,
        });
        return;
      }

      const rect = target.getBoundingClientRect();
      const tooltipWidth = 500;
      const tooltipHeight = 300;
      const gap = 20;

      let top = 0;
      let left = 0;

      switch (step.placement) {
        case 'top':
          top = rect.top - tooltipHeight - gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - gap;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + gap;
          break;
        default:
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
      }

      // Ensure tooltip stays within viewport
      top = Math.max(gap, Math.min(top, window.innerHeight - tooltipHeight - gap));
      left = Math.max(gap, Math.min(left, window.innerWidth - tooltipWidth - gap));

      setTooltipPosition({ top, left });

      // Scroll target into view
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, currentStep, step]);

  // Highlight target element
  useEffect(() => {
    if (!isOpen || !step || !step.target) return;

    const target = document.querySelector(step.target);
    if (!target) return;

    // Add highlight
    target.classList.add('onboarding-highlight');

    return () => {
      target.classList.remove('onboarding-highlight');
    };
  }, [isOpen, currentStep, step]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleComplete = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[999] backdrop-blur-sm" />

      {/* Spotlight */}
      {step?.target && (
        <style jsx global>{`
          .onboarding-highlight {
            position: relative;
            z-index: 1000;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
            border-radius: 8px;
          }
        `}</style>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[1001] w-[500px] max-w-[90vw]"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Lightbulb className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  {showProgress && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                  )}
                </div>
              </div>
              {allowSkip && (
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Skip tour"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {step.content}
            </p>

            {/* Action Button */}
            {step.action && (
              <button
                onClick={() => {
                  step.action?.onClick();
                  handleNext();
                }}
                className="w-full mb-4 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                {step.action.label}
              </button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-blue-600 w-6'
                        : index < currentStep
                        ? 'bg-blue-400'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLastStep ? (
                  <>
                    <Check size={18} />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>

            {/* Keyboard Hints */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Use arrow keys to navigate • Press ESC to skip
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Contextual Help Tooltip
 */
interface ContextualTooltipProps {
  children: React.ReactNode;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function ContextualTooltip({
  children,
  content,
  placement = 'top',
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap ${
            placement === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
              : placement === 'bottom'
              ? 'top-full left-1/2 -translate-x-1/2 mt-2'
              : placement === 'left'
              ? 'right-full top-1/2 -translate-y-1/2 mr-2'
              : 'left-full top-1/2 -translate-y-1/2 ml-2'
          }`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 ${
              placement === 'top'
                ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
                : placement === 'bottom'
                ? 'top-[-4px] left-1/2 -translate-x-1/2'
                : placement === 'left'
                ? 'right-[-4px] top-1/2 -translate-y-1/2'
                : 'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Help Button with Tooltip
 */
interface HelpButtonProps {
  content: string;
  onClick?: () => void;
}

export function HelpButton({ content, onClick }: HelpButtonProps) {
  return (
    <ContextualTooltip content={content}>
      <button
        onClick={onClick}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-label="Help"
      >
        <HelpCircle size={16} />
      </button>
    </ContextualTooltip>
  );
}

/**
 * Welcome Modal for First-Time Users
 */
interface WelcomeModalProps {
  isOpen: boolean;
  onStartTour: () => void;
  onSkip: () => void;
  userName?: string;
}

export function WelcomeModal({
  isOpen,
  onStartTour,
  onSkip,
  userName = 'there',
}: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onSkip}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Target className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Portfolio Manager, {userName}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Let's get you started with a quick tour
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Easy Setup
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create your portfolio in minutes with our intuitive builder
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Lightbulb className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Smart Templates
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose from professional templates or customize your own
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Target className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Analytics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track views, visitors, and engagement metrics
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <PlayCircle className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  One-Click Publish
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share your portfolio instantly with a public link
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={onStartTour}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <PlayCircle size={20} />
            Start Tour
          </button>
        </div>

        <div className="mt-4 text-center">
          <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            Don't show this again
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage onboarding state
 */
export function useOnboarding(key: string) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`onboarding_${key}`) === 'true';
  });

  const markAsComplete = () => {
    setHasSeenOnboarding(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`onboarding_${key}`, 'true');
    }
  };

  const reset = () => {
    setHasSeenOnboarding(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`onboarding_${key}`);
    }
  };

  return {
    hasSeenOnboarding,
    markAsComplete,
    reset,
  };
}
