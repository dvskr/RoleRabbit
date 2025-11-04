'use client';

import React from 'react';

interface RabbitLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

/**
 * RoleRabbit Logo Component
 * Exact recreation of the glossy green rabbit logo with clean animations
 */
export function RabbitLogo({ 
  size = 40, 
  animated = true,
  className = '' 
}: RabbitLogoProps) {
  const viewBoxSize = 100;

  return (
    <div className={`inline-flex items-center justify-center ${animated ? 'rabbit-container' : ''} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Head gradient - glossy sphere effect (mint green at top, emerald at bottom) */}
          <radialGradient id="rabbit-head-gradient" cx="50%" cy="35%">
            <stop offset="0%" stopColor="#a7f3d0" stopOpacity="1" /> {/* Light mint green */}
            <stop offset="30%" stopColor="#6ee7b7" stopOpacity="1" /> {/* Medium mint */}
            <stop offset="60%" stopColor="#34d399" stopOpacity="1" /> {/* Emerald */}
            <stop offset="100%" stopColor="#10b981" stopOpacity="1" /> {/* Dark emerald */}
          </radialGradient>
          

          {/* Ear gradient - dark green */}
          <linearGradient id="rabbit-ear-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" stopOpacity="1" /> {/* Dark green */}
            <stop offset="100%" stopColor="#047857" stopOpacity="1" /> {/* Darker green */}
          </linearGradient>

          {/* Bright white glossy highlight on top-left */}
          <radialGradient id="rabbit-highlight" cx="35%" cy="25%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Pink inner ear gradient */}
          <linearGradient id="rabbit-inner-ear-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbcfe8" stopOpacity="1" /> {/* Light pink */}
            <stop offset="100%" stopColor="#f9a8d4" stopOpacity="1" /> {/* Medium pink */}
          </linearGradient>
        </defs>

        {/* Rabbit Head - glossy spherical shape */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="url(#rabbit-head-gradient)"
        />

        {/* Bright white glossy highlight on top-left surface */}
        <ellipse
          cx="38"
          cy="32"
          rx="18"
          ry="22"
          fill="url(#rabbit-highlight)"
        />

        {/* Left Ear - elongated dark green, pointing upwards */}
        <g className={animated ? 'rabbit-ear-left' : ''} style={{ transformOrigin: '32px 40px' }}>
          <ellipse
            cx="32"
            cy="18"
            rx="9"
            ry="22"
            fill="url(#rabbit-ear-gradient)"
            transform="rotate(-12 32 18)"
          />
          {/* Inner ear - pale pink */}
          <ellipse
            cx="32"
            cy="20"
            rx="5"
            ry="16"
            fill="url(#rabbit-inner-ear-gradient)"
            transform="rotate(-12 32 18)"
          />
        </g>

        {/* Right Ear - elongated dark green, pointing upwards */}
        <g className={animated ? 'rabbit-ear-right' : ''} style={{ transformOrigin: '68px 40px' }}>
          <ellipse
            cx="68"
            cy="18"
            rx="9"
            ry="22"
            fill="url(#rabbit-ear-gradient)"
            transform="rotate(12 68 18)"
          />
          {/* Inner ear - pale pink */}
          <ellipse
            cx="68"
            cy="20"
            rx="5"
            ry="16"
            fill="url(#rabbit-inner-ear-gradient)"
            transform="rotate(12 68 18)"
          />
        </g>

        {/* Left Eye - large round white with black pupil */}
        <g className={animated ? 'rabbit-eye' : ''} style={{ transformOrigin: '42px 48px' }}>
          <circle
            cx="42"
            cy="48"
            r="10"
            fill="white"
          />
          <circle
            cx="42"
            cy="48"
            r="6"
            fill="black"
          />
          {/* Eye highlight - white circle in top-right */}
          <circle
            cx="44"
            cy="46"
            r="2"
            fill="white"
          />
        </g>

        {/* Right Eye - large round white with black pupil */}
        <g className={animated ? 'rabbit-eye' : ''} style={{ transformOrigin: '58px 48px' }}>
          <circle
            cx="58"
            cy="48"
            r="10"
            fill="white"
          />
          <circle
            cx="58"
            cy="48"
            r="6"
            fill="black"
          />
          {/* Eye highlight - white circle in top-right */}
          <circle
            cx="60"
            cy="46"
            r="2"
            fill="white"
          />
        </g>

        {/* Nose - light pink inverted triangle/heart shape */}
        <g className={animated ? 'rabbit-nose' : ''}>
          <path
            d="M 50 58 L 46 62 L 50 63 L 54 62 Z"
            fill="#fbcfe8"
          />
        </g>

        {/* Left Whiskers - three thin dark purple lines */}
        <g stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.85">
          <line x1="26" y1="58" x2="36" y2="58" />
          <line x1="24" y1="62" x2="34" y2="61.5" />
          <line x1="24" y1="66" x2="34" y2="65" />
        </g>

        {/* Right Whiskers - three thin dark purple lines */}
        <g stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.85">
          <line x1="64" y1="58" x2="74" y2="58" />
          <line x1="66" y1="62" x2="76" y2="61.5" />
          <line x1="66" y1="66" x2="76" y2="65" />
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
  textSize?: 'sm' | 'md' | 'lg';
}

export function RabbitLogoWithText({ 
  size = 40,
  animated = true,
  showText = true,
  textSize = 'md',
  className = ''
}: RabbitLogoWithTextProps) {
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <RabbitLogo 
        size={size} 
        animated={animated}
      />
      {showText && (
        <h1 className={`font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent ${textSizeClasses[textSize]}`}>
          RoleRabbit
        </h1>
      )}
    </div>
  );
}

/**
 * Loading state rabbit (bouncing animation)
 */
export function RabbitLoading({ size = 40, className = '' }: Omit<RabbitLogoProps, 'animated'>) {
  return (
    <div className={`rabbit-loading ${className}`}>
      <RabbitLogo size={size} animated={true} />
    </div>
  );
}

/**
 * Success state rabbit (with checkmark)
 */
export function RabbitSuccess({ size = 40, className = '' }: Omit<RabbitLogoProps, 'animated'>) {
  return (
    <div className={`relative ${className}`}>
      <RabbitLogo size={size} animated={true} />
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6 L5 9 L10 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Error state rabbit (with X mark)
 */
export function RabbitError({ size = 40, className = '' }: Omit<RabbitLogoProps, 'animated'>) {
  return (
    <div className={`relative ${className}`}>
      <RabbitLogo size={size} animated={true} />
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 3 L9 9 M9 3 L3 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
