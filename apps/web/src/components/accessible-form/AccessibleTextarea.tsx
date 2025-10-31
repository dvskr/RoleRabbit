import React, { forwardRef, useCallback } from 'react';
import { useAccessibilityContext } from '../../providers/AccessibilityProvider';
import { AccessibleTextareaProps } from './types';

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

