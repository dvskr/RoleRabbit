'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Sparkles, PanelLeftOpen, PanelLeftClose, Edit2, Check, X } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';

interface FileNameSectionProps {
  resumeFileName: string;
  setResumeFileName: (name: string) => void;
  onGenerateSmartFileName: () => string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  colors: ThemeColors;
}

function FileNameSection({
  resumeFileName,
  setResumeFileName,
  onGenerateSmartFileName,
  colors,
  isSidebarCollapsed,
  onToggleSidebar
}: FileNameSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(resumeFileName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (tempName.trim()) {
      setResumeFileName(tempName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempName(resumeFileName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="mb-6 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2 text-sm" style={{ color: colors.primaryText }}>
          <FileText size={16} style={{ color: colors.primaryBlue }} />
          File Name
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setResumeFileName(onGenerateSmartFileName())}
            className="p-1.5 rounded-lg transition-all"
            style={{
              background: colors.badgePurpleBg,
              border: `1px solid ${colors.badgePurpleBorder}`,
              color: colors.badgePurpleText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.badgePurpleBorder;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.badgePurpleBg;
            }}
            title="Generate Smart Filename"
          >
            <Sparkles size={12} />
          </button>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg transition-all flex items-center justify-center"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryBlue,
              }}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 6px ${colors.primaryBlue}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Inline Editable Name */}
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter filename..."
            className="flex-1 px-3 py-2 text-sm rounded-lg transition-all"
            style={{
              background: colors.inputBackground,
              border: `2px solid ${colors.primaryBlue}`,
              color: colors.primaryText,
              outline: `2px solid ${colors.primaryBlue}40`,
            }}
          />
          <button
            onClick={handleSave}
            className="p-2 rounded-lg transition-all"
            style={{
              background: colors.successGreen,
              color: '#ffffff',
            }}
            title="Save (Enter)"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg transition-all"
            style={{
              background: colors.errorRed,
              color: '#ffffff',
            }}
            title="Cancel (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full px-3 py-2 text-sm rounded-lg transition-all text-left flex items-center justify-between group"
          style={{
            background: colors.inputBackground,
            border: `2px solid ${colors.border}`,
            color: colors.primaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.primaryBlue;
            e.currentTarget.style.background = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.background = colors.inputBackground;
          }}
          title="Click to edit filename"
        >
          <span>{resumeFileName || 'Click to set filename...'}</span>
          <Edit2
            size={14}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: colors.primaryBlue }}
          />
        </button>
      )}

      <p className="text-xs mt-1" style={{ color: colors.tertiaryText }}>
        💡 Click to edit • AI generates: Name_Title_YYYY-MM format
      </p>
    </div>
  );
}

// ✅ PERFORMANCE: Memoize to prevent unnecessary re-renders
export default React.memo(FileNameSection, (prevProps, nextProps) => {
  return (
    prevProps.resumeFileName === nextProps.resumeFileName &&
    prevProps.isSidebarCollapsed === nextProps.isSidebarCollapsed
    // colors and callbacks are assumed stable
  );
});

