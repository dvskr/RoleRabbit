'use client';

import React, { useId } from 'react';

interface RabbitLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * NEW RoleRabbit Logo Component - Enhanced with better animations
 */
export function RabbitLogo({ 
  size = 48, 
  className = '', 
  primaryColor = '#0d9488',
  secondaryColor = '#14b8a6'
}: RabbitLogoProps) {
  // Use useId() hook for consistent ID generation between server and client
  const id = useId();
  const logoId = `rabbit-logo-${id.replace(/:/g, '-')}`;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 180 180" 
      className={`${className} rabbit-logo-animated`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={`headGrad-${logoId}`} cx="50%" cy="40%">
          <stop offset="0%" style={{ stopColor: secondaryColor, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: primaryColor, stopOpacity: 1 }} />
        </radialGradient>
        
        {/* Shadow filter for depth */}
        <filter id={`shadow-${logoId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Glow filter */}
        <filter id={`glow-${logoId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g transform="translate(90,100)">
        {/* Neck/shoulders hint */}
        <ellipse cx="0" cy="40" rx="35" ry="20" fill={primaryColor} opacity="0.7" style={{ filter: 'brightness(0.8)' }} />
        
        {/* Main head shape */}
        <ellipse cx="0" cy="0" rx="45" ry="40" fill={`url(#headGrad-${logoId})`} filter={`url(#shadow-${logoId})`} />
        <ellipse cx="0" cy="0" rx="45" ry="40" fill="none" stroke={secondaryColor} strokeWidth="1" opacity="0.3" />
        
        {/* Cheek fluff */}
        <ellipse cx="-30" cy="5" rx="18" ry="15" fill={secondaryColor} opacity="0.8" style={{ filter: 'brightness(1.2)' }} />
        <ellipse cx="30" cy="5" rx="18" ry="15" fill={secondaryColor} opacity="0.8" style={{ filter: 'brightness(1.2)' }} />
        
        {/* Forehead */}
        <ellipse cx="0" cy="-20" rx="35" ry="25" fill={primaryColor} opacity="0.7" style={{ filter: 'brightness(1.2)' }} />
        
        {/* Ears - detailed */}
        <path 
          d="M -15 -35 C -18 -60, -16 -75, -12 -75 C -8 -75, -6 -60, -8 -35" 
          fill={secondaryColor}
          style={{ filter: 'brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          stroke={primaryColor}
          strokeWidth="0.5"
          className="ear-twitch-left"
        />
        <path 
          d="M 15 -35 C 18 -60, 16 -75, 12 -75 C 8 -75, 6 -60, 8 -35" 
          fill={secondaryColor}
          style={{ filter: 'brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          stroke={primaryColor}
          strokeWidth="0.5"
          className="ear-twitch-right"
        />
        
        {/* Inner ear details */}
        <path 
          d="M -12 -40 C -14 -55, -13 -65, -12 -65 C -11 -65, -10 -55, -11 -40" 
          fill="#f9a8d4" 
          opacity="0.8" 
        />
        <path 
          d="M 12 -40 C 14 -55, 13 -65, 12 -65 C 11 -65, 10 -55, 11 -40" 
          fill="#f9a8d4" 
          opacity="0.8" 
        />
        
        {/* Eyes - very detailed */}
        <ellipse cx="-15" cy="-5" rx="10" ry="12" fill="#ffffff" stroke="#0f172a" strokeWidth="0.5" />
        <ellipse cx="15" cy="-5" rx="10" ry="12" fill="#ffffff" stroke="#0f172a" strokeWidth="0.5" />
        
        {/* Iris */}
        <circle cx="-15" cy="-4" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="0.5" />
        <circle cx="15" cy="-4" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="0.5" />
        
        {/* Pupils */}
        <circle 
          cx="-15" 
          cy="-4" 
          r="4" 
          fill="#000000"
          className="eye-blink"
        />
        <circle 
          cx="15" 
          cy="-4" 
          r="4" 
          fill="#000000"
          className="eye-blink"
        />
        
        {/* Eye highlights */}
        <ellipse cx="-13" cy="-6" rx="3" ry="4" fill="white" opacity="1" />
        <ellipse cx="17" cy="-6" rx="3" ry="4" fill="white" opacity="1" />
        <circle cx="-16" cy="-2" r="1.5" fill="white" opacity="0.9" />
        <circle cx="14" cy="-2" r="1.5" fill="white" opacity="0.9" />
        
        {/* Nose - detailed */}
        <path 
          d="M 0 8 L -3 5 L -2 3 L 0 4 L 2 3 L 3 5 Z" 
          fill="#ec4899" 
          stroke="#be185d"
          strokeWidth="0.5"
          opacity="0.95"
          className="nose-wiggle"
        />
        
        {/* Nose highlight */}
        <ellipse cx="0" cy="5" rx="1.5" ry="1" fill="white" opacity="0.7" />
        
        {/* Mouth/muzzle area */}
        <path d="M 0 8 Q -5 10, -8 8" stroke="#1e293b" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M 0 8 Q 5 10, 8 8" stroke="#1e293b" strokeWidth="1.5" fill="none" opacity="0.6" />
        
        {/* Detailed whiskers */}
        <path d="M -25 0 C -35 -2, -45 -3, -55 -5" stroke="#1e293b" strokeWidth="1.5" fill="none" opacity="0.75" />
        <path d="M -25 5 C -35 5, -45 5, -55 5" stroke="#1e293b" strokeWidth="1.5" fill="none" opacity="0.75" />
        <path d="M -25 10 C -35 12, -45 13, -55 15" stroke="#1e293b" strokeWidth="1.5" fill="none" opacity="0.75" />
        <path d="M 25 0 C 35 -2, 45 -3, 55 -5" stroke="#1e293b" strokeWidth="1.5" fill="none" opacity="0.75" />
        <path d="M 25 5 C 35 5, 45 5, 55 5" stroke="#1e293b" strokeWidth="1.5" fill="none" opacity="0.75" />
        <path d="M 25 10 C 35 12, 45 13, 55 15" stroke="#1e293b" strokeWidth="1.5" fill="none" opacity="0.75" />
      </g>

      <style>
        {`
          /* Override global animation disable for rabbit logo */
          .rabbit-logo-animated * {
            animation-duration: initial !important;
            animation-delay: initial !important;
            transition-duration: initial !important;
            transition-delay: initial !important;
          }
          
          @keyframes earTwitch {
            0%, 100% { transform: rotate(0deg); }
            10% { transform: rotate(-5deg); }
            20% { transform: rotate(5deg); }
            30% { transform: rotate(0deg); }
          }
          
          @keyframes noseWiggle {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-1px); }
            75% { transform: translateX(1px); }
          }
          
          @keyframes blink {
            0%, 90%, 100% { opacity: 1; }
            95% { opacity: 0; }
          }
          
          .ear-twitch-left {
            animation: earTwitch 4s ease-in-out infinite !important;
            transform-origin: bottom center;
          }
          
          .ear-twitch-right {
            animation: earTwitch 4s ease-in-out infinite !important;
            animation-delay: 0.4s !important;
            transform-origin: bottom center;
          }
          
          .nose-wiggle {
            animation: noseWiggle 2s ease-in-out infinite !important;
          }
          
          .eye-blink {
            animation: blink 5s infinite !important;
          }
        `}
      </style>
    </svg>
  );
}

/**
 * OLD RoleRabbit Logo Component - Detailed Portrait Style with Green (Preserved)
 */
export function RabbitLogoOld({ 
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
                  fill="#3b82f6" opacity="0.8" />
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
interface RabbitLogoWithTextProps extends Omit<RabbitLogoProps, 'animated'> {
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function RabbitLogoWithText({ 
  size = 80,
  showText = true,
  textSize = 'lg',
  className = '',
  primaryColor,
  secondaryColor
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
        className={className}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
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
export function RabbitLoading({ size = 80, className = '', primaryColor, secondaryColor }: Omit<RabbitLogoProps, 'animated'>) {
  return (
    <div className={`rabbit-loading ${className}`}>
      <RabbitLogo size={size} className={className} primaryColor={primaryColor} secondaryColor={secondaryColor} />
    </div>
  );
}

/**
 * Success state rabbit (with checkmark)
 */
export function RabbitSuccess({ size = 80, className = '', primaryColor, secondaryColor }: Omit<RabbitLogoProps, 'animated'>) {
  return (
    <div className={`relative ${className}`}>
      <RabbitLogo size={size} className={className} primaryColor={primaryColor} secondaryColor={secondaryColor} />
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
export function RabbitError({ size = 80, className = '', primaryColor, secondaryColor }: Omit<RabbitLogoProps, 'animated'>) {
  return (
    <div className={`relative ${className}`}>
      <RabbitLogo size={size} className={className} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M5 5 L13 13 M13 5 L5 13" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}