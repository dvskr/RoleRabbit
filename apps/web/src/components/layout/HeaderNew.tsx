'use client';

import React, { useState } from 'react';
import { Download, Undo, Redo, Upload, Save, Sparkles, Menu, Copy, Share2, Eye, EyeOff, X, PanelLeftClose, PanelLeftOpen, User, LogOut, LogIn, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  isMobile: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showRightPanel: boolean;
  previousSidebarState: boolean;
  sidebarCollapsed: boolean;
  isPreviewMode?: boolean;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onImport: () => void;
  onSave: () => void;
  onToggleAIPanel: () => void;
  onTogglePreview?: () => void;
  onShowMobileMenu: () => void;
  onShowResumeSharing?: () => void;
  setPreviousSidebarState: (state: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setShowRightPanel: (show: boolean) => void;
  onToggleSidebar?: () => void;
  mainSidebarCollapsed?: boolean;
  setMainSidebarCollapsed?: (collapsed: boolean) => void;
  previousMainSidebarState?: boolean;
  setPreviousMainSidebarState?: (state: boolean) => void;
}

export default function HeaderNew({
  isMobile,
  isSaving,
  canUndo,
  canRedo,
  showRightPanel,
  previousSidebarState,
  sidebarCollapsed,
  isPreviewMode,
  onExport,
  onUndo,
  onRedo,
  onImport,
  onSave,
  onToggleAIPanel,
  onTogglePreview,
  onShowMobileMenu,
  onShowResumeSharing,
  setPreviousSidebarState,
  setSidebarCollapsed,
  setShowRightPanel,
  onToggleSidebar,
  mainSidebarCollapsed,
  setMainSidebarCollapsed,
  previousMainSidebarState,
  setPreviousMainSidebarState
}: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleToggleAIPanel = () => {
    if (!showRightPanel) {
      if (setPreviousMainSidebarState && mainSidebarCollapsed !== undefined) {
        setPreviousMainSidebarState(mainSidebarCollapsed);
        setMainSidebarCollapsed?.(true);
      }
    } else {
      if (setMainSidebarCollapsed) {
        setMainSidebarCollapsed(false);
      }
    }
    setShowRightPanel(!showRightPanel);
  };

  const actionButtons = [
    { icon: Undo, label: 'Undo', onClick: onUndo, disabled: !canUndo, title: 'Undo (Ctrl+Z)' },
    { icon: Redo, label: 'Redo', onClick: onRedo, disabled: !canRedo, title: 'Redo (Ctrl+Y)' },
    { icon: Upload, label: 'Import', onClick: onImport, title: 'Import Resume' },
    { icon: Download, label: 'Export', onClick: onExport, title: 'Export Resume' },
  ];

  if (onShowResumeSharing) {
    actionButtons.push({ icon: Share2, label: 'Share', onClick: onShowResumeSharing, title: 'Share Resume' });
  }

  if (onTogglePreview) {
    actionButtons.push({
      icon: isPreviewMode ? EyeOff : Eye,
      label: isPreviewMode ? 'Hide Preview' : 'Preview',
      onClick: onTogglePreview,
      title: 'Toggle Preview Mode'
    });
  }

  return (
    <header className="h-16 bg-[#0D1117] border-b border-[#27272A] flex items-center justify-between px-6 relative z-50">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button 
            onClick={onShowMobileMenu}
            className="p-2 hover:bg-[#1A1F26] rounded-lg transition-colors"
          >
            <Menu size={20} className="text-[#A0A0A0]" />
          </button>
        )}
        
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-[#34B27B]">
            <div className="w-3 h-3 border-2 border-[#34B27B] border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </div>
        )}
        
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1F26] border border-[#27272A] rounded-lg text-sm text-[#A0A0A0] hover:text-white hover:border-[#34B27B] transition-all"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            <span>{sidebarCollapsed ? 'Expand' : 'Collapse'}</span>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {actionButtons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            disabled={btn.disabled}
            className={`flex items-center gap-2 px-3 py-1.5 bg-[#1A1F26] border border-[#27272A] rounded-lg text-sm text-[#A0A0A0] transition-all ${
              btn.disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:text-white hover:border-[#34B27B]'
            }`}
            title={btn.title}
          >
            <btn.icon size={16} />
            <span>{btn.label}</span>
          </button>
        ))}

        {/* AI Assistant */}
        <button 
          onClick={handleToggleAIPanel}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#34B27B] text-white rounded-lg text-sm font-semibold hover:bg-[#3ECF8E] transition-colors shadow-lg shadow-[#34B27B]/20"
          title="Open AI Assistant"
        >
          <Sparkles size={16} />
          AI Assistant
        </button>

        {/* Save */}
        <button 
          onClick={onSave}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1F26] border border-[#27272A] rounded-lg text-sm text-[#A0A0A0] hover:text-white hover:border-[#34B27B] transition-all"
          title="Save Resume"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1F26] border border-[#27272A] rounded-lg text-sm text-white hover:border-[#34B27B] transition-all"
          >
            <User size={16} />
            <span className="font-medium">{isAuthenticated ? (user?.name || 'User') : 'Guest'}</span>
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

