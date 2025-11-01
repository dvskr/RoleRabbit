'use client';

import React, { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'text';
}

/**
 * RoleReady Rocket Logo
 * Modern, vibrant rocket logo representing "launching your career"
 * Features glassmorphism aesthetic with animated flames and twinkling stars
 */
export function Logo({ className = '', size = 32, variant = 'full' }: LogoProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isIconOnly = variant === 'icon';
  const isTextOnly = variant === 'text';

  // Convert size prop to number
  const sizeNumber = typeof size === 'string' 
    ? size === 'sm' ? 24 : size === 'md' ? 32 : 48
    : size;

  const viewBoxSize = 48;
  const scale = sizeNumber / viewBoxSize;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} suppressHydrationWarning>
      {/* Logo Icon - Rocket */}
      {!isTextOnly && mounted && (
        <div className="relative cursor-pointer group">
          {/* Outer Glow Ring */}
          <div 
            className="absolute -inset-2 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300 blur-lg group-hover:blur-xl"
            style={{
              background: 'radial-gradient(circle, rgba(96, 165, 250, 1) 0%, transparent 70%)',
            }}
          />
          
          {/* Dark Circular Container */}
          <div 
            className="relative w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              boxShadow: '0 0 20px rgba(96, 165, 250, 0.5), inset 0 0 10px rgba(96, 165, 250, 0.2)',
            }}
          >
            {/* Rocket SVG */}
            <svg
              width={sizeNumber}
              height={sizeNumber}
              viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
              style={{ filter: 'brightness(1.3)' }}
              aria-label="RoleReady rocket logo"
              suppressHydrationWarning
            >
              <defs>
                {/* Rocket Body Gradient */}
                <linearGradient id="rocket-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
                </linearGradient>

                {/* Purple Accent Gradient */}
                <linearGradient id="rocket-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="1" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
                </linearGradient>

                {/* Teal Flame Gradient */}
                <linearGradient id="rocket-gradient-3" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="1" />
                </linearGradient>

                {/* Outer Glow Gradient */}
                <radialGradient id="glow-gradient" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Outer Glow Background Circle */}
              <circle cx="24" cy="24" r="20" fill="url(#glow-gradient)" />

              {/* Rocket Body (Hexagonal) */}
              <path
                d="M24 5 L32 18 L32 32 L24 38 L16 32 L16 18 Z"
                fill="url(#rocket-gradient-1)"
              />

              {/* Nose Cone (Triangular) */}
              <path
                d="M24 2 L32 12 L24 9 L16 12 Z"
                fill="url(#rocket-gradient-2)"
              />

              {/* Window - Outer Circle */}
              <circle cx="24" cy="21" r="3.5" fill="#93c5fd" fillOpacity="0.8" />
              {/* Window - Inner Glow */}
              <circle cx="24" cy="21" r="2.2" fill="#dbeafe" />

              {/* Left Wing */}
              <path
                d="M16 24 L8 30 L10 33 L16 29 Z"
                fill="url(#rocket-gradient-2)"
              />

              {/* Right Wing */}
              <path
                d="M32 24 L40 30 L38 33 L32 29 Z"
                fill="url(#rocket-gradient-2)"
              />

              {/* Body Highlight Streak 1 */}
              <line
                x1="22"
                y1="8"
                x2="22"
                y2="32"
                stroke="#dbeafe"
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              {/* Body Highlight Streak 2 */}
              <line
                x1="26"
                y1="10"
                x2="26"
                y2="34"
                stroke="#dbeafe"
                strokeWidth="1"
                strokeLinecap="round"
              />

              {/* Animated Flames - Left */}
              <path
                d="M20 38 Q18 42 16 45 Q18 42 20 40 Z"
                fill="url(#rocket-gradient-3)"
                fillOpacity="0.8"
              >
                <animate
                  attributeName="fill-opacity"
                  values="0.6;1;0.6"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Animated Flames - Center (Brightest) */}
              <path
                d="M24 38 Q24 43 24 47 Q24 43 24 40 Z"
                fill="url(#rocket-gradient-3)"
                fillOpacity="1"
              >
                <animate
                  attributeName="fill-opacity"
                  values="0.8;1;0.8"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Animated Flames - Right */}
              <path
                d="M28 38 Q30 42 32 45 Q30 42 28 40 Z"
                fill="url(#rocket-gradient-3)"
                fillOpacity="0.8"
              >
                <animate
                  attributeName="fill-opacity"
                  values="0.6;1;0.6"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Twinkling Stars - Pink */}
              <circle cx="8" cy="10" r="1" fill="#f8b4d9">
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Twinkling Stars - Purple */}
              <circle cx="40" cy="12" r="1" fill="#c084fc">
                <animate
                  attributeName="opacity"
                  values="0.5;1;0.5"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Twinkling Stars - Sparkling Pink */}
              <circle cx="38" cy="38" r="1" fill="#ec4899">
                <animate
                  attributeName="opacity"
                  values="0.4;1;0.4"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        </div>
      )}

      {/* Text Logo (hidden if icon only) */}
      {!isIconOnly && (
        <span
          className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#60a5fa]"
          style={{ fontSize: `${sizeNumber * 0.6}px`, lineHeight: 1 }}
        >
          RoleReady
          {variant === 'full' && (
            <span className="block text-xs font-normal text-slate-400 mt-0.5" style={{ fontSize: `${sizeNumber * 0.3}px` }}>
              Your Career Hub
            </span>
          )}
        </span>
      )}
    </div>
  );
}

/**
 * Compact Logo for headers/navigation (rocket icon only)
 */
export function LogoIcon({ className = '', size = 32 }: Omit<LogoProps, 'variant'>) {
  return <Logo className={className} size={size} variant="icon" />;
}

/**
 * Text-only logo
 */
export function LogoText({ className = '', size = 32 }: Omit<LogoProps, 'variant'>) {
  return <Logo className={className} size={size} variant="text" />;
}

