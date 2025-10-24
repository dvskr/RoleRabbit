import React, { forwardRef, useCallback } from 'react';
import { useAccessibilityContext } from '../providers/AccessibilityProvider';

// Accessible Input Component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fieldName: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, helperText, required = false, fieldName, className = '', ...props }, ref) => {
    const { getFieldProps, getErrorProps, setTouchedField } = useAccessibilityContext();
    
    const fieldProps = getFieldProps(fieldName);
    const errorProps = getErrorProps(fieldName);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setTouchedField(fieldName);
      props.onBlur?.(e);
    }, [fieldName, setTouchedField, props]);

    const inputId = `input-${fieldName}`;
    const errorId = `error-${fieldName}`;
    const helperId = `helper-${fieldName}`;

    return (
      <div className="space-y-1">
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        
        <input
          ref={ref}
          id={inputId}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
          } ${className}`}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
          {...fieldProps}
          {...props}
          onBlur={handleBlur}
        />
        
        {helperText && (
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600"
            {...errorProps}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

// Accessible Textarea Component
interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fieldName: string;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ label, error, helperText, required = false, fieldName, className = '', ...props }, ref) => {
    const { getFieldProps, getErrorProps, setTouchedField } = useAccessibilityContext();
    
    const fieldProps = getFieldProps(fieldName);
    const errorProps = getErrorProps(fieldName);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
      setTouchedField(fieldName);
      props.onBlur?.(e);
    }, [fieldName, setTouchedField, props]);

    const textareaId = `textarea-${fieldName}`;
    const errorId = `error-${fieldName}`;
    const helperId = `helper-${fieldName}`;

    return (
      <div className="space-y-1">
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        
        <textarea
          ref={ref}
          id={textareaId}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
          } ${className}`}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
          {...fieldProps}
          {...props}
          onBlur={handleBlur}
        />
        
        {helperText && (
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600"
            {...errorProps}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleTextarea.displayName = 'AccessibleTextarea';

// Accessible Select Component
interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fieldName: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ label, error, helperText, required = false, fieldName, options, className = '', ...props }, ref) => {
    const { getFieldProps, getErrorProps, setTouchedField } = useAccessibilityContext();
    
    const fieldProps = getFieldProps(fieldName);
    const errorProps = getErrorProps(fieldName);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLSelectElement>) => {
      setTouchedField(fieldName);
      props.onBlur?.(e);
    }, [fieldName, setTouchedField, props]);

    const selectId = `select-${fieldName}`;
    const errorId = `error-${fieldName}`;
    const helperId = `helper-${fieldName}`;

    return (
      <div className="space-y-1">
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        
        <select
          ref={ref}
          id={selectId}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
          } ${className}`}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
          {...fieldProps}
          {...props}
          onBlur={handleBlur}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {helperText && (
          <p id={helperId} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600"
            {...errorProps}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = 'AccessibleSelect';

// Accessible Button Component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled = false,
    className = '',
    children,
    ...props 
  }, ref) => {
    const { getButtonProps } = useAccessibilityContext();
    
    const buttonProps = getButtonProps(() => {}, disabled || loading);

    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center font-medium rounded-md 
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...buttonProps}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// Accessible Checkbox Component
interface AccessibleCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  fieldName: string;
}

export const AccessibleCheckbox = forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  ({ label, error, helperText, fieldName, className = '', ...props }, ref) => {
    const { getFieldProps, getErrorProps, setTouchedField } = useAccessibilityContext();
    
    const fieldProps = getFieldProps(fieldName);
    const errorProps = getErrorProps(fieldName);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setTouchedField(fieldName);
      props.onBlur?.(e);
    }, [fieldName, setTouchedField, props]);

    const checkboxId = `checkbox-${fieldName}`;
    const errorId = `error-${fieldName}`;
    const helperId = `helper-${fieldName}`;

    return (
      <div className="space-y-1">
        <div className="flex items-start">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
              error ? 'border-red-300' : ''
            } ${className}`}
            aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
            {...fieldProps}
            {...props}
            onBlur={handleBlur}
          />
          <label 
            htmlFor={checkboxId}
            className="ml-2 block text-sm text-gray-700"
          >
            {label}
          </label>
        </div>
        
        {helperText && (
          <p id={helperId} className="text-sm text-gray-500 ml-6">
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600 ml-6"
            {...errorProps}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleCheckbox.displayName = 'AccessibleCheckbox';

// Accessible Radio Group Component
interface AccessibleRadioGroupProps {
  label: string;
  name: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  fieldName: string;
}

export const AccessibleRadioGroup: React.FC<AccessibleRadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  helperText,
  required = false,
  fieldName
}) => {
  const { getFieldProps, getErrorProps, setTouchedField } = useAccessibilityContext();
  
  const fieldProps = getFieldProps(fieldName);
  const errorProps = getErrorProps(fieldName);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    setTouchedField(fieldName);
  }, [fieldName, setTouchedField]);

  const groupId = `radio-group-${fieldName}`;
  const errorId = `error-${fieldName}`;
  const helperId = `helper-${fieldName}`;

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </legend>
      
      <div 
        role="radiogroup"
        aria-labelledby={groupId}
        aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
        {...fieldProps}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${fieldName}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={option.disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label 
              htmlFor={`${fieldName}-${option.value}`}
              className="ml-2 block text-sm text-gray-700"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      
      {helperText && (
        <p id={helperId} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600"
          {...errorProps}
        >
          {error}
        </p>
      )}
    </fieldset>
  );
};

