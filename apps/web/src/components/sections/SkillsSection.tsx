'use client';

/* eslint-disable react/forbid-dom-props */
/* eslint-disable @next/next/no-inline-styles */
/* stylelint-disable */
// Inline styles are required for dynamic theming with ThemeContext
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Eye, Sparkles, GripVertical, X, Plus } from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { useTheme } from '../../contexts/ThemeContext';
import { getPopularSkillsForRole } from '../../data/exampleContent';

interface SkillsSectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
  onOpenAIGenerateModal: (section: string) => void;
}

const SkillsSection = React.memo(function SkillsSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection,
  onOpenAIGenerateModal
}: SkillsSectionProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Memoize skills array to prevent unnecessary re-renders
  const skills = useMemo(() => {
    return Array.isArray(resumeData.skills) ? resumeData.skills : [];
  }, [resumeData.skills]);

  // Autocomplete state
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [duplicateError, setDuplicateError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get popular skills based on job title
  const popularSkills = useMemo(() => {
    return getPopularSkillsForRole(resumeData.title || '');
  }, [resumeData.title]);

  // Filter suggestions based on input
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    const lowerInput = inputValue.toLowerCase();
    return popularSkills
      .filter(skill => 
        skill.toLowerCase().includes(lowerInput) &&
        !skills.includes(skill) // Don't suggest already added skills
      )
      .slice(0, 8); // Limit to 8 suggestions
  }, [inputValue, popularSkills, skills]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    
    if (!trimmedSkill) {
      return;
    }
    
    // Check for case-insensitive duplicates
    const isDuplicate = skills.some(
      existingSkill => existingSkill.toLowerCase() === trimmedSkill.toLowerCase()
    );
    
    if (isDuplicate) {
      setDuplicateError('This skill is already added');
      // Clear error after 3 seconds
      setTimeout(() => setDuplicateError(''), 3000);
      return;
    }
    
    // Add skill
    setResumeData(prev => ({ 
      ...prev, 
      skills: [...(Array.isArray(prev.skills) ? prev.skills : []), trimmedSkill] 
    }));
    setInputValue('');
    setShowSuggestions(false);
    setFocusedIndex(-1);
    setDuplicateError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        addSkill(suggestions[focusedIndex]);
      } else if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <div className="mb-4 p-1 sm:p-2 lg:p-4" style={{ contentVisibility: 'auto' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="cursor-move" style={{ color: colors.tertiaryText }} />
          <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: colors.primaryText }}>
            SKILLS
          </h3>
        </div>
        <button
          onClick={() => onHideSection('skills')}
          className="p-2 rounded-xl transition-colors"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title={sectionVisibility.skills ? "Hide skills section" : "Show skills section"}
        >
          <Eye size={18} style={{ color: sectionVisibility.skills ? colors.secondaryText : colors.tertiaryText }} />
        </button>
      </div>
      
      {/* Skills Container */}
      <div 
        className="p-1 sm:p-2 lg:p-4 rounded-xl border-2 transition-all"
        style={{
          background: colors.inputBackground,
          border: `2px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.secondaryText }}>Skills</h4>
        </div>
        
        <div className="flex flex-wrap gap-2 min-w-0 w-full">
          {skills.map((skill, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border group min-w-0 max-w-full flex-shrink-0 transition-all"
              style={{
                background: colors.cardBackground,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <span className="text-xs font-medium break-words overflow-wrap-anywhere min-w-0" style={{ color: colors.primaryText }}>{skill}</span>
              <button
                onClick={() => {
                  const updatedSkills = skills.filter((_, index) => index !== idx);
                  setResumeData(prev => ({ ...prev, skills: updatedSkills }));
                }}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                style={{ color: colors.errorRed }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.errorRed;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.errorRed;
                }}
                aria-label={`Remove skill ${skill}`}
                title={`Remove skill ${skill}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          
          {/* Inline skill input with autocomplete */}
          <div className="relative flex-shrink-0">
            <div 
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 min-w-0 max-w-full"
              style={{
                background: colors.cardBackground,
                border: `2px solid ${duplicateError ? colors.errorRed : (showSuggestions && suggestions.length > 0 ? colors.activeBlueText : colors.border)}`,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(true);
                  setFocusedIndex(-1);
                  setDuplicateError(''); // Clear error when user starts typing
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={(e) => {
                  // Delay to allow clicking on suggestions
                  setTimeout(() => {
                    if (inputValue.trim() && !suggestions.includes(inputValue.trim())) {
                      addSkill(inputValue);
                    }
                  }, 200);
                }}
                placeholder="Enter skill..."
                className="text-xs font-medium bg-transparent border-none outline-none w-24 min-w-0 max-w-full break-words overflow-wrap-anywhere"
                style={{ color: colors.primaryText }}
              />
              <button
                onClick={() => {
                  if (inputValue.trim()) {
                    addSkill(inputValue);
                  }
                }}
                className="flex-shrink-0 transition-colors"
                style={{ color: colors.primaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.secondaryText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.primaryText;
                }}
                aria-label="Add skill"
                title="Add skill"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && !duplicateError && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg border z-50 max-h-48 overflow-y-auto"
                style={{
                  background: colors.cardBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => addSkill(suggestion)}
                    className="w-full text-left px-3 py-2 text-xs font-medium transition-colors"
                    style={{
                      background: index === focusedIndex ? colors.hoverBackground : 'transparent',
                      color: colors.primaryText,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.hoverBackground;
                    }}
                    onMouseLeave={(e) => {
                      if (index !== focusedIndex) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {/* Duplicate Error Message */}
            {duplicateError && (
              <div
                className="absolute top-full left-0 mt-1 px-3 py-2 rounded-lg shadow-lg border z-50 text-xs font-medium flex items-center gap-2 animate-in slide-in-from-top duration-200"
                style={{
                  background: '#fef2f2',
                  border: `1px solid ${colors.errorRed}`,
                  color: colors.errorRed,
                }}
                role="alert"
              >
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{duplicateError}</span>
              </div>
            )}
          </div>
          
          {skills.length === 0 && (
            <span className="text-xs italic" style={{ color: colors.tertiaryText }}>No skills added yet</span>
          )}
        </div>
      </div>
      
      <div className="flex justify-end mt-3">
        <button 
          onClick={() => onOpenAIGenerateModal('skills')}
          className="text-sm flex items-center gap-2 font-semibold px-3 py-2 rounded-lg transition-colors"
          style={{
            color: colors.badgePurpleText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.badgePurpleBg;
            e.currentTarget.style.color = colors.badgePurpleText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.badgePurpleText;
          }}
        >
          <Sparkles size={16} />
          AI Generate
        </button>
      </div>
    </div>
  );
});

export default SkillsSection;
