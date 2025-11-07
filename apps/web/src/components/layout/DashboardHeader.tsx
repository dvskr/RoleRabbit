'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Settings, Search, User, LogOut, LogIn, ChevronDown, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogoIcon, Logo } from '../common/Logo';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ThemeToggle';

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
}

export default function DashboardHeader({ onSearch }: DashboardHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

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

  // Position dropdown menu when it opens
  useEffect(() => {
    if (showUserMenu && userMenuRef.current && menuDropdownRef.current) {
      const rect = userMenuRef.current.getBoundingClientRect();
      const menu = menuDropdownRef.current;
      menu.style.top = `${rect.bottom + 8}px`;
      menu.style.right = `${window.innerWidth - rect.right}px`;
    }
  }, [showUserMenu]);

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
    <header 
      className="px-6 py-4 border-b flex items-center gap-4 flex-shrink-0 sticky top-0 z-40"
      style={{
        background: colors.headerBackground,
        borderBottom: `1px solid ${colors.border}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Dashboard Title with Icon and Tagline */}
      <div className="flex items-center gap-3">
        <div 
          className="p-1.5 rounded transition-all"
          style={{ color: colors.primaryBlue }}
        >
          <Home size={20} />
        </div>
        <div className="flex flex-col">
          <h1 
            className="text-lg font-semibold leading-tight"
            style={{ color: colors.primaryText }}
          >
            Dashboard
          </h1>
          <p 
            className="text-xs leading-tight"
            style={{ color: colors.secondaryText }}
          >
            Overview of your job search journey
          </p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search Bar */}
      <div className="hidden md:flex items-center flex-1 relative max-w-md">
        <Search 
          size={16} 
          className="absolute left-3 top-1/2 -translate-y-1/2" 
          style={{ color: colors.tertiaryText }}
        />
        <form onSubmit={handleSearchSubmit} className="w-full">
          <input
            type="text"
            placeholder="Search resumes, jobs, applications..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-9 pr-3 py-1.5 rounded-md text-sm transition-all"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                if (onSearch) onSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.tertiaryText }}
            >
              ×
            </button>
          )}
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Quick Logout */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all text-sm font-medium"
            style={{
              background: colors.badgeErrorBg,
              color: colors.errorRed,
              border: `1px solid ${colors.errorRed}33`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            title="Log out"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        )}

        {/* Notifications */}
        <button 
          className="relative p-1.5 rounded transition-all"
          style={{ color: colors.tertiaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.secondaryText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.tertiaryText;
          }}
          title="Notifications"
        >
          <Bell size={16} />
          <span 
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: colors.errorRed }}
          />
        </button>

        {/* Settings */}
        <button 
          className="p-1.5 rounded transition-all"
          style={{ color: colors.tertiaryText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.color = colors.secondaryText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.tertiaryText;
          }}
          title="Settings"
        >
          <Settings size={16} />
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 px-2 py-1 rounded transition-all"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.borderFocused;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
              }}
            >
              <span className="text-xs font-bold" style={{ color: colors.primaryText }}>
                {userInitials}
              </span>
            </div>
            <ChevronDown size={12} />
          </button>

          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-[9998]"
                onClick={() => setShowUserMenu(false)}
                style={{
                  backgroundColor: 'transparent',
                }}
              />
              <div 
                ref={menuDropdownRef}
                className="fixed w-56 rounded-lg shadow-2xl py-1 z-[9999]"
                style={{
                  backgroundColor: colors.cardBackground || colors.background || '#1a1a1a',
                  backgroundImage: 'none',
                  border: `1px solid ${colors.border}`,
                  opacity: 1,
                  backdropFilter: 'none',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                  isolation: 'isolate',
                  willChange: 'transform',
                }}
              >
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b" style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <p className="text-sm font-semibold" style={{ color: colors.primaryText }}>
                        {user?.name}
                      </p>
                      <p className="text-xs" style={{ color: colors.secondaryText }}>
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                      style={{ color: colors.errorRed }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.badgeErrorBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                    style={{ color: colors.primaryBlue }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.badgeInfoBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <LogIn size={14} />
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

