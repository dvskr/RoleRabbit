'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon' | 'monochrome';
}

/**
 * Custom RoleReady Logo
 * Design: Badge with stylized "R" representing career achievement and readiness
 */
export function Logo({ className = '', size = 32, variant = 'full' }: LogoProps) {
  const isIconOnly = variant === 'icon';
  const isMonochrome = variant === 'monochrome';

  const badgeColor = isMonochrome ? 'currentColor' : '#34B27B';
  const textColor = isMonochrome ? 'currentColor' : 'white';
  const gradientId = 'logo-gradient';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-label="RoleReady logo"
      >
        {/* Definition for gradient */}
        {!isMonochrome && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#34B27B', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#3ECF8E', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        )}

        {/* Badge/Circle Background */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill={isMonochrome ? 'none' : `url(#${gradientId})`}
          stroke={badgeColor}
          strokeWidth="2"
        />

        {/* Stylized "R" for RoleReady */}
        <path
          d="M 32 14 L 32 38 L 24 38 L 24 42 L 32 42 L 36 42 L 42 36 L 36 30 L 36 38 L 32 38 M 24 20 L 32 20 L 36 24 L 32 28 L 24 28 Z"
          fill="none"
          stroke={textColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all"
        />

        {/* Accent dot representing "ready" state */}
        <circle cx="39" cy="39" r="3" fill={textColor} />
      </svg>

      {/* Text Logo (hidden if icon only) */}
      {!isIconOnly && (
        <span
          className={`font-bold text-transparent bg-clip-text ${
            isMonochrome
              ? 'text-current'
              : 'bg-gradient-to-r from-white to-[#3ECF8E]'
          }`}
          style={{ fontSize: `${size * 0.55}px` }}
        >
          Role Ready
        </span>
      )}
    </div>
  );
}

/**
 * Compact Logo for headers/navigation
 */
export function LogoIcon({ className = '', size = 32 }: LogoProps) {
  return <Logo className={className} size={size} variant="icon" />;
}

/**
 * Monochrome logo for dark backgrounds
 */
export function LogoMono({ className = '', size = 32 }: LogoProps) {
  return <Logo className={className} size={size} variant="monochrome" />;
}

