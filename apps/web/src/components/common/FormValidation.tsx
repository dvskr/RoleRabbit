/**
 * Form Validation Components
 * Section 1.4: Form Validation & Input Handling
 *
 * Features:
 * - Required field validation
 * - Email/URL validation
 * - Character limits with counters
 * - Subdomain validation
 * - File upload validation
 * - XSS sanitization
 * - Real-time validation feedback
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, AlertCircle, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import {
  validateEmail,
  validateURL,
  validateSubdomain,
  validateFile,
  validateCharLimit,
  sanitizeHTML,
  CHAR_LIMITS,
  FILE_LIMITS,
} from '@/types/portfolio';

// ============================================================================
// TYPES
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  error?: string;
  remaining?: number;
  percentage?: number;
}

// ============================================================================
// VALIDATED INPUT
// ============================================================================

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validationType?: 'email' | 'url' | 'subdomain' | 'text';
  required?: boolean;
  charLimit?: { min?: number; max: number };
  showCounter?: boolean;
  error?: string;
  helpText?: string;
}

/**
 * Input with real-time validation
 */
export function ValidatedInput({
  label,
  value,
  onChange,
  validationType = 'text',
  required = false,
  charLimit,
  showCounter = true,
  error: externalError,
  helpText,
  ...props
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });

  const validate = useCallback(() => {
    if (!value && required) {
      return { isValid: false, error: `${label} is required` };
    }

    if (!value) {
      return { isValid: true };
    }

    // Character limit validation
    if (charLimit) {
      const result = validateCharLimit(value, charLimit);
      if (!result.isValid) {
        return result;
      }
    }

    // Type-specific validation
    switch (validationType) {
      case 'email':
        return validateEmail(value);
      case 'url':
        return validateURL(value);
      case 'subdomain':
        return validateSubdomain(value);
      default:
        return { isValid: true };
    }
  }, [value, required, charLimit, validationType, label]);

  useEffect(() => {
    if (touched) {
      const result = validate();
      setValidation(result);
    }
  }, [value, touched, validate]);

  const handleBlur = () => {
    setTouched(true);
    const result = validate();
    setValidation(result);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (touched) {
      const result = validate();
      setValidation(result);
    }
  };

  const error = externalError || (touched && validation.error);
  const showValidation = touched && value.length > 0;
  const showSuccess = showValidation && validation.isValid && !externalError;
  const showError = showValidation && (!validation.isValid || externalError);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            showError
              ? 'border-red-500 focus:ring-red-500'
              : showSuccess
              ? 'border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:ring-blue-500'
          } dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
        />

        {/* Validation Icon */}
        {showValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {showSuccess ? (
              <Check className="text-green-500" size={20} />
            ) : showError ? (
              <X className="text-red-500" size={20} />
            ) : null}
          </div>
        )}
      </div>

      {/* Help Text / Error */}
      {error ? (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      ) : null}

      {/* Character Counter */}
      {showCounter && charLimit && (
        <CharacterCounter value={value} limit={charLimit} />
      )}
    </div>
  );
}

// ============================================================================
// VALIDATED TEXTAREA
// ============================================================================

interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  charLimit?: { min?: number; max: number };
  showCounter?: boolean;
  error?: string;
  helpText?: string;
  sanitize?: boolean;
}

/**
 * Textarea with real-time validation and character counter
 */
export function ValidatedTextarea({
  label,
  value,
  onChange,
  required = false,
  charLimit,
  showCounter = true,
  error: externalError,
  helpText,
  sanitize = false,
  ...props
}: ValidatedTextareaProps) {
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });

  const validate = useCallback(() => {
    if (!value && required) {
      return { isValid: false, error: `${label} is required` };
    }

    if (!value) {
      return { isValid: true };
    }

    if (charLimit) {
      return validateCharLimit(value, charLimit);
    }

    return { isValid: true };
  }, [value, required, charLimit, label]);

  useEffect(() => {
    if (touched) {
      const result = validate();
      setValidation(result);
    }
  }, [value, touched, validate]);

  const handleBlur = () => {
    setTouched(true);
    const result = validate();
    setValidation(result);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // Sanitize HTML if needed
    if (sanitize) {
      newValue = sanitizeHTML(newValue);
    }

    onChange(newValue);

    if (touched) {
      const result = validate();
      setValidation(result);
    }
  };

  const error = externalError || (touched && validation.error);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <textarea
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-y ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        } dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
      />

      {error ? (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      ) : null}

      {showCounter && charLimit && (
        <CharacterCounter value={value} limit={charLimit} />
      )}
    </div>
  );
}

