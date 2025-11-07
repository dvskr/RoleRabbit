'use client';

import React, { useId, useMemo, useState, useEffect, useRef } from 'react';
import { FormFieldProps } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertCircle } from 'lucide-react';

export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder,
  rows = 1,
  maxLength,
  showCounter = false,
  autoResize = false,
  allowBullets = false,
  className = '',
  id,
  name
}: FormFieldProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const reactId = useId(); // React 18+ hook for unique IDs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (autoResize && textareaRef.current && type === 'textarea') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autoResize, type]);

  // Character count and validation
  const charCount = typeof value === 'string' ? value.length : 0;
  const isNearLimit = maxLength && charCount > maxLength * 0.9;
  const isOverLimit = maxLength && charCount > maxLength;

  const { fieldId, fieldName } = useMemo(() => {
    if (id) {
      return {
        fieldId: id,
        fieldName: name || id
      };
    }

    // Extract text from label if it's a ReactNode
    let labelText = '';
    if (typeof label === 'string') {
      labelText = label.trim();
    } else if (React.isValidElement(label)) {
      // Try to extract text from React element (for icons with text)
      const children = label.props?.children;
      if (Array.isArray(children)) {
        labelText = children.find(child => typeof child === 'string') || '';
      } else if (typeof children === 'string') {
        labelText = children;
      }
    }

    const normalizedLabel = labelText.length > 0
      ? labelText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : 'field';

    const generatedId = `field-${normalizedLabel}-${reactId.replace(/[:]/g, '-')}`;

    return {
      fieldId: generatedId,
      fieldName: name || generatedId
    };
  }, [id, name, label, reactId]);

  // Normalize bullet points when pasting (convert various bullet styles to •)
  const normalizeBullets = (text: string): string => {
    if (!allowBullets) return text;
    
    // Split by lines and normalize bullet characters
    return text
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        // If line starts with a bullet character, normalize to •
        if (trimmed.match(/^[•\-\*●▪▫]\s*/)) {
          // Already has bullet, normalize to •
          return '• ' + trimmed.replace(/^[•\-\*●▪▫]\s*/, '').trim();
        } else if (trimmed.match(/^\d+[\.\)]\s*/)) {
          // Numbered list, convert to bullet
          return '• ' + trimmed.replace(/^\d+[\.\)]\s*/, '').trim();
        } else if (trimmed.length > 0) {
          // Line has content but no bullet, keep as-is (user can add manually)
          return trimmed;
        }
        return ''; // Empty line
      })
      .filter(line => line.length > 0)
      .join('\n');
  };

  const handleChange = (newValue: string) => {
    if (!disabled) {
      // Enforce maxLength
      if (maxLength && newValue.length > maxLength) {
        return; // Don't update if over limit
      }
      // Don't normalize on manual typing - preserve user input
      onChange(newValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!disabled && allowBullets) {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      
      // Normalize pasted bullet points (convert -, *, etc. to •)
      const normalized = normalizeBullets(pastedText);
      
      // Insert at cursor position
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = value || '';
      const newValue = currentValue.substring(0, start) + normalized + currentValue.substring(end);
      
      // Enforce maxLength
      if (maxLength && newValue.length > maxLength) {
        return; // Don't paste if it would exceed limit
      }
      
      onChange(newValue);
      
      // Set cursor position after pasted content
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + normalized.length;
      }, 0);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label 
          htmlFor={fieldId}
          className="block text-sm font-semibold"
          style={{ color: colors.primaryText }}
        >
          {label}
        </label>
        {showCounter && maxLength && (
          <span 
            className={`text-xs ${isOverLimit ? 'font-semibold' : ''}`}
            style={{ 
              color: isOverLimit 
                ? colors.errorRed 
                : isNearLimit 
                  ? colors.badgeWarningText 
                  : colors.secondaryText 
            }}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      {type === 'textarea' ? (
        <>
          <textarea
            ref={textareaRef}
            id={fieldId}
            name={fieldName}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onPaste={handlePaste}
            disabled={disabled}
            rows={autoResize ? 1 : rows}
            maxLength={maxLength}
            className={`w-full px-4 py-3 rounded-xl transition-all duration-200 ${
              autoResize ? '' : 'resize-none'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-text'}`}
            style={{
              background: disabled ? colors.inputBackground : colors.inputBackground,
              border: `1px solid ${isOverLimit ? colors.errorRed : colors.border}`,
              color: disabled ? '#ffffff' : colors.primaryText,
              opacity: 1,
              minHeight: autoResize ? '40px' : undefined,
              maxHeight: autoResize ? '500px' : undefined,
              overflowY: autoResize ? 'auto' : undefined,
              resize: autoResize ? 'none' : undefined,
              whiteSpace: 'pre-wrap', // Preserve line breaks and spaces
            } as React.CSSProperties}
            onFocus={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = colors.accentCyan;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accentCyan}40`;
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isOverLimit ? colors.errorRed : colors.border;
              e.currentTarget.style.boxShadow = 'none';
              if (onBlur) {
                onBlur();
              }
            }}
            onInput={(e) => {
              // Auto-resize on input, but respect maxHeight
              if (autoResize && textareaRef.current) {
                const maxHeight = 500; // Match the maxHeight in style
                textareaRef.current.style.height = 'auto';
                const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
                textareaRef.current.style.height = `${newHeight}px`;
              }
            }}
            placeholder={placeholder}
          />
          {isOverLimit && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.errorRed }}>
              <AlertCircle size={12} />
              Character limit exceeded. Please shorten your text.
            </p>
          )}
        </>
      ) : (
        <>
          <input
            id={fieldId}
            name={fieldName}
            type={type}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            maxLength={maxLength}
            className={`w-full px-4 py-3 rounded-xl transition-all duration-200 ${disabled ? 'cursor-not-allowed' : 'cursor-text'}`}
            style={{
              background: colors.inputBackground,
              border: `1px solid ${isOverLimit ? colors.errorRed : colors.border}`,
              color: disabled ? '#ffffff' : colors.primaryText,
              opacity: 1,
            } as React.CSSProperties}
            onFocus={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = colors.accentCyan;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accentCyan}40`;
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isOverLimit ? colors.errorRed : colors.border;
              e.currentTarget.style.boxShadow = 'none';
              if (onBlur) {
                onBlur();
              }
            }}
            placeholder={placeholder}
          />
          {isOverLimit && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.errorRed }}>
              <AlertCircle size={12} />
              Character limit exceeded.
            </p>
          )}
        </>
      )}
    </div>
  );
}
