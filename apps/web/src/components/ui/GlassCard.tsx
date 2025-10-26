/**
 * Glassmorphism Card Component
 * Modern glass effect with backdrop blur for stunning UI
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'compact';
  onClick?: () => void;
}

export function GlassCard({ 
  children, 
  className, 
  variant = 'default',
  onClick 
}: GlassCardProps) {
  const baseStyles = "bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl";
  
  const variantStyles = {
    default: "p-6 rounded-2xl",
    hover: "p-6 rounded-2xl hover:bg-white/90 hover:shadow-2xl transition-all duration-300 hover:scale-105",
    compact: "p-4 rounded-xl"
  };

  return (
    <div 
      className={cn(baseStyles, variantStyles[variant], className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default GlassCard;

