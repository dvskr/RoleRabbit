/**
 * Template Variable Input Component
 * Provides autocomplete for template variables and data paths
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Suggestion {
  value: string;
  label: string;
  description?: string;
  type: 'variable' | 'path';
}

interface TemplateVariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: Suggestion[];
  className?: string;
}

export default function TemplateVariableInput({
  value,
  onChange,
  placeholder,
  suggestions = [],
  className = ''
}: TemplateVariableInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default suggestions for common paths
  const defaultSuggestions: Suggestion[] = [
    { value: 'jobDescription', label: 'jobDescription', description: 'Job description text', type: 'path' },
    { value: 'jobTitle', label: 'jobTitle', description: 'Job title', type: 'path' },
    { value: 'company', label: 'company', description: 'Company name', type: 'path' },
    { value: 'jobUrl', label: 'jobUrl', description: 'Job posting URL', type: 'path' },
    { value: 'baseResumeId', label: 'baseResumeId', description: 'Base resume ID', type: 'path' },
    { value: 'input.jobDescription', label: 'input.jobDescription', description: 'Job description from workflow input', type: 'path' },
    { value: 'input.company', label: 'input.company', description: 'Company from workflow input', type: 'path' },
    { value: '{{result}}', label: '{{result}}', description: 'Previous node result', type: 'variable' },
    { value: '{{output}}', label: '{{output}}', description: 'Previous node output', type: 'variable' },
  ];

  const allSuggestions = [...suggestions, ...defaultSuggestions];

  // Filter suggestions based on input
  useEffect(() => {
    if (!value || value.length === 0) {
      setFilteredSuggestions(allSuggestions);
      return;
    }

    const searchTerm = value.toLowerCase();
    const filtered = allSuggestions.filter(
      (suggestion) =>
        suggestion.value.toLowerCase().includes(searchTerm) ||
        suggestion.label.toLowerCase().includes(searchTerm) ||
        suggestion.description?.toLowerCase().includes(searchTerm)
    );

    setFilteredSuggestions(filtered);
    setSelectedIndex(0);
  }, [value]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowSuggestions(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredSuggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredSuggestions[selectedIndex]) {
          handleSelectSuggestion(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
      case 'Tab':
        if (filteredSuggestions[selectedIndex]) {
          e.preventDefault();
          handleSelectSuggestion(filteredSuggestions[selectedIndex]);
        }
        break;
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}`}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {suggestion.value}
                    </code>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      suggestion.type === 'variable'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {suggestion.type}
                    </span>
                  </div>
                  {suggestion.description && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {suggestion.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && filteredSuggestions.length === 0 && value && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
        >
          <div className="text-xs text-gray-500 text-center">
            No suggestions found for "{value}"
          </div>
        </div>
      )}
    </div>
  );
}
