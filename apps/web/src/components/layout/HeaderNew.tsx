'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Save, Sparkles, Menu, Eye, EyeOff, Undo2, Redo2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  isMobile: boolean;
  isSaving: boolean;
  showRightPanel: boolean;
  previousSidebarState: boolean;
  sidebarCollapsed: boolean;
  isPreviewMode?: boolean;
  lastSavedAt?: Date | null; // Last manual save time
  hasChanges?: boolean; // Whether there are unsaved changes
  hasDraft?: boolean; // 🎯 NEW: Whether there's a working draft
  canUndo?: boolean; // 🔧 FIX: Added missing prop
  canRedo?: boolean; // 🔧 FIX: Added missing prop
  onExport: () => void;
  onClear: () => void;
  onImport: () => void;
  onSave: () => void;
  onUndo?: () => void; // 🔧 FIX: Added missing prop
  onRedo?: () => void; // 🔧 FIX: Added missing prop
  onDiscardDraft?: () => void; // 🎯 NEW: Discard draft handler
  onToggleAIPanel?: () => void; // 🔧 FIX: Added missing prop
  onTogglePreview?: () => void;
  onShowMobileMenu: () => void;
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
  showRightPanel,
  previousSidebarState: _previousSidebarState,
  sidebarCollapsed,
  isPreviewMode,
  lastSavedAt,
  hasChanges,
  hasDraft, // 🎯 NEW
  canUndo, // 🔧 FIX
  canRedo, // 🔧 FIX
  onExport,
  onClear,
  onImport,
  onSave,
  onUndo, // 🔧 FIX
  onRedo, // 🔧 FIX
  onDiscardDraft, // 🎯 NEW
  onToggleAIPanel, // 🔧 FIX
  onTogglePreview,
  onShowMobileMenu,
  setPreviousSidebarState: _setPreviousSidebarState,
  setSidebarCollapsed: _setSidebarCollapsed,
  setShowRightPanel,
  onToggleSidebar,
  mainSidebarCollapsed,
  setMainSidebarCollapsed,
  previousMainSidebarState: _previousMainSidebarState,
  setPreviousMainSidebarState
}: HeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const isLightMode = theme.mode === 'light';
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const savingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo && onUndo) {
          onUndo();
        }
      }
      // Ctrl+Y or Cmd+Shift+Z for redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        if (canRedo && onRedo) {
          onRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  // Update save status based on isSaving and lastSavedAt
  useEffect(() => {
    console.log('💾 [HEADER] Save status update:', { isSaving, hasChanges, lastSavedAt, currentStatus: saveStatus });
    
    if (isSaving) {
      // Clear any existing timers
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
        savedTimerRef.current = null;
      }
      
      console.log('💾 [HEADER] Setting status to SAVING');
      setSaveStatus('saving');
      
      // Keep "saving" state visible for at least 800ms
      if (savingTimerRef.current) {
        clearTimeout(savingTimerRef.current);
      }
      savingTimerRef.current = setTimeout(() => {
        console.log('💾 [HEADER] Minimum saving time elapsed');
        savingTimerRef.current = null;
      }, 800);
      
    } else if (saveStatus === 'saving' && !isSaving) {
      // Wait for minimum saving time before showing "saved"
      const checkAndShowSaved = () => {
        if (savingTimerRef.current) {
          // Still within minimum time, wait a bit more
          setTimeout(checkAndShowSaved, 100);
        } else {
          console.log('💾 [HEADER] Setting status to SAVED');
          setSaveStatus('saved');
          
          // Reset to idle after 2 seconds
          savedTimerRef.current = setTimeout(() => {
            console.log('💾 [HEADER] Setting status to IDLE');
            setSaveStatus('idle');
            savedTimerRef.current = null;
          }, 2000);
        }
      };
      checkAndShowSaved();
    }
    
    return () => {
      if (savingTimerRef.current) {
        clearTimeout(savingTimerRef.current);
      }
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, [isSaving, saveStatus]);
  
  const handleToggleAIPanel = () => {
    if (onToggleAIPanel) {
      onToggleAIPanel();
    } else {
      // Fallback to old behavior if prop not provided
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
    }
  };

  const actionButtons = [
    { icon: Upload, label: 'Import', onClick: onImport, title: 'Import Resume' },
    { icon: Download, label: 'Export', onClick: onExport, title: 'Export Resume' },
  ];

  if (onTogglePreview) {
    actionButtons.push({
      icon: isPreviewMode ? EyeOff : Eye,
      label: isPreviewMode ? 'Hide Preview' : 'Preview',
      onClick: onTogglePreview,
      title: 'Toggle Preview Mode'
    });
  }

  return (
    <header 
      className="h-16 flex items-center justify-between px-6 relative z-50 border-b"
      style={{
        background: isLightMode ? '#ffffff' : '#0D1117',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button 
            onClick={onShowMobileMenu}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Toggle mobile menu"
            title="Toggle mobile menu"
          >
            <Menu size={20} />
          </button>
        )}
        
        {/* Sidebar toggle handled inside ResumeEditor to align with vertical icons */}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Auto-save Status Indicator - Always visible, shows save status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300"
          style={{
            background: saveStatus === 'saved' ? '#f0fdf4' : hasDraft ? '#eff6ff' : '#f9fafb',
            border: `1px solid ${saveStatus === 'saved' ? '#86efac' : hasDraft ? '#93c5fd' : '#e5e7eb'}`
          }}
        >
          {/* Icon - changes based on save status with animations */}
          <div className="relative flex items-center justify-center w-4 h-4">
            {saveStatus === 'saving' ? (
              // Spinning loader during save
              <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : saveStatus === 'saved' ? (
              // Green checkmark with scale-in animation
              <svg 
                className="h-4 w-4 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  animation: 'scaleIn 0.3s ease-out'
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : hasDraft ? (
              // Blue pulsing dot for draft state
              <div 
                className="w-2.5 h-2.5 bg-blue-600 rounded-full"
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              ></div>
            ) : (
              // Gray static dot for no changes
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
            )}
          </div>
          
          {/* Text - changes based on draft status */}
          <span 
            className="text-sm font-medium transition-all duration-300"
            style={{
              color: saveStatus === 'saved' ? '#15803d' : hasDraft ? '#1d4ed8' : '#6b7280'
            }}
          >
            {saveStatus === 'saving' ? 'Auto-saving draft...' : 
             saveStatus === 'saved' ? 'Draft saved' : 
             hasDraft ? 'Working on draft' : 
             'No changes'}
          </span>
        </div>
        
        {/* CSS Animations */}
        <style jsx>{`
          @keyframes scaleIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.15);
            }
          }
        `}</style>

        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canUndo ? colors.inputBackground : 'transparent',
              border: `1px solid ${colors.border}`,
              color: canUndo ? colors.primaryText : colors.tertiaryText,
            }}
            onMouseEnter={(e) => {
              if (canUndo) {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.borderColor = colors.activeBlueText;
              }
            }}
            onMouseLeave={(e) => {
              if (canUndo) {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
            title="Undo (Ctrl+Z)"
            aria-label="Undo last change"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canRedo ? colors.inputBackground : 'transparent',
              border: `1px solid ${colors.border}`,
              color: canRedo ? colors.primaryText : colors.tertiaryText,
            }}
            onMouseEnter={(e) => {
              if (canRedo) {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.borderColor = colors.activeBlueText;
              }
            }}
            onMouseLeave={(e) => {
              if (canRedo) {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
            title="Redo (Ctrl+Y)"
            aria-label="Redo last undone change"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Save to Base Resume Button - Always visible, only disabled when no draft (NOT during auto-save) */}
        <button
          onClick={onSave}
          disabled={!hasDraft}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          title={hasDraft ? "Save draft to base resume" : "No draft to save"}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Save to Base Resume</span>
        </button>

        {/* Discard Draft Button - Always visible, only disabled when no draft (NOT during auto-save) */}
        {onDiscardDraft && (
          <button
            onClick={onDiscardDraft}
            disabled={!hasDraft}
            className="group relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
            style={{
              background: hasDraft ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : '#f9fafb',
              border: `1.5px solid ${hasDraft ? '#fca5a5' : '#e5e7eb'}`,
              color: hasDraft ? '#dc2626' : '#9ca3af',
              boxShadow: hasDraft ? '0 1px 3px rgba(220, 38, 38, 0.1)' : 'none'
            }}
            title={hasDraft ? "Discard draft and revert to base resume" : "No draft to discard"}
            onMouseEnter={(e) => {
              if (hasDraft) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                e.currentTarget.style.borderColor = '#f87171';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(220, 38, 38, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (hasDraft) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
                e.currentTarget.style.borderColor = '#fca5a5';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(220, 38, 38, 0.1)';
              }
            }}
          >
            {/* Icon with subtle animation */}
            <svg 
              className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-semibold">Discard</span>
          </button>
        )}

        {/* Clear Button - Destructive action */}
        <button
          onClick={onClear}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden"
          style={{
            background: isLightMode ? 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)' : colors.inputBackground,
            border: `1.5px solid ${colors.errorRed}`,
            color: colors.errorRed,
            boxShadow: '0 1px 3px rgba(239, 68, 68, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(239, 68, 68, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isLightMode ? 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)' : colors.inputBackground;
            e.currentTarget.style.borderColor = colors.errorRed;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(239, 68, 68, 0.1)';
          }}
          title="Clear Resume"
        >
          {/* Icon with shake animation on hover */}
          <svg 
            className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            />
          </svg>
          <span className="font-semibold">Clear</span>
        </button>

        {actionButtons.filter(btn => btn.label !== 'Clear').map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            disabled={btn.disabled}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-all"
            style={{
              background: isLightMode ? '#ffffff' : colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: btn.disabled ? colors.tertiaryText : colors.secondaryText,
              opacity: btn.disabled ? 0.5 : 1,
              cursor: btn.disabled ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!btn.disabled) {
                e.currentTarget.style.color = isLightMode ? colors.primaryText : '#ffffff';
                e.currentTarget.style.borderColor = colors.successGreen;
              }
            }}
            onMouseLeave={(e) => {
              if (!btn.disabled) {
                e.currentTarget.style.color = colors.secondaryText;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
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
      </div>
    </header>
  );
}

