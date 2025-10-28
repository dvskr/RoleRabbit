'use client';

import React, { useState } from 'react';
import { Check, X, ArrowRight, ArrowLeft, Sparkles, FileText, Briefcase, Bot, Database, Users } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Welcome to RoleReady!',
      description: 'Your AI-powered job search companion',
      icon: <Sparkles size={48} className="text-purple-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-600">
            Let's get you set up in less than 2 minutes. We'll show you how to:
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-gray-700">
              <Check size={20} className="text-green-600" />
              <span>Build professional resumes with AI</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Check size={20} className="text-green-600" />
              <span>Track your job applications</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Check size={20} className="text-green-600" />
              <span>Get AI-powered insights</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <Check size={20} className="text-green-600" />
              <span>Automate your job search</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 1,
      title: 'Create Your Resume',
      description: 'AI will help you craft the perfect resume',
      icon: <FileText size={48} className="text-blue-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Start Tips:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Click "New Resume" to start fresh</li>
              <li>• Import an existing resume if you have one</li>
              <li>• Use AI suggestions to improve your content</li>
              <li>• Choose from 10+ professional templates</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              New Resume
            </button>
            <button className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              Import Existing
            </button>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Track Applications',
      description: 'Never lose track of where you applied',
      icon: <Briefcase size={48} className="text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-xs text-gray-600 mt-1">Applied</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <div className="text-xs text-gray-600 mt-1">Interviews</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-xs text-gray-600 mt-1">Offers</div>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Add jobs as you apply. Track your progress through the pipeline.
          </p>
        </div>
      )
    },
    {
      id: 3,
      title: 'Activate AI Agents',
      description: 'Let AI work for you 24/7',
      icon: <Bot size={48} className="text-purple-600" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Check size={20} className="text-purple-600 mt-1" />
            <div>
              <div className="font-semibold text-purple-900">Job Discovery Bot</div>
              <div className="text-sm text-purple-700">Finds matching jobs automatically</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded">
            <div className="text-gray-400 mt-1"><Check size={20} /></div>
            <div>
              <div className="font-semibold text-gray-600">Resume Optimizer</div>
              <div className="text-sm text-gray-500">Keeps your resume ATS-ready</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
            <div className="text-gray-400 mt-1"><Check size={20} /></div>
            <div>
              <div className="font-semibold text-gray-600">Follow-up Assistant</div>
              <div className="text-sm text-gray-500">Sends reminders and emails</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "You're All Set!",
      description: 'Start building your career with RoleReady',
      icon: <Database size={48} className="text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ Your data is automatically saved</li>
              <li>✓ AI agents will help you daily</li>
              <li>✓ Track all applications in one place</li>
              <li>✓ Get insights to improve your chances</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onComplete}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                {currentStepData.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-purple-600'
                    : index < currentStep
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-6 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              currentStep === 0
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft size={18} />
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            {currentStep < steps.length - 1 && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

