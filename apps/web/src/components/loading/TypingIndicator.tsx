/**
 * Typing Indicator Component
 * Section 1.6: Animated typing indicator for chat interfaces
 */

'use client';

import React from 'react';

interface TypingIndicatorProps {
  className?: string;
  dotSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bubble';
  text?: string;
}

const dotSizeMap = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

/**
 * Animated typing indicator (three bouncing dots)
 * Used in chat interfaces to show AI is processing
 */
export function TypingIndicator({
  className = '',
  dotSize = 'md',
  variant = 'default',
}: TypingIndicatorProps) {
  if (variant === 'bubble') {
    return (
      <div className={`inline-flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3 ${className}`}>
        <div className="flex items-center gap-1">
          <div
            className={`${dotSizeMap[dotSize]} bg-gray-400 rounded-full animate-bounce`}
            style={{ animationDelay: '0ms' }}
          />
          <div
            className={`${dotSizeMap[dotSize]} bg-gray-400 rounded-full animate-bounce`}
            style={{ animationDelay: '150ms' }}
          />
          <div
            className={`${dotSizeMap[dotSize]} bg-gray-400 rounded-full animate-bounce`}
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className={`${dotSizeMap[dotSize]} bg-gray-400 rounded-full animate-bounce`}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={`${dotSizeMap[dotSize]} bg-gray-400 rounded-full animate-bounce`}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={`${dotSizeMap[dotSize]} bg-gray-400 rounded-full animate-bounce`}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
}

/**
 * Typing indicator with text label
 */
export function TypingIndicatorWithText({
  text = 'AI is typing',
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <TypingIndicator />
      <span className="text-sm text-gray-600 italic">{text}</span>
    </div>
  );
}

/**
 * Chat message with typing indicator
 * Styled like a chat message bubble
 */
export function TypingMessage({
  sender = 'AI Assistant',
  className = '',
}: {
  sender?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-semibold">AI</span>
      </div>

      {/* Message bubble */}
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-1">{sender}</p>
        <TypingIndicator variant="bubble" />
      </div>
    </div>
  );
}

/**
 * Loading text with animated dots
 * Alternative to typing indicator
 */
export function LoadingText({
  text = 'Loading',
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-sm text-gray-600">{text}</span>
      <span className="text-sm text-gray-600 animate-bounce" style={{ animationDelay: '0ms' }}>
        .
      </span>
      <span className="text-sm text-gray-600 animate-bounce" style={{ animationDelay: '150ms' }}>
        .
      </span>
      <span className="text-sm text-gray-600 animate-bounce" style={{ animationDelay: '300ms' }}>
        .
      </span>
    </div>
  );
}

export default TypingIndicator;
