import { useState, useEffect, useCallback, useRef } from 'react';

interface ProgressStage {
  key: string;
  label: string;
  progress: number;
  message: string;
  minDuration: number; // Minimum time to spend in this stage (ms)
  maxDuration: number; // Maximum time to spend in this stage (ms)
}

interface ProgressState {
  stage: string;
  progress: number;
  message: string;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  isActive: boolean;
  warningMessage?: string; // Warning message for long-running operations
}

const TAILOR_STAGES: ProgressStage[] = [
  { 
    key: 'validating', 
    label: 'Validating', 
    progress: 5, 
    message: 'Checking resume and job description...',
    minDuration: 300,
    maxDuration: 800
  },
  { 
    key: 'analyzing_resume', 
    label: 'Analyzing Resume', 
    progress: 15, 
    message: 'Extracting your key skills and experience...',
    minDuration: 800,
    maxDuration: 2000
  },
  { 
    key: 'analyzing_job', 
    label: 'Analyzing Job', 
    progress: 35, 
    message: 'Understanding job requirements...',
    minDuration: 3000,
    maxDuration: 6000
  },
  { 
    key: 'calculating_gaps', 
    label: 'Calculating Gaps', 
    progress: 50, 
    message: 'Finding areas for improvement...',
    minDuration: 1000,
    maxDuration: 2500
  },
  { 
    key: 'tailoring', 
    label: 'AI Tailoring', 
    progress: 70, 
    message: 'Optimizing your resume...',
    minDuration: 5000,
    maxDuration: 10000
  },
  { 
    key: 'enhancing', 
    label: 'Enhancing', 
    progress: 85, 
    message: 'Adding missing keywords and improving phrasing...',
    minDuration: 1500,
    maxDuration: 3000
  },
  { 
    key: 'scoring', 
    label: 'Quality Check', 
    progress: 95, 
    message: 'Calculating ATS score improvement...',
    minDuration: 1000,
    maxDuration: 2500
  },
  { 
    key: 'complete', 
    label: 'Complete', 
    progress: 100, 
    message: 'Tailoring complete! 🎉',
    minDuration: 0,
    maxDuration: 0
  }
];

const ATS_STAGES: ProgressStage[] = [
  { 
    key: 'parsing', 
    label: 'Parsing', 
    progress: 10, 
    message: 'Reading resume content...',
    minDuration: 500,
    maxDuration: 1500
  },
  { 
    key: 'extracting', 
    label: 'Extracting', 
    progress: 30, 
    message: 'Identifying your skills...',
    minDuration: 2000,
    maxDuration: 4000
  },
  { 
    key: 'analyzing_job', 
    label: 'Analyzing Job', 
    progress: 50, 
    message: 'Understanding job requirements...',
    minDuration: 3000,
    maxDuration: 6000
  },
  { 
    key: 'matching', 
    label: 'Matching', 
    progress: 70, 
    message: 'Comparing your skills to job requirements...',
    minDuration: 2000,
    maxDuration: 5000
  },
  { 
    key: 'scoring', 
    label: 'Scoring', 
    progress: 90, 
    message: 'Computing ATS compatibility score...',
    minDuration: 1500,
    maxDuration: 3000
  },
  { 
    key: 'complete', 
    label: 'Complete', 
    progress: 100, 
    message: 'Analysis complete!',
    minDuration: 0,
    maxDuration: 0
  }
];

function getStagesForOperation(operation: 'tailor' | 'ats'): ProgressStage[] {
  return operation === 'tailor' ? TAILOR_STAGES : ATS_STAGES;
}

export function useSimulatedProgress(operation: 'tailor' | 'ats' = 'tailor') {
  const [progressState, setProgressState] = useState<ProgressState>({
    stage: '',
    progress: 0,
    message: '',
    elapsedTime: 0,
    estimatedTimeRemaining: 0,
    isActive: false
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentStageIndexRef = useRef<number>(0);
  const stagesRef = useRef<ProgressStage[]>([]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const calculateEstimatedTotal = useCallback(() => {
    const stages = stagesRef.current;
    let total = 0;
    for (const stage of stages) {
      total += (stage.minDuration + stage.maxDuration) / 2;
    }
    return total / 1000; // Convert to seconds
  }, []);

  const updateElapsedTime = useCallback(() => {
    if (!startTimeRef.current || !progressState.isActive) return;
    
    const elapsedMs = Date.now() - startTimeRef.current;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const estimatedTotal = calculateEstimatedTotal();
    const remaining = Math.max(0, estimatedTotal - elapsedSec);

    // Determine warning message based on elapsed time
    let warningMessage: string | undefined;
    if (elapsedSec >= 60) {
      warningMessage = "Still working... Large resumes may take up to 2 minutes.";
    } else if (elapsedSec >= 20) {
      warningMessage = "This is taking longer than expected. Please wait...";
    }

    setProgressState(prev => ({
      ...prev,
      elapsedTime: elapsedSec,
      estimatedTimeRemaining: Math.round(remaining),
      warningMessage
    }));
  }, [progressState.isActive, calculateEstimatedTotal]);

  const advanceToNextStage = useCallback(() => {
    const stages = stagesRef.current;
    const currentIndex = currentStageIndexRef.current;

    if (currentIndex >= stages.length) {
      cleanup();
      return;
    }

    const stage = stages[currentIndex];
    
    // Update progress state
    setProgressState(prev => ({
      ...prev,
      stage: stage.key,
      progress: stage.progress,
      message: stage.message,
      isActive: stage.progress < 100
    }));

    // If this is the complete stage, stop
    if (stage.progress >= 100) {
      cleanup();
      return;
    }

    // Calculate random duration within range
    const duration = stage.minDuration + 
      Math.random() * (stage.maxDuration - stage.minDuration);

    // Schedule next stage
    currentStageIndexRef.current++;
    timerRef.current = setTimeout(() => {
      advanceToNextStage();
    }, duration);
  }, [cleanup]);

  const start = useCallback(() => {
    cleanup();
    startTimeRef.current = Date.now();
    currentStageIndexRef.current = 0;
    stagesRef.current = getStagesForOperation(operation);
    
    setProgressState({
      stage: '',
      progress: 0,
      message: 'Starting...',
      elapsedTime: 0,
      estimatedTimeRemaining: Math.round(calculateEstimatedTotal()),
      isActive: true,
      warningMessage: undefined
    });

    advanceToNextStage();
  }, [operation, cleanup, advanceToNextStage, calculateEstimatedTotal]);

  const complete = useCallback(() => {
    cleanup();
    const stages = stagesRef.current;
    const completeStage = stages[stages.length - 1];
    
    setProgressState(prev => ({
      ...prev,
      stage: completeStage.key,
      progress: 100,
      message: completeStage.message,
      estimatedTimeRemaining: 0,
      isActive: false
    }));
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setProgressState({
      stage: '',
      progress: 0,
      message: '',
      elapsedTime: 0,
      estimatedTimeRemaining: 0,
      isActive: false,
      warningMessage: undefined
    });
  }, [cleanup]);

  // Update elapsed time every second
  useEffect(() => {
    if (!progressState.isActive) return;

    const interval = setInterval(() => {
      updateElapsedTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [progressState.isActive, updateElapsedTime]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    progressState,
    start,
    complete,
    reset
  };
}

