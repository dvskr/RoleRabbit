'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface BulletListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  maxLengthPerItem?: number;
  disabled?: boolean;
  label?: string;
}

export default function BulletListEditor({
  items,
  onChange,
  placeholder = 'Enter bullet point',
  maxItems = 50,
  maxLengthPerItem = 1000,
  disabled = false,
  label
}: BulletListEditorProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [localItems, setLocalItems] = useState<string[]>(items || []);

  // Sync with external items
  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  const handleAdd = () => {
    if (localItems.length < maxItems) {
      const newItems = [...localItems, ''];
      setLocalItems(newItems);
      onChange(newItems);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (maxLengthPerItem && value.length > maxLengthPerItem) {
      return; // Don't update if over limit
    }
    const newItems = [...localItems];
    newItems[index] = value;
    setLocalItems(newItems);
    onChange(newItems);
  };

  const handleRemove = (index: number) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems);
    onChange(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    // Press Enter to add new bullet (Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (localItems.length < maxItems) {
        const newItems = [...localItems];
        newItems.splice(index + 1, 0, '');
        setLocalItems(newItems);
        onChange(newItems);
        // Focus next input (will be handled by component re-render)
      }
    }
    // Backspace on empty line removes bullet
    if (e.key === 'Backspace' && localItems[index] === '' && localItems.length > 1) {
      e.preventDefault();
      handleRemove(index);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label 
          className="block text-sm font-semibold"
          style={{ color: colors.primaryText }}
        >
          {label}
        </label>
      )}
      
      {localItems.map((item, index) => {
        const charCount = item.length;
        const isNearLimit = maxLengthPerItem && charCount > maxLengthPerItem * 0.9;
        const isOverLimit = maxLengthPerItem && charCount > maxLengthPerItem;
        
        return (
          <div key={index} className="flex items-start gap-2">
            <div 
              className="mt-3 flex-shrink-0"
              style={{ color: colors.secondaryText }}
            >
              <GripVertical size={16} />
            </div>
            <div className="flex-1">
              <textarea
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={disabled}
                rows={1}
                placeholder={placeholder}
                maxLength={maxLengthPerItem}
                className="w-full px-3 py-2 rounded-lg resize-none transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${isOverLimit ? colors.errorRed : colors.border}`,
                  color: colors.primaryText,
                  minHeight: '40px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  resize: 'none',
                }}
                onInput={(e) => {
                  // Auto-resize, but respect maxHeight
                  const target = e.target as HTMLTextAreaElement;
                  const maxHeight = 300; // Match the maxHeight in style
                  target.style.height = 'auto';
                  const newHeight = Math.min(target.scrollHeight, maxHeight);
                  target.style.height = `${newHeight}px`;
                }}
                onFocus={(e) => {
                  if (!disabled) {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = isOverLimit ? colors.errorRed : colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {maxLengthPerItem && (
                <div className="flex items-center justify-between mt-1">
                  <span 
                    className="text-xs"
                    style={{ 
                      color: isOverLimit 
                        ? colors.errorRed 
                        : isNearLimit 
                          ? colors.badgeWarningText 
                          : colors.secondaryText 
                    }}
                  >
                    {charCount}/{maxLengthPerItem}
                  </span>
                  {!disabled && localItems.length > 1 && (
                    <button
                      onClick={() => handleRemove(index)}
                      className="text-xs underline"
                      style={{ color: colors.errorRed }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {!disabled && localItems.length < maxItems && (
        <button
          onClick={handleAdd}
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed transition-all"
          style={{
            borderColor: colors.border,
            color: colors.secondaryText,
            background: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.borderFocused;
            e.currentTarget.style.color = colors.primaryText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.color = colors.secondaryText;
          }}
        >
          <Plus size={16} />
          Add bullet point
        </button>
      )}
      
      {localItems.length === 0 && (
        <p className="text-sm italic" style={{ color: colors.secondaryText }}>
          No bullet points yet. Click "Add bullet point" to add one.
        </p>
      )}
    </div>
  );
}

