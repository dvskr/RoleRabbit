'use client';

import React from 'react';

interface RabbitLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

/**
 * RoleRabbit Logo Component - Detailed Portrait Style with Green
 * Exact recreation of the HTML portrait logo
 */
export function RabbitLogo({ 
  size = 120, 
  animated = true,
  className = ''
}: RabbitLogoProps) {
  const viewBoxSize = 300;
  const scale = size / viewBoxSize;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main gradient for head - EMERALD GREEN */}
          <radialGradient id="rabbit-headGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="50%" stopColor="#059669" stopOpacity="1" />
            <stop offset="100%" stopColor="#047857" stopOpacity="1" />
          </radialGradient>
          
          {/* Ear gradient - EMERALD GREEN */}
          <linearGradient id="rabbit-earGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity="1" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#059669" stopOpacity="1" />
          </linearGradient>
          
          {/* Shine effect */}
          <linearGradient id="rabbit-shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          
          {/* Shadow filter */}
          <filter id="rabbit-softShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.15"/>
          </filter>
          
          {/* Shiny white gradient for body */}
          <radialGradient id="rabbit-goldGradient" cx="50%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="50%" stopColor="#F5F5F5" stopOpacity="1" />
            <stop offset="100%" stopColor="#E5E5E5" stopOpacity="1" />
          </radialGradient>
        </defs>
        
        {/* Main group */}
        <g className={animated ? 'rabbit-breathe' : ''}>
          {/* Neck/shoulders - shiny white */}
          <ellipse cx="150" cy="220" rx="60" ry="35" fill="url(#rabbit-goldGradient)" />
          
          {/* Main head shape */}
          <ellipse cx="150" cy="160" rx="75" ry="70" fill="url(#rabbit-headGradient)" filter="url(#rabbit-softShadow)" />
          
          {/* Shine overlay on head */}
          <ellipse cx="130" cy="140" rx="45" ry="40" fill="url(#rabbit-shine)" opacity="0.7" />
          
          {/* Cheek patches left - orange */}
          <circle cx="100" cy="165" r="28" fill="#fb923c" />
          
          {/* Cheek patches right - orange */}
          <circle cx="200" cy="165" r="28" fill="#fb923c" />
          
          {/* Left Ear */}
          <g className={animated ? 'rabbit-ear-left' : ''}>
            <ellipse cx="115" cy="85" rx="18" ry="50" fill="url(#rabbit-earGradient)" transform="rotate(-10 115 85)" />
            <ellipse cx="115" cy="85" rx="10" ry="40" fill="#9b8aa0" transform="rotate(-10 115 85)" />
          </g>
          
          {/* Right Ear */}
          <g className={animated ? 'rabbit-ear-right' : ''}>
            <ellipse cx="185" cy="85" rx="18" ry="50" fill="url(#rabbit-earGradient)" transform="rotate(10 185 85)" />
            <ellipse cx="185" cy="85" rx="10" ry="40" fill="#9b8aa0" transform="rotate(10 185 85)" />
          </g>
          
          {/* Left Eye */}
          <g className={animated ? 'rabbit-eye-left' : ''}>
            {/* Eye white */}
            <ellipse cx="125" cy="155" rx="16" ry="20" fill="#f8fafc" />
            {/* Iris */}
            <circle cx="125" cy="156" r="13" fill="#1e293b" />
            {/* Pupil */}
            <circle cx="125" cy="156" r="7" fill="#020617" />
            {/* Eye highlight large */}
            <ellipse cx="128" cy="152" rx="5" ry="6" fill="white" opacity="0.9" />
            {/* Eye highlight small */}
            <circle cx="123" cy="158" r="2" fill="white" opacity="0.6" />
          </g>
          
          {/* Right Eye */}
          <g className={animated ? 'rabbit-eye-right' : ''}>
            {/* Eye white */}
            <ellipse cx="175" cy="155" rx="16" ry="20" fill="#f8fafc" />
            {/* Iris */}
            <circle cx="175" cy="156" r="13" fill="#1e293b" />
            {/* Pupil */}
            <circle cx="175" cy="156" r="7" fill="#020617" />
            {/* Eye highlight large */}
            <ellipse cx="178" cy="152" rx="5" ry="6" fill="white" opacity="0.9" />
            {/* Eye highlight small */}
            <circle cx="173" cy="158" r="2" fill="white" opacity="0.6" />
          </g>
          
          {/* Nose */}
          <g className={animated ? 'rabbit-nose' : ''}>
            <path d="M 150 175 L 145 170 L 147 167 L 150 169 L 153 167 L 155 170 Z" 
                  fill="#ec4899" opacity="0.8" />
            <ellipse cx="150" cy="170" rx="2" ry="1" fill="white" opacity="0.5" />
          </g>
          
          {/* Mouth - Rabbit Y-shaped mouth */}
          <g className={animated ? 'rabbit-mouth' : ''}>
            {/* Center vertical line */}
            <line x1="150" y1="175" x2="150" y2="182" stroke="#047857" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            {/* Left curve */}
            <path d="M 150 182 Q 142 184 138 182" stroke="#047857" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round" />
            {/* Right curve */}
            <path d="M 150 182 Q 158 184 162 182" stroke="#047857" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round" />
          </g>
          
          {/* Left Whiskers - peach/orange */}
          <line x1="85" y1="160" x2="50" y2="155" stroke="#f5a97f" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="85" y1="170" x2="50" y2="170" stroke="#f5a97f" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="85" y1="180" x2="50" y2="185" stroke="#f5a97f" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Right Whiskers - peach/orange */}
          <line x1="215" y1="160" x2="250" y2="155" stroke="#f5a97f" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="215" y1="170" x2="250" y2="170" stroke="#f5a97f" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="215" y1="180" x2="250" y2="185" stroke="#f5a97f" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Rabbit Logo with Text - "RoleRabbit"
 */
interface RabbitLogoWithTextProps extends RabbitLogoProps {
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function RabbitLogoWithText({ 
  size = 80,
  animated = true,
  showText = true,
  textSize = 'lg',
  className = ''
}: RabbitLogoWithTextProps) {
  const textSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const taglineSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex items-center gap-1 -ml-2 ${className}`}>
      <RabbitLogo 
        size={size} 
        animated={animated}
      />
      {showText && (
        <div className="-ml-2">
          <h1 className={`font-semibold ${textSizeClasses[textSize]} leading-tight`}>
            <span className="text-gray-800 dark:text-white">Role</span>
            <span className="text-emerald-500">Rabbit</span>
          </h1>
          <p className={`text-gray-500 dark:text-gray-400 ${taglineSizes[textSize]} -mt-1`}>
            Your Career Companion
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Loading state rabbit (with breathe animation)
 */
export function RabbitLoading({ size = 80, className = '' }: Omit<RabbitLogoProps, 'animated'>) {
  return (
    <div className={`rabbit-loading ${className}`}>
      <RabbitLogo size={size} animated={true} />
    </div>
  );
}

/**
 * Success state rabbit (with checkmark)
 */
export function RabbitSuccess({ size = 80, className = '' }: Omit<RabbitLogoProps, 'animated'>) {
  return (
    <div className={`relative ${className}`}>
      <RabbitLogo size={size} animated={true} />
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 9 L8 13 L14 4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Error state rabbit (with X mark)
 */
export function RabbitError({ size = 80, className = '' }: Omit<RabbitLogoProps, 'animated'>) {
  return (
    <div className={`relative ${className}`}>
      <RabbitLogo size={size} animated={true} />
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M5 5 L13 13 M13 5 L5 13" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}