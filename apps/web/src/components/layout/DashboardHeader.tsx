'use client';

import React, { useState } from 'react';
import { Bell, Settings, Search, Menu, User, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogoIcon } from '../common/Logo';

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onSearch?: (query: string) => void;
}

export default function DashboardHeader({ onToggleSidebar, sidebarCollapsed, onSearch }: DashboardHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const userInitials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="h-16 bg-[#0D1117] border-b border-[#27272A] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Logo, Sidebar Toggle, Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-[#1A1F26] rounded-lg transition-colors group"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu size={20} className="text-[#A0A0A0] group-hover:text-white" />
        </button>
        
        <div className="h-6 w-px bg-[#27272A]" />
        
        {/* Dashboard Title */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-white">Dashboard</h1>
            <p className="text-xs text-[#A0A0A0] hidden sm:block">Overview of your job search journey</p>
          </div>
        </div>
        
        {/* Search Bar - Search resumes, jobs, applications, etc. */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md ml-8">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Search resumes, jobs, applications..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-[#1A1F26] border border-[#27272A] rounded-lg text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#34B27B] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  if (onSearch) onSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white"
              >
                ×
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Right: Notifications, Settings, User */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-[#1A1F26] rounded-lg transition-colors group">
          <Bell size={18} className="text-[#A0A0A0] group-hover:text-white" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        <button className="p-2 hover:bg-[#1A1F26] rounded-lg transition-colors group">
          <Settings size={18} className="text-[#A0A0A0] group-hover:text-white" />
        </button>
        
        <div className="h-6 w-px bg-[#27272A]" />
        
        {/* User Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1F26] border border-[#27272A] rounded-lg text-sm text-white hover:border-[#34B27B] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#34B27B] to-[#3ECF8E] flex items-center justify-center">
              <span className="text-xs font-bold text-white">{userInitials}</span>
            </div>
            <ChevronDown size={14} />
          </button>
          
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-[#1A1F26] border border-[#27272A] rounded-lg shadow-xl py-1 z-50">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-[#27272A]">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-[#A0A0A0]">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#34B27B] hover:bg-[#34B27B]/10 transition-colors"
                  >
                    <LogIn size={16} />
                    Login / Sign Up
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

