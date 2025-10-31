import React, { forwardRef, useCallback } from 'react';
import { useAccessibilityContext } from '../../providers/AccessibilityProvider';
import { AccessibleSelectProps } from './types';

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

