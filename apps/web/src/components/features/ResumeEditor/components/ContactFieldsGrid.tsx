'use client';

import React, { useState, useCallback } from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Plus, AlertCircle } from 'lucide-react';
import { ThemeColors } from '../../../../contexts/ThemeContext';
import { STANDARD_CONTACT_FIELDS } from '../constants';
import { getFieldIcon } from '../utils/iconHelpers';
import { validateEmail, validatePhone, validateURL, normalizeURL } from '../../../../utils/validation';
import { ResumeData, CustomField } from '../../../../types/resume';

interface ContactFieldsGridProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  customFields: CustomField[];
  setCustomFields: (fields: CustomField[]) => void;
  setShowAddFieldModal: (show: boolean) => void;
  colors: ThemeColors;
  externalErrors?: Record<string, string>;
  showRequired?: boolean;
}

const CONTACT_FIELD_ICONS = [
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
];

export default function ContactFieldsGrid({
  resumeData,
  setResumeData,
  customFields,
  setCustomFields,
  setShowAddFieldModal,
  colors,
  externalErrors = {},
  showRequired = false,
}: ContactFieldsGridProps) {
  // Validation errors state (merge internal and external errors)
  const [internalErrors, setInternalErrors] = useState<Record<string, string>>({});
  const validationErrors = { ...internalErrors, ...externalErrors };

  // Use accentCyan for all icons
  const getIconColor = () => {
    return colors.accentCyan;
  };

  // Validate field based on type
  const validateField = useCallback((field: string, value: string): boolean => {
    let validation;
    
    if (field === 'email') {
      validation = validateEmail(value);
    } else if (field === 'phone') {
      validation = validatePhone(value);
    } else if (field === 'linkedin' || field === 'github' || field === 'website') {
      validation = validateURL(value);
    } else {
      // No validation for location
      return true;
    }

    if (!validation.isValid) {
      setInternalErrors(prev => ({ ...prev, [field]: validation.error || '' }));
      return false;
    } else {
      setInternalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    }
  }, []);

  // Handle field change with validation
  const handleFieldChange = useCallback((field: string, value: string) => {
    setResumeData((prev: ResumeData) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (internalErrors[field]) {
      setInternalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [setResumeData, internalErrors]);

  // Handle field blur with validation and URL normalization
  const handleFieldBlur = useCallback((field: string, value: string, inputElement: HTMLInputElement) => {
    // Normalize URLs on blur
    let valueToValidate = value;
    if ((field === 'linkedin' || field === 'github' || field === 'website') && value.trim()) {
      const normalized = normalizeURL(value);
      if (normalized !== value) {
        setResumeData((prev: ResumeData) => ({ ...prev, [field]: normalized }));
        valueToValidate = normalized;
      }
    }

    // Validate the field and get result immediately
    let validation;
    if (field === 'email') {
      validation = validateEmail(valueToValidate);
    } else if (field === 'phone') {
      validation = validatePhone(valueToValidate);
    } else if (field === 'linkedin' || field === 'github' || field === 'website') {
      validation = validateURL(valueToValidate);
    } else {
      validation = { isValid: true };
    }

    // Update validation errors state
    if (!validation.isValid) {
      setInternalErrors(prev => ({ ...prev, [field]: validation.error || '' }));
      inputElement.style.borderColor = colors.errorRed;
    } else {
      setInternalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      inputElement.style.borderColor = colors.border;
    }
    
    inputElement.style.outline = 'none';
  }, [setResumeData, colors.errorRed, colors.border]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 text-sm mb-6 lg:mb-10">
      {/* Standard Contact Fields */}
      {STANDARD_CONTACT_FIELDS.map((field, idx) => {
        const IconComponent = CONTACT_FIELD_ICONS[idx];
        const hasError = !!validationErrors[field];
        const fieldValue = resumeData[field] || '';
        const isRequired = field === 'email' || field === 'phone';
        const isEmpty = !fieldValue || fieldValue.trim() === '';
        const showRequiredError = showRequired && isRequired && isEmpty;
        const displayError = hasError || showRequiredError;

        return (
          <div key={field} className="flex flex-col gap-1">
            <div className="flex items-center gap-2 group">
              {IconComponent && (
                <IconComponent 
                  size={16} 
                  style={{ color: getIconColor() }}
                  aria-label={`${field} icon`}
                  role="img"
                />
              )}
              <input
                id={field}
                name={field}
                aria-label={field.charAt(0).toUpperCase() + field.slice(1)}
                aria-invalid={displayError}
                aria-required={isRequired}
                aria-describedby={displayError ? `${field}-error` : undefined} 
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                className="flex-1 border-2 outline-none rounded-lg px-2 sm:px-3 py-2 min-w-0 max-w-full break-words overflow-wrap-anywhere text-sm transition-all" 
                style={{
                  background: displayError ? '#fef2f2' : colors.inputBackground,
                  border: `2px solid ${displayError ? colors.errorRed : colors.border}`,
                  color: colors.primaryText,
                }}
                value={fieldValue} 
                onChange={(e) => handleFieldChange(field, e.target.value)}
                placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)}${isRequired ? ' *' : ''}`}
                onFocus={(e) => {
                  e.target.style.borderColor = displayError ? colors.errorRed : colors.accentCyan;
                  e.target.style.outline = `2px solid ${displayError ? `${colors.errorRed}40` : `${colors.accentCyan}40`}`;
                }}
                onBlur={(e) => handleFieldBlur(field, e.target.value, e.target)}
              />
            </div>
            {displayError && (
              <div 
                id={`${field}-error`}
                className="flex items-center gap-1 ml-6 text-xs" 
                style={{ color: colors.errorRed }}
                role="alert"
              >
                <AlertCircle size={12} aria-hidden="true" />
                <span>{validationErrors[field] || `${field.charAt(0).toUpperCase() + field.slice(1)} is required`}</span>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Custom Fields */}
      {customFields.map((field) => (
        <div key={field.id} className="flex items-center gap-2 group">
          {getFieldIcon(field.icon || 'default', colors.accentCyan)}
          <input 
            className="flex-1 border-2 outline-none rounded-lg px-2 sm:px-3 py-2 min-w-0 max-w-full break-words overflow-wrap-anywhere text-sm transition-all" 
            style={{
              background: colors.inputBackground,
              border: `2px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            value={field.value || ''} 
            onChange={(e) => {
              const updatedFields = customFields.map(f => 
                f.id === field.id ? { ...f, value: e.target.value } : f
              );
              setCustomFields(updatedFields);
            }}
            placeholder={field.name}
            onFocus={(e) => {
              e.target.style.borderColor = colors.accentCyan;
              e.target.style.outline = `2px solid ${colors.accentCyan}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border;
              e.target.style.outline = 'none';
            }}
          />
        </div>
      ))}
      
      {/* Add Custom Field Button */}
      <div className="flex items-center gap-2 group">
        <Plus size={16} style={{ color: colors.accentCyan }} />
        <button
          onClick={() => setShowAddFieldModal(true)}
          className="flex-1 border-2 border-dashed rounded-lg px-2 sm:px-3 py-2 text-left min-w-0 max-w-full transition-all"
          style={{
            border: `2px dashed ${colors.border}`,
            background: 'transparent',
            color: colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.accentCyan;
            e.currentTarget.style.background = `${colors.accentCyan}10`;
            e.currentTarget.style.color = colors.accentCyan;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.secondaryText;
          }}
        >
          <span className="text-xs sm:text-sm font-medium break-words overflow-wrap-anywhere">Add Field</span>
        </button>
      </div>
    </div>
  );
}