// ============================================================================
// CHARACTER COUNTER
// ============================================================================

interface CharacterCounterProps {
  value: string;
  limit: { min?: number; max: number };
}

/**
 * Character counter with visual progress bar
 */
export function CharacterCounter({ value, limit }: CharacterCounterProps) {
  const length = value.length;
  const remaining = limit.max - length;
  const percentage = (length / limit.max) * 100;

  const isNearLimit = percentage > 80;
  const isOverLimit = percentage > 100;
  const isUnderMin = limit.min && length < limit.min;

  return (
    <div className="mt-2">
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isOverLimit
              ? 'bg-red-500'
              : isNearLimit
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Counter Text */}
      <div className="flex justify-between items-center mt-1">
        <span
          className={`text-xs ${
            isOverLimit || isUnderMin
              ? 'text-red-600 dark:text-red-400 font-medium'
              : isNearLimit
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {length} / {limit.max} characters
          {limit.min && length < limit.min && ` (min: ${limit.min})`}
        </span>

        <span
          className={`text-xs ${
            remaining < 0
              ? 'text-red-600 dark:text-red-400 font-medium'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {remaining} remaining
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

interface FileUploadProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  type: 'IMAGE' | 'DOCUMENT';
  required?: boolean;
  error?: string;
  helpText?: string;
  showPreview?: boolean;
}

/**
 * File upload with validation
 */
export function FileUpload({
  label,
  value,
  onChange,
  type,
  required = false,
  error: externalError,
  helpText,
  showPreview = true,
}: FileUploadProps) {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [preview, setPreview] = useState<string | null>(null);

  const limits = FILE_LIMITS[type];

  useEffect(() => {
    // Generate preview for images
    if (value && type === 'IMAGE' && showPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else {
      setPreview(null);
    }
  }, [value, type, showPreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const result = validateFile(file, type);
      setValidation(result);

      if (result.isValid) {
        onChange(file);
      } else {
        onChange(null);
      }
    } else {
      onChange(null);
      setValidation({ isValid: true });
    }
  };

  const handleRemove = () => {
    onChange(null);
    setValidation({ isValid: true });
  };

  const error = externalError || validation.error;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {value ? (
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
          {/* Preview */}
          {preview && type === 'IMAGE' && (
            <div className="mb-4">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-lg mx-auto"
              />
            </div>
          )}

          {/* File Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {type === 'IMAGE' ? (
                <ImageIcon className="text-blue-500" size={24} />
              ) : (
                <FileText className="text-blue-500" size={24} />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {value.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(value.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
          <Upload className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {limits.allowedExtensions.join(', ')} (max{' '}
            {limits.maxSize / (1024 * 1024)}MB)
          </p>
          <input
            type="file"
            accept={limits.allowedTypes.join(',')}
            onChange={handleChange}
            className="hidden"
          />
        </label>
      )}

      {error ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      ) : helpText ? (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      ) : null}
    </div>
  );
}

// ============================================================================
// VALIDATION INDICATOR
// ============================================================================

interface ValidationIndicatorProps {
  checks: { label: string; isValid: boolean }[];
}

/**
 * List of validation checks with visual indicators
 */
export function ValidationIndicator({ checks }: ValidationIndicatorProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Requirements
      </h4>
      <ul className="space-y-2">
        {checks.map((check, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            {check.isValid ? (
              <Check className="text-green-500 flex-shrink-0" size={16} />
            ) : (
              <X className="text-gray-400 flex-shrink-0" size={16} />
            )}
            <span
              className={
                check.isValid
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              }
            >
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
