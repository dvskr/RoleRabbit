/**
 * Wizard Navigation with State Preservation
 * Requirements 1.12.3-1.12.4: Back navigation, Save as Draft
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void | Promise<void>;
  onPrevious?: () => void;
  onSaveDraft?: () => void | Promise<void>;
  nextLabel?: string;
  previousLabel?: string;
  isNextDisabled?: boolean;
  isLastStep?: boolean;
  showSaveDraft?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
}

/**
 * Wizard Navigation Component
 * Handles forward/backward navigation and draft saving
 */
export function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSaveDraft,
  nextLabel,
  previousLabel,
  isNextDisabled = false,
  isLastStep = false,
  showSaveDraft = true,
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
}: WizardNavigationProps) {
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSaveDraft || !hasUnsavedChanges) return;

    const interval = setInterval(async () => {
      if (hasUnsavedChanges) {
        await handleSaveDraft(true);
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, onSaveDraft, hasUnsavedChanges, autoSaveInterval]);

  // Warn on page leave if unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleNext = async () => {
    if (!onNext || isNextDisabled) return;

    setIsNextLoading(true);
    try {
      await onNext();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to proceed to next step:', error);
    } finally {
      setIsNextLoading(false);
    }
  };

  const handlePrevious = () => {
    if (!onPrevious || currentStep === 0) return;
    onPrevious();
  };

  const handleSaveDraft = async (isAutoSave = false) => {
    if (!onSaveDraft) return;

    setIsSaving(true);
    try {
      await onSaveDraft();
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save draft:', error);
      if (!isAutoSave) {
        // Show error to user only for manual saves
        alert('Failed to save draft. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Format last saved time
  const formatLastSaved = useCallback(() => {
    if (!lastSaved) return null;

    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;

    return lastSaved.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [lastSaved]);

  const isFirstStep = currentStep === 0;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Previous Button */}
        <div>
          {!isFirstStep && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              {previousLabel || 'Previous'}
            </button>
          )}
        </div>

        {/* Center: Save Draft & Last Saved */}
        {showSaveDraft && onSaveDraft && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSaveDraft(false)}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>

            {lastSaved && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                {hasUnsavedChanges ? (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    Unsaved changes
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Saved {formatLastSaved()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right: Next Button */}
        <div>
          <button
            onClick={handleNext}
            disabled={isNextDisabled || isNextLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isNextLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {isLastStep ? 'Publishing...' : 'Loading...'}
              </>
            ) : (
              <>
                {nextLabel || (isLastStep ? 'Publish' : 'Next')}
                {!isLastStep && <ChevronRight size={18} />}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            Ctrl+S
          </kbd>{' '}
          to save •{' '}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            ?
          </kbd>{' '}
          for shortcuts
        </p>
      </div>
    </div>
  );
}

/**
 * Hook to manage wizard state with localStorage persistence
 */
export function useWizardState<T>(key: string, initialState: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialState;

    try {
      const saved = localStorage.getItem(`wizard_${key}`);
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(`wizard_${key}`, JSON.stringify(state));
      setHasChanges(true);
    } catch (error) {
      console.error('Failed to save wizard state:', error);
    }
  }, [key, state]);

  const clearState = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`wizard_${key}`);
    setState(initialState);
    setHasChanges(false);
  }, [key, initialState]);

  const resetChanges = useCallback(() => {
    setHasChanges(false);
  }, []);

  return {
    state,
    setState,
    hasChanges,
    resetChanges,
    clearState,
  };
}
