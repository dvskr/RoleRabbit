'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface DashboardTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function DashboardTour({ isOpen, onClose, onComplete }: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Mission Control',
      description: 'Your comprehensive job search command center. Let\'s take a quick tour to get you started.',
      target: 'mission-control-header',
      position: 'bottom'
    },
    {
      id: 'stats',
      title: 'Quick Stats',
      description: 'Monitor your job search progress at a glance with key metrics and KPIs.',
      target: 'quick-stats',
      position: 'bottom'
    },
    {
      id: 'activity',
      title: 'Activity Feed',
      description: 'Track all your job search activities in real-time. See applications, responses, and updates.',
      target: 'activity-feed',
      position: 'right'
    },
    {
      id: 'todos',
      title: 'Smart To-Dos',
      description: 'AI-powered daily tasks to keep your job search momentum going.',
      target: 'smart-todos',
      position: 'left'
    },
    {
      id: 'alerts',
      title: 'Intelligent Alerts',
      description: 'Proactive reminders and important notifications to never miss an opportunity.',
      target: 'intelligent-alerts',
      position: 'left'
    },
    {
      id: 'actions',
      title: 'Quick Actions',
      description: 'One-click access to common tasks like adding jobs, updating profiles, and more.',
      target: 'quick-actions',
      position: 'top'
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'You now know your way around Mission Control. Start your job search journey!',
      target: 'mission-control-header',
      position: 'bottom'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Scroll to first step target
      const firstTarget = document.querySelector(`[data-tour="${tourSteps[0].target}"]`);
      if (firstTarget) {
        firstTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Scroll to next target
      const nextTarget = document.querySelector(`[data-tour="${tourSteps[currentStep + 1].target}"]`);
      if (nextTarget) {
        nextTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll to previous target
      const prevTarget = document.querySelector(`[data-tour="${tourSteps[currentStep - 1].target}"]`);
      if (prevTarget) {
        prevTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const completeTour = () => {
    onComplete();
    onClose();
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen || !isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      
      {/* Tour Step */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">{currentStep + 1}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentStepData.title}</h3>
                  <p className="text-sm text-gray-600">Step {currentStep + 1} of {tourSteps.length}</p>
                </div>
              </div>
              <button
                onClick={skipTour}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">{currentStepData.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {isLastStep ? (
                <button
                  onClick={completeTour}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle size={16} />
                  Get Started
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
