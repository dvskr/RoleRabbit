import React from 'react';
import { Check, Circle } from 'lucide-react';

interface Step {
  label: string;
  completed?: boolean;
  current?: boolean;
}

interface StepperProps {
  steps: Step[];
  className?: string;
}

export function Stepper({ steps, className = '' }: StepperProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : step.current
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {step.completed ? (
                <Check className="w-6 h-6" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </div>
            <span className={`ml-3 text-sm font-medium ${
              step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              steps[index].completed ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

