import React, { forwardRef, useCallback } from 'react';
import { useAccessibilityContext } from '../../providers/AccessibilityProvider';
import { AccessibleCheckboxProps } from './types';

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

