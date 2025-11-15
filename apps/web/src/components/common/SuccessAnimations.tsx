/**
 * Success Animations
 * Requirement 1.12.12: Success animation when portfolio is published (confetti or checkmark)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Check, PartyPopper, Sparkles, Rocket } from 'lucide-react';

interface SuccessAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'confetti' | 'checkmark' | 'rocket';
  title?: string;
  message?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

/**
 * Success Animation Modal
 * Shows celebration animation when portfolio is published
 */
export function SuccessAnimation({
  isOpen,
  onClose,
  type = 'confetti',
  title = 'Success!',
  message = 'Your portfolio has been published',
  autoClose = true,
  autoCloseDelay = 3000,
}: SuccessAnimationProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* Confetti Effect */}
      {type === 'confetti' && <ConfettiEffect />}

      {/* Success Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {type === 'confetti' ? (
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce-slow">
              <PartyPopper className="text-white" size={48} />
            </div>
          ) : type === 'rocket' ? (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-rocket">
              <Rocket className="text-white" size={48} />
            </div>
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-checkmark">
              <Check className="text-white" size={48} strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 animate-fade-in-up">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg animate-fade-in-up animation-delay-100">
            {message}
          </p>
        </div>

        {/* Sparkles */}
        <div className="absolute top-4 left-4">
          <Sparkles className="text-yellow-400 animate-spin-slow" size={24} />
        </div>
        <div className="absolute top-4 right-4">
          <Sparkles className="text-pink-400 animate-spin-slow animation-delay-500" size={20} />
        </div>
        <div className="absolute bottom-4 left-8">
          <Sparkles className="text-purple-400 animate-spin-slow animation-delay-300" size={18} />
        </div>
        <div className="absolute bottom-4 right-8">
          <Sparkles className="text-blue-400 animate-spin-slow animation-delay-700" size={22} />
        </div>

        {/* Close button (optional) */}
        {!autoClose && (
          <button
            onClick={onClose}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            Awesome!
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Confetti Effect Component
 */
function ConfettiEffect() {
  const [confetti, setConfetti] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const pieces: JSX.Element[] = [];
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];

    for (let i = 0; i < 100; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 3;
      const duration = 2 + Math.random() * 2;
      const size = 8 + Math.random() * 8;

      pieces.push(
        <div
          key={i}
          className={`absolute ${color} rounded-sm animate-confetti-fall`}
          style={{
            left: `${left}%`,
            top: '-10px',
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      );
    }

    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti}
    </div>
  );
}

/**
 * Inline Success Checkmark
 * Small animated checkmark for inline use
 */
export function InlineSuccessCheck({
  show = false,
  size = 20,
}: {
  show?: boolean;
  size?: number;
}) {
  if (!show) return null;

  return (
    <div className="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-full animate-scale-in">
      <Check className="text-white" size={size} strokeWidth={3} />
    </div>
  );
}

/**
 * Toast Notification
 * Simple success toast
 */
export function SuccessToast({
  message,
  isVisible,
  onClose,
  duration = 3000,
}: {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md">
        <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <Check size={18} strokeWidth={3} />
        </div>
        <p className="font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Progress Success Animation
 * Shows progress bar filling up then success
 */
export function ProgressSuccess({
  isActive,
  onComplete,
  steps,
}: {
  isActive: boolean;
  onComplete: () => void;
  steps: string[];
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      setIsComplete(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(onComplete, 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isActive, steps.length, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {isComplete ? (
          <div className="text-center animate-scale-in">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-checkmark">
              <Check className="text-white" size={40} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Complete!
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 transition-all ${
                  index <= currentStep ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    index < currentStep
                      ? 'bg-green-500'
                      : index === currentStep
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="text-white" size={14} strokeWidth={3} />
                  ) : (
                    <span className="text-white text-xs font-bold">
                      {index + 1}
                    </span>
                  )}
                </div>
                <span className="text-gray-700 dark:text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Animation Styles (add to global CSS)
 */
export const successAnimationStyles = `
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes checkmark {
  0% {
    transform: scale(0) rotate(45deg);
  }
  50% {
    transform: scale(1.2) rotate(45deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes rocket {
  0%, 100% {
    transform: translateY(0) rotate(-45deg);
  }
  50% {
    transform: translateY(-20px) rotate(-45deg);
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes confetti-fall {
  to {
    transform: translateY(100vh) rotate(720deg);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

.animate-checkmark {
  animation: checkmark 0.6s ease-out;
}

.animate-rocket {
  animation: rocket 1s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-confetti-fall {
  animation: confetti-fall linear forwards;
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animation-delay-500 {
  animation-delay: 0.5s;
}

.animation-delay-700 {
  animation-delay: 0.7s;
}
`;
