'use client';

import React from 'react';
import { Bell, Settings, Search, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RabbitLogo } from './ui/RabbitLogo';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user } = useAuth();
  const userInitials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="h-16 bg-[#0D1117] border-b border-[#27272A] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <RabbitLogo size={32} animated={true} />
        <div className="h-6 w-px bg-[#27272A]" />
        <span className="text-lg font-semibold text-white">RoleRabbit</span>
      </div>

      {/* Center: Title & Subtitle */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-xs text-[#A0A0A0] mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-[#1A1F26] rounded-lg transition-colors group">
          <Search size={18} className="text-[#A0A0A0] group-hover:text-white" />
        </button>
        
        <button className="relative p-2 hover:bg-[#1A1F26] rounded-lg transition-colors group">
          <Bell size={18} className="text-[#A0A0A0] group-hover:text-white" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        <button className="p-2 hover:bg-[#1A1F26] rounded-lg transition-colors group">
          <Settings size={18} className="text-[#A0A0A0] group-hover:text-white" />
        </button>
        
        <div className="h-6 w-px bg-[#27272A]" />
        
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#34B27B] to-[#3ECF8E] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#34B27B]/50 transition-all">
          <span className="text-xs font-bold text-white">{userInitials}</span>
        </div>
      </div>
    </div>
  );
}

