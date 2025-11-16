import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface StepIndicatorProps {
  steps: Step[];
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}

/**
 * StepIndicator Component
 * 
 * Visual stepper for multi-step flows
 * Shows: 1●—2○—3○ format
 * 
 * Features:
 * - Active step highlighted
 * - Completed steps show checkmark
 * - Click previous steps to go back
 * - Responsive design
 */
export function StepIndicator({ steps, onStepClick, className = '' }: StepIndicatorProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Step Circle */}
          <button
            onClick={() => {
              if (step.status === 'completed' && onStepClick) {
                onStepClick(step.number);
              }
            }}
            disabled={step.status === 'pending'}
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${
              step.status === 'completed'
                ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                : step.status === 'active'
                ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            aria-label={`Step ${step.number}: ${step.label}`}
            aria-current={step.status === 'active' ? 'step' : undefined}
          >
            {step.status === 'completed' ? (
              <Check size={20} strokeWidth={3} />
            ) : (
              step.number
            )}
          </button>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-12 mx-2 transition-colors ${
                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
              }`}
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * StepIndicatorWithLabels Component
 * 
 * Step indicator with labels below each step
 */
interface StepIndicatorWithLabelsProps extends StepIndicatorProps {
  showLabels?: boolean;
}

export function StepIndicatorWithLabels({
  steps,
  onStepClick,
  showLabels = true,
  className = ''
}: StepIndicatorWithLabelsProps) {
  return (
    <div className={className}>
      {/* Step circles and connectors */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <button
              onClick={() => {
                if (step.status === 'completed' && onStepClick) {
                  onStepClick(step.number);
                }
              }}
              disabled={step.status === 'pending'}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                step.status === 'completed'
                  ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                  : step.status === 'active'
                  ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              aria-label={`Step ${step.number}: ${step.label}`}
              aria-current={step.status === 'active' ? 'step' : undefined}
            >
              {step.status === 'completed' ? (
                <Check size={20} strokeWidth={3} />
              ) : (
                step.number
              )}
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 mx-2 transition-colors ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex items-start justify-center mt-3">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center" style={{ width: '40px' }}>
                <span
                  className={`text-xs font-medium text-center ${
                    step.status === 'active'
                      ? 'text-blue-600'
                      : step.status === 'completed'
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div style={{ width: '48px', marginLeft: '8px', marginRight: '8px' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

