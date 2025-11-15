/**
 * Progress Bar Component
 * Section 1.6: Multi-stage progress bar for deployment and other processes
 */

'use client';

import React from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

export interface ProgressStage {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

interface ProgressBarProps {
  stages: ProgressStage[];
  className?: string;
}

/**
 * Multi-stage progress bar
 * Shows each stage with status indicators
 * @param stages - Array of progress stages with labels and statuses
 */
export function ProgressBar({ stages, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center gap-4">
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {stage.status === 'completed' ? (
                <CheckCircle className="text-green-600" size={24} />
              ) : stage.status === 'in_progress' ? (
                <Loader2 className="text-blue-600 animate-spin" size={24} />
              ) : stage.status === 'error' ? (
                <Circle className="text-red-600" size={24} />
              ) : (
                <Circle className="text-gray-300" size={24} />
              )}
            </div>

            {/* Label */}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  stage.status === 'completed'
                    ? 'text-green-900'
                    : stage.status === 'in_progress'
                    ? 'text-blue-900'
                    : stage.status === 'error'
                    ? 'text-red-900'
                    : 'text-gray-500'
                }`}
              >
                {stage.label}
              </p>
            </div>

            {/* Connector line (except for last item) */}
            {index < stages.length - 1 && (
              <div className="absolute left-3 top-8 w-0.5 h-8 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Linear progress bar (percentage based)
 */
export function LinearProgress({
  progress = 0,
  className = '',
  showLabel = false,
  label,
}: {
  progress?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          {showLabel && (
            <span className="text-sm text-gray-600">{clampedProgress}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Deployment progress component (Section 1.6 requirement)
 * Shows stages: Validating → Building → Uploading → Provisioning SSL → Done
 */
export interface DeploymentStage {
  stage: 'validating' | 'building' | 'uploading' | 'provisioning' | 'done';
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

const DEPLOYMENT_STAGE_LABELS: Record<DeploymentStage['stage'], string> = {
  validating: 'Validating data...',
  building: 'Building site...',
  uploading: 'Uploading files...',
  provisioning: 'Provisioning SSL...',
  done: 'Done!',
};

export function DeploymentProgress({
  currentStage,
  className = '',
}: {
  currentStage: DeploymentStage['stage'];
  className?: string;
}) {
  const stageOrder: DeploymentStage['stage'][] = [
    'validating',
    'building',
    'uploading',
    'provisioning',
    'done',
  ];

  const currentIndex = stageOrder.indexOf(currentStage);

  const stages: ProgressStage[] = stageOrder.map((stage, index) => ({
    id: stage,
    label: DEPLOYMENT_STAGE_LABELS[stage],
    status:
      index < currentIndex
        ? 'completed'
        : index === currentIndex
        ? 'in_progress'
        : 'pending',
  }));

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Deploying Portfolio</h3>
      <ProgressBar stages={stages} />
    </div>
  );
}

/**
 * Hook for managing deployment progress
 */
export function useDeploymentProgress() {
  const [currentStage, setCurrentStage] = React.useState<DeploymentStage['stage']>('validating');
  const [error, setError] = React.useState<string | null>(null);

  const startDeployment = React.useCallback(async (
    onComplete?: () => void,
    onError?: (error: Error) => void
  ) => {
    try {
      setError(null);

      // Stage 1: Validating
      setCurrentStage('validating');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Stage 2: Building
      setCurrentStage('building');
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Stage 3: Uploading
      setCurrentStage('uploading');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Stage 4: Provisioning SSL
      setCurrentStage('provisioning');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Stage 5: Done
      setCurrentStage('done');

      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Deployment failed');
      if (onError) {
        onError(err);
      }
    }
  }, []);

  const reset = React.useCallback(() => {
    setCurrentStage('validating');
    setError(null);
  }, []);

  return {
    currentStage,
    error,
    startDeployment,
    reset,
    isDeploying: currentStage !== 'done',
    isDone: currentStage === 'done',
  };
}

export default ProgressBar;
