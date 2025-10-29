import React from 'react';
import { cn } from '../../lib/utils';

export interface Step {
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export function Stepper({ steps, currentStep, orientation = 'horizontal', size = 'md' }: StepperProps) {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className="flex flex-col items-center mr-4">
              <div
                className={cn(
                  'rounded-full flex items-center justify-center font-semibold',
                  sizes[size],
                  index < currentStep && 'bg-green-500 text-white',
                  index === currentStep && 'bg-blue-500 text-white',
                  index > currentStep && 'bg-gray-300 text-gray-600'
                )}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 h-16 bg-gray-300 mt-2" />
              )}
            </div>
            <div className="pt-1">
              <h4 className={cn(
                'font-semibold',
                index === currentStep && 'text-blue-600'
              )}>
                {step.label}
              </h4>
              {step.description && (
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              )}
              {step.optional && (
                <span className="text-xs text-gray-500 ml-2">(Optional)</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'rounded-full flex items-center justify-center font-semibold',
                  sizes[size],
                  index < currentStep && 'bg-green-500 text-white',
                  index === currentStep && 'bg-blue-500 text-white',
                  index > currentStep && 'bg-gray-300 text-gray-600'
                )}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <h4 className={cn(
                'mt-2 text-sm font-semibold text-center',
                index === currentStep && 'text-blue-600'
              )}>
                {step.label}
              </h4>
              {step.description && (
                <p className="text-xs text-gray-500 mt-1 text-center">{step.description}</p>
              )}
              {step.optional && (
                <span className="text-xs text-gray-500 mt-1">(Optional)</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-gray-300 relative">
                {index < currentStep && (
                  <div className="absolute inset-0 bg-green-500" />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
