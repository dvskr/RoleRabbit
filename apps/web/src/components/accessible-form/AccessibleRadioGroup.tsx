import React, { useCallback } from 'react';
import { useAccessibilityContext } from '../../providers/AccessibilityProvider';
import { AccessibleRadioGroupProps } from './types';

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

