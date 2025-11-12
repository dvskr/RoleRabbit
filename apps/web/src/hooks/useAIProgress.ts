import { useState, useCallback, useEffect, useRef } from 'react';
import type { AIOperationType } from '../components/common/AIOperationProgress';

export interface AIProgressState {
  isActive: boolean;
  stage: string;
  progress: number; // 0-100
  elapsedTime: number; // seconds
  estimatedTime?: number; // seconds
  message?: string;
}

export interface UseAIProgressReturn {
  progress: AIProgressState;
  startProgress: (operation: AIOperationType, estimatedTime?: number) => void;
  updateProgress: (stage: string, progress: number, message?: string) => void;
  completeProgress: () => void;
  resetProgress: () => void;
}

const INITIAL_STATE: AIProgressState = {
  isActive: false,
  stage: '',
  progress: 0,
  elapsedTime: 0
};

const DEFAULT_ESTIMATED_TIMES: Record<AIOperationType, number> = {
  ats: 45, // seconds
  tailor: 30,
  parse: 15,
  generate: 20
};

export function useAIProgress(): UseAIProgressReturn {
  const [progress, setProgress] = useState<AIProgressState>(INITIAL_STATE);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startProgress = useCallback((operation: AIOperationType, estimatedTime?: number) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    startTimeRef.current = Date.now();

    setProgress({
      isActive: true,
      stage: 'Starting',
      progress: 0,
      elapsedTime: 0,
      estimatedTime: estimatedTime ?? DEFAULT_ESTIMATED_TIMES[operation]
    });

    // Start elapsed time counter
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setProgress(prev => ({
        ...prev,
        elapsedTime: elapsed
      }));
    }, 1000);
  }, []);

  const updateProgress = useCallback((stage: string, progressValue: number, message?: string) => {
    setProgress(prev => ({
      ...prev,
      stage,
      progress: Math.min(100, Math.max(0, progressValue)),
      message
    }));
  }, []);

  const completeProgress = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setProgress(prev => ({
      ...prev,
      isActive: false,
      progress: 100
    }));
  }, []);

  const resetProgress = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setProgress(INITIAL_STATE);
  }, []);

  return {
    progress,
    startProgress,
    updateProgress,
    completeProgress,
    resetProgress
  };
}

