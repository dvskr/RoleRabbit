# UI Field Preparation for Resume Parsing

## Overview

Before implementing the hybrid resume parser, we need to ensure all UI fields can properly handle parsed data, including:
- Long text (descriptions, achievements)
- Bullet points and lists
- Multi-line content
- Character limits
- Data formatting

---

## Table of Contents

1. [Field Requirements Analysis](#field-requirements-analysis)
2. [Enhanced FormField Component](#enhanced-formfield-component)
3. [Data Normalization Utilities](#data-normalization-utilities)
4. [Bullet Point Handling](#bullet-point-handling)
5. [Character Limits & Validation](#character-limits--validation)
6. [Implementation Guide](#implementation-guide)

---

## Field Requirements Analysis

### Fields That Need Special Handling

#### 1. Long Text Fields (Need Textarea + Character Counter)

| Field | Expected Length | Format | Needs |
|-------|----------------|--------|-------|
| **Bio/Summary** | 50-500 chars | Plain text | Textarea, counter, truncation |
| **Work Experience Description** | 100-2000 chars | Paragraph or bullets | Textarea, bullet support |
| **Education Description** | 50-500 chars | Plain text | Textarea, counter |
| **Project Description** | 100-1000 chars | Paragraph or bullets | Textarea, bullet support |
| **Achievements** | Variable | Bullet points | Array handling, bullet UI |
| **Volunteer Description** | 100-500 chars | Plain text | Textarea |

#### 2. List/Array Fields (Need Array Handling)

| Field | Format | UI Type |
|-------|--------|---------|
| **Skills** | Array of strings | Tag input or comma-separated |
| **Achievements** | Array of strings | Bullet list editor |
| **Technologies** | Array of strings | Tag input |
| **Languages** | Array of objects | Dynamic list |
| **Certifications** | Array of objects | Dynamic list |
| **Work Experience** | Array of objects | Dynamic list with expandable items |
| **Education** | Array of objects | Dynamic list |
| **Projects** | Array of objects | Dynamic list |

#### 3. Single-Line Fields (Need Truncation)

| Field | Max Length | Needs |
|-------|------------|-------|
| **Email** | 254 chars | Truncation, validation |
| **Phone** | 20 chars | Format normalization |
| **Location** | 100 chars | Truncation |
| **Company** | 100 chars | Truncation |
| **Role/Title** | 100 chars | Truncation |
| **Institution** | 150 chars | Truncation |
| **Degree** | 100 chars | Truncation |

---

## Enhanced FormField Component

### Current Limitations

**Current FormField:**
- ✅ Supports textarea
- ✅ Basic input types
- ❌ No character counter
- ❌ No maxLength validation
- ❌ No auto-resize for textarea
- ❌ No bullet point handling
- ❌ No truncation display

### Enhanced FormField with Parsing Support

```typescript
// components/profile/components/FormField.tsx

export interface FormFieldProps {
  label: string | ReactNode;
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'bullets';
  value: string | string[]; // Support arrays for bullets
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  maxLength?: number; // NEW: Character limit
  showCounter?: boolean; // NEW: Show character counter
  autoResize?: boolean; // NEW: Auto-resize textarea
  allowBullets?: boolean; // NEW: Convert bullets to/from array
  truncate?: boolean; // NEW: Show truncated preview
  className?: string;
  id?: string;
  name?: string;
}
```

### Implementation

```typescript
'use client';

import React, { useId, useMemo, useState, useEffect, useRef } from 'react';
import { FormFieldProps } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  placeholder,
  rows = 1,
  maxLength,
  showCounter = false,
  autoResize = false,
  allowBullets = false,
  truncate = false,
  className = '',
  id,
  name
}: FormFieldProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const reactId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(!truncate);
  
  // Auto-resize textarea
  useEffect(() => {
    if (autoResize && textareaRef.current && type === 'textarea') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autoResize, type]);

  // Handle bullet points
  const handleBulletChange = (text: string) => {
    if (allowBullets) {
      // Convert text with bullets to array
      const bullets = text
        .split('\n')
        .map(line => line.replace(/^[\s•\-\*]\s*/, '').trim())
        .filter(line => line.length > 0);
      onChange(bullets);
    } else {
      onChange(text);
    }
  };

  const displayValue = useMemo(() => {
    if (allowBullets && Array.isArray(value)) {
      // Convert array to bullet point text
      return value.map(item => `• ${item}`).join('\n');
    }
    return value || '';
  }, [value, allowBullets]);

  // Character count
  const charCount = typeof displayValue === 'string' ? displayValue.length : 0;
  const isNearLimit = maxLength && charCount > maxLength * 0.9;
  const isOverLimit = maxLength && charCount > maxLength;

  // Truncated preview
  const truncatedValue = truncate && !isExpanded && typeof displayValue === 'string'
    ? displayValue.substring(0, 200) + '...'
    : displayValue;

  const { fieldId, fieldName } = useMemo(() => {
    if (id) {
      return { fieldId: id, fieldName: name || id };
    }
    // ... existing ID generation logic
  }, [id, name, label, reactId]);

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
            value={truncatedValue as string}
            onChange={(e) => {
              if (!disabled) {
                const newValue = e.target.value;
                // Enforce maxLength
                if (maxLength && newValue.length > maxLength) {
                  return; // Don't update if over limit
                }
                handleBulletChange(newValue);
              }
            }}
            disabled={disabled}
            rows={autoResize ? 1 : rows}
            maxLength={maxLength}
            className={`w-full px-4 py-3 rounded-xl transition-all duration-200 ${
              autoResize ? 'overflow-hidden' : 'resize-none'
            } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text'}`}
            style={{
              background: disabled ? colors.inputBackground : colors.inputBackground,
              border: `1px solid ${isOverLimit ? colors.errorRed : colors.border}`,
              color: colors.primaryText,
              minHeight: autoResize ? '40px' : undefined,
              maxHeight: autoResize ? '400px' : undefined,
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
            placeholder={placeholder}
          />
          {truncate && !isExpanded && typeof displayValue === 'string' && displayValue.length > 200 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm underline"
              style={{ color: colors.primaryBlue }}
            >
              Show more
            </button>
          )}
          {isOverLimit && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.errorRed }}>
              <AlertCircle size={12} />
              Character limit exceeded. Please shorten your text.
            </p>
          )}
        </>
      ) : (
        <input
          id={fieldId}
          name={fieldName}
          type={type}
          value={truncatedValue as string}
          onChange={(e) => {
            if (!disabled) {
              const newValue = e.target.value;
              if (maxLength && newValue.length > maxLength) {
                return;
              }
              onChange(newValue);
            }
          }}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full px-4 py-3 rounded-xl transition-all duration-200 ${
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-text'
          }`}
          style={{
            background: colors.inputBackground,
            border: `1px solid ${isOverLimit ? colors.errorRed : colors.border}`,
            color: colors.primaryText,
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
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
```

---

## Data Normalization Utilities

### Utility Functions for Parsed Data

```typescript
// utils/resumeDataNormalizer.ts

/**
 * Normalize parsed resume data before populating UI fields
 */
export class ResumeDataNormalizer {
  
  /**
   * Normalize text: trim, remove extra whitespace, handle line breaks
   */
  static normalizeText(text: string | null | undefined, maxLength?: number): string {
    if (!text) return '';
    
    let normalized = text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive line breaks
      .trim();
    
    if (maxLength && normalized.length > maxLength) {
      normalized = normalized.substring(0, maxLength).trim();
    }
    
    return normalized;
  }

  /**
   * Convert bullet points text to array
   * Handles: • - * bullets, numbered lists, plain lines
   */
  static textToBullets(text: string | null | undefined): string[] {
    if (!text) return [];
    
    return text
      .split('\n')
      .map(line => {
        // Remove bullet markers: • - * or numbers
        return line
          .replace(/^[\s•\-\*]\s*/, '') // Remove bullet
          .replace(/^\d+[\.\)]\s*/, '') // Remove numbered prefix
          .trim();
      })
      .filter(line => line.length > 0);
  }

  /**
   * Convert array to bullet point text
   */
  static bulletsToText(bullets: string[] | null | undefined): string {
    if (!bullets || bullets.length === 0) return '';
    return bullets.map(bullet => `• ${bullet.trim()}`).join('\n');
  }

  /**
   * Normalize work experience description
   * Handles paragraphs, bullets, and mixed content
   */
  static normalizeWorkDescription(text: string | null | undefined): string {
    if (!text) return '';
    
    // If already has bullets, keep them
    if (text.includes('•') || text.includes('-') || text.match(/^\s*[\-\*•]/m)) {
      return this.bulletsToText(this.textToBullets(text));
    }
    
    // If multiple lines, treat as bullets
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 1) {
      return this.bulletsToText(lines);
    }
    
    // Single paragraph, return as-is (max 2000 chars)
    return this.normalizeText(text, 2000);
  }

  /**
   * Normalize achievements array
   */
  static normalizeAchievements(achievements: any): string[] {
    if (!achievements) return [];
    
    if (Array.isArray(achievements)) {
      return achievements
        .map(a => typeof a === 'string' ? a : a.text || a.description || '')
        .filter(a => a.length > 0)
        .map(a => this.normalizeText(a, 200)); // Max 200 chars per achievement
    }
    
    if (typeof achievements === 'string') {
      return this.textToBullets(achievements);
    }
    
    return [];
  }

  /**
   * Normalize skills array
   */
  static normalizeSkills(skills: any): string[] {
    if (!skills) return [];
    
    if (Array.isArray(skills)) {
      return skills
        .map(s => typeof s === 'string' ? s : s.name || '')
        .filter(s => s.length > 0 && s.length < 50) // Max 50 chars per skill
        .map(s => this.normalizeText(s));
    }
    
    if (typeof skills === 'string') {
      // Handle comma-separated or newline-separated
      return skills
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 50);
    }
    
    return [];
  }

  /**
   * Normalize date string
   * Handles various formats: "2020-06-01", "Jun 2020", "06/2020", etc.
   */
  static normalizeDate(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Try to parse and format
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      // If parsing fails, try common formats
      const formats = [
        /(\d{1,2})\/(\d{4})/, // MM/YYYY
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i, // Month YYYY
      ];
      
      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          // Try to convert to YYYY-MM-DD
          // This is simplified - you'd want a proper date parser
          return dateStr; // Return as-is for now, user can edit
        }
      }
    }
    
    return dateStr; // Return as-is if can't parse
  }

  /**
   * Normalize phone number
   */
  static normalizePhone(phone: string | null | undefined): string | null {
    if (!phone) return null;
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Ensure starts with +
    if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return cleaned || null;
  }

  /**
   * Truncate text with ellipsis
   */
  static truncate(text: string | null | undefined, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Prepare parsed data for UI fields
   */
  static prepareForUI(parsedData: any): any {
    return {
      personal: {
        firstName: this.normalizeText(parsedData.personal?.firstName, 50),
        lastName: this.normalizeText(parsedData.personal?.lastName, 50),
        email: this.normalizeText(parsedData.personal?.email, 254),
        phone: this.normalizePhone(parsedData.personal?.phone),
        location: this.normalizeText(parsedData.personal?.location, 100)
      },
      bio: this.normalizeText(parsedData.personal?.summary || parsedData.bio, 500),
      workExperiences: (parsedData.workExperience || []).map((exp: any) => ({
        ...exp,
        company: this.normalizeText(exp.company, 100),
        role: this.normalizeText(exp.role, 100),
        description: this.normalizeWorkDescription(exp.description),
        startDate: this.normalizeDate(exp.startDate),
        endDate: this.normalizeDate(exp.endDate),
        achievements: this.normalizeAchievements(exp.achievements || [])
      })),
      education: (parsedData.education || []).map((edu: any) => ({
        ...edu,
        institution: this.normalizeText(edu.institution, 150),
        degree: this.normalizeText(edu.degree, 100),
        field: this.normalizeText(edu.field, 100),
        graduationDate: this.normalizeDate(edu.graduationDate)
      })),
      skills: this.normalizeSkills(parsedData.skills),
      certifications: (parsedData.certifications || []).map((cert: any) => ({
        ...cert,
        name: this.normalizeText(cert.name, 150),
        issuer: this.normalizeText(cert.issuer, 100),
        date: this.normalizeDate(cert.date)
      }))
    };
  }
}
```

---

## Bullet Point Handling

### Component: BulletListEditor

```typescript
// components/profile/components/BulletListEditor.tsx

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface BulletListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  maxLengthPerItem?: number;
  disabled?: boolean;
}

export default function BulletListEditor({
  items,
  onChange,
  placeholder = 'Enter bullet point',
  maxItems = 20,
  maxLengthPerItem = 200,
  disabled = false
}: BulletListEditorProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [localItems, setLocalItems] = useState<string[]>(items || []);

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

  return (
    <div className="space-y-2">
      {localItems.map((item, index) => (
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
              disabled={disabled}
              rows={1}
              placeholder={placeholder}
              maxLength={maxLengthPerItem}
              className="w-full px-3 py-2 rounded-lg resize-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onInput={(e) => {
                // Auto-resize
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            {maxLengthPerItem && (
              <span 
                className="text-xs mt-1"
                style={{ 
                  color: item.length > maxLengthPerItem * 0.9 
                    ? colors.badgeWarningText 
                    : colors.secondaryText 
                }}
              >
                {item.length}/{maxLengthPerItem}
              </span>
            )}
          </div>
          {!disabled && (
            <button
              onClick={() => handleRemove(index)}
              className="mt-2 flex-shrink-0 p-1 rounded hover:bg-red-100"
              style={{ color: colors.errorRed }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
      
      {!disabled && localItems.length < maxItems && (
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed"
          style={{
            borderColor: colors.border,
            color: colors.secondaryText
          }}
        >
          <Plus size={16} />
          Add bullet point
        </button>
      )}
    </div>
  );
}
```

---

## Character Limits & Validation

### Field-Specific Limits

```typescript
// constants/fieldLimits.ts

export const FIELD_LIMITS = {
  // Personal Info
  firstName: 50,
  lastName: 50,
  email: 254, // RFC 5321 standard
  phone: 20,
  location: 100,
  bio: 500,
  
  // Work Experience
  company: 100,
  role: 100,
  workDescription: 2000,
  achievement: 200,
  
  // Education
  institution: 150,
  degree: 100,
  field: 100,
  educationDescription: 500,
  
  // Skills
  skillName: 50,
  maxSkills: 50,
  
  // Projects
  projectTitle: 100,
  projectDescription: 1000,
  
  // Certifications
  certificationName: 150,
  issuer: 100,
  
  // General
  maxBulletPoints: 20,
  maxWorkExperiences: 50,
  maxEducation: 20,
  maxProjects: 50,
  maxCertifications: 30
};

export const FIELD_VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/,
    message: 'Please enter a valid phone number'
  },
  url: {
    pattern: /^https?:\/\/.+/i,
    message: 'Please enter a valid URL (starting with http:// or https://)'
  },
  date: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: 'Please enter date in YYYY-MM-DD format'
  }
};
```

### Validation Component

```typescript
// components/profile/components/FieldValidator.tsx

export function validateField(fieldName: string, value: string): ValidationResult {
  const limits = FIELD_LIMITS[fieldName as keyof typeof FIELD_LIMITS];
  const validation = FIELD_VALIDATION[fieldName as keyof typeof FIELD_VALIDATION];
  
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Check length
  if (limits && value.length > limits) {
    result.isValid = false;
    result.errors.push(`Maximum ${limits} characters allowed`);
  }
  
  // Check pattern
  if (validation && value) {
    if (!validation.pattern.test(value)) {
      result.isValid = false;
      result.errors.push(validation.message);
    }
  }
  
  // Warnings for near-limit
  if (limits && value.length > limits * 0.9) {
    result.warnings.push(`Approaching character limit (${value.length}/${limits})`);
  }
  
  return result;
}
```

---

## Implementation Guide

### Step 1: Update FormField Component

**File:** `apps/web/src/components/profile/components/FormField.tsx`

**Changes:**
1. Add `maxLength` prop
2. Add `showCounter` prop
3. Add `autoResize` prop for textarea
4. Add character counter display
5. Add validation styling

### Step 2: Add Data Normalization Utility

**File:** `apps/web/src/utils/resumeDataNormalizer.ts`

**Create new file with:**
- `ResumeDataNormalizer` class
- All normalization methods
- Bullet point conversion
- Text truncation

### Step 3: Update Profile Tab Components

**For each tab that receives parsed data:**

```typescript
// In ProfileTab.tsx or ProfessionalTab.tsx

import { ResumeDataNormalizer } from '../../../utils/resumeDataNormalizer';

// When applying parsed data
const handleApplyParsedData = (parsedData: any) => {
  // Normalize before applying
  const normalized = ResumeDataNormalizer.prepareForUI(parsedData);
  
  // Update user data
  onUserDataChange(normalized);
};
```

### Step 4: Add Character Limits

**Update FormField usage:**

```typescript
// Before
<FormField
  label="Bio"
  type="textarea"
  value={userData.bio}
  onChange={(value) => onUserDataChange({ bio: value })}
  rows={4}
/>

// After
<FormField
  label="Bio"
  type="textarea"
  value={userData.bio}
  onChange={(value) => onUserDataChange({ bio: value })}
  rows={4}
  maxLength={500}
  showCounter={true}
  autoResize={true}
/>
```

### Step 5: Handle Bullet Points

**For achievements/descriptions:**

```typescript
// Option 1: Use BulletListEditor component
<BulletListEditor
  items={workExp.achievements || []}
  onChange={(items) => updateWorkExperience(id, { achievements: items })}
  maxItems={10}
  maxLengthPerItem={200}
/>

// Option 2: Use FormField with allowBullets
<FormField
  label="Description"
  type="textarea"
  value={workExp.description}
  onChange={(value) => updateWorkExperience(id, { description: value })}
  allowBullets={true}
  rows={6}
  maxLength={2000}
  showCounter={true}
/>
```

---

## Examples: Handling Parsed Data

### Example 1: Long Description

**Parsed Data:**
```json
{
  "description": "Led a team of 5 developers\n• Implemented microservices architecture\n• Reduced system latency by 40%\n• Managed CI/CD pipeline\n• Improved code quality metrics"
}
```

**UI Handling:**
```typescript
// Normalize: Convert to bullet format
const normalized = ResumeDataNormalizer.normalizeWorkDescription(parsedData.description);
// Result: "• Led a team of 5 developers\n• Implemented microservices architecture\n..."

// Display in FormField with bullets
<FormField
  type="textarea"
  value={normalized}
  allowBullets={true}
  rows={6}
  maxLength={2000}
  showCounter={true}
/>
```

### Example 2: Skills Array

**Parsed Data:**
```json
{
  "skills": ["JavaScript", "Python", "React", "Node.js", "AWS", "Docker"]
}
```

**UI Handling:**
```typescript
// Normalize: Ensure proper format
const normalized = ResumeDataNormalizer.normalizeSkills(parsedData.skills);
// Result: ["JavaScript", "Python", "React", "Node.js", "AWS", "Docker"]

// Display as tags or comma-separated
// (Your existing skills UI should handle this)
```

### Example 3: Achievements

**Parsed Data:**
```json
{
  "achievements": [
    "Increased revenue by 50%",
    "Reduced costs by 30%",
    "Led team of 10 people"
  ]
}
```

**UI Handling:**
```typescript
// Use BulletListEditor
<BulletListEditor
  items={workExp.achievements || []}
  onChange={(items) => updateWorkExperience(id, { achievements: items })}
  placeholder="Enter achievement"
  maxItems={10}
  maxLengthPerItem={200}
/>
```

---

## Checklist: Field Preparation

### Before Implementing Parser

- [ ] **Update FormField component**
  - [ ] Add `maxLength` prop
  - [ ] Add `showCounter` prop
  - [ ] Add `autoResize` prop
  - [ ] Add character counter UI
  - [ ] Add validation styling

- [ ] **Create normalization utilities**
  - [ ] Create `ResumeDataNormalizer` class
  - [ ] Add text normalization methods
  - [ ] Add bullet point conversion
  - [ ] Add date normalization
  - [ ] Add phone normalization

- [ ] **Update field limits**
  - [ ] Define `FIELD_LIMITS` constants
  - [ ] Apply limits to all fields
  - [ ] Add validation rules

- [ ] **Create BulletListEditor component**
  - [ ] Handle array of strings
  - [ ] Add/remove items
  - [ ] Character limits per item

- [ ] **Update profile tabs**
  - [ ] Add character counters to textareas
  - [ ] Add maxLength to inputs
  - [ ] Handle bullet points properly
  - [ ] Add truncation for long text

- [ ] **Test with sample data**
  - [ ] Test long descriptions
  - [ ] Test bullet points
  - [ ] Test character limits
  - [ ] Test truncation

---

## Field-Specific Recommendations

### Bio/Summary Field

```typescript
<FormField
  label="Professional Summary"
  type="textarea"
  value={userData.bio}
  onChange={(value) => onUserDataChange({ bio: value })}
  rows={4}
  maxLength={500}
  showCounter={true}
  autoResize={true}
  placeholder="Write a compelling summary (50-500 characters)..."
/>
```

### Work Experience Description

```typescript
<FormField
  label="Description"
  type="textarea"
  value={exp.description}
  onChange={(value) => updateWorkExperience(id, { description: value })}
  rows={6}
  maxLength={2000}
  showCounter={true}
  allowBullets={true}
  autoResize={true}
  placeholder="Describe your responsibilities and achievements. Use bullet points for clarity."
/>
```

### Achievements

```typescript
<BulletListEditor
  items={exp.achievements || []}
  onChange={(items) => updateWorkExperience(id, { achievements: items })}
  placeholder="Enter achievement (e.g., 'Increased revenue by 50%')"
  maxItems={10}
  maxLengthPerItem={200}
/>
```

### Skills

```typescript
// Your existing skills UI should handle arrays
// Just ensure it normalizes parsed data
const normalizedSkills = ResumeDataNormalizer.normalizeSkills(parsedData.skills);
onUserDataChange({ skills: normalizedSkills });
```

---

## Summary

### Key Improvements Needed

1. **FormField Enhancement**
   - Character limits and counters
   - Auto-resize for textareas
   - Bullet point support

2. **Data Normalization**
   - Text cleaning and truncation
   - Bullet point conversion
   - Date/phone normalization

3. **UI Components**
   - BulletListEditor for achievements
   - Character counter display
   - Truncation with "Show more"

4. **Field Limits**
   - Define limits for all fields
   - Apply validation
   - Show warnings near limits

### Next Steps

1. ✅ Implement enhanced FormField
2. ✅ Create normalization utilities
3. ✅ Add BulletListEditor component
4. ✅ Update all profile tabs
5. ✅ Test with sample parsed data
6. ✅ Then implement hybrid parser

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-01

