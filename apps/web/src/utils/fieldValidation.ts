/**
 * Field validation utilities
 * @module utils/fieldValidation
 */

/**
 * Validation result for field validation
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate if a field is not empty
 * @param value - The value to validate
 * @param fieldName - Field name for error messages
 * @returns Validation result with isValid and error message
 */
export const validateRequired = (
  value: string | null | undefined,
  fieldName: string = 'Field'
): FieldValidationResult => {
  if (!value || !value.trim()) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return { isValid: true };
};

/**
 * Validate minimum length of a field
 * @param value - The value to validate
 * @param minLength - Minimum length
 * @param fieldName - Field name for error messages
 * @returns Validation result with isValid and error message
 */
export const validateMinLength = (
  value: string | null | undefined,
  minLength: number,
  fieldName: string = 'Field'
): FieldValidationResult => {
  if (!value) {
    return { isValid: true }; // Empty values are valid (use validateRequired for required fields)
  }

  if (value.trim().length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validate maximum length of a field
 * @param value - The value to validate
 * @param maxLength - Maximum length
 * @param fieldName - Field name for error messages
 * @returns Validation result with isValid and error message
 */
export const validateMaxLength = (
  value: string | null | undefined,
  maxLength: number,
  fieldName: string = 'Field'
): FieldValidationResult => {
  if (!value) {
    return { isValid: true }; // Empty values are valid
  }

  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at most ${maxLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validate field with multiple validation rules
 * @param value - The value to validate
 * @param fieldName - Field name for error messages
 * @param rules - Validation rules
 * @returns Validation result with isValid and error message
 */
export const validateField = (
  value: string | null | undefined,
  fieldName: string,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  } = {}
): FieldValidationResult => {
  // Required validation
  if (rules.required) {
    const requiredValidation = validateRequired(value, fieldName);
    if (!requiredValidation.isValid) {
      return requiredValidation;
    }
  }

  // Skip other validations if value is empty and not required
  if (!value || !value.trim()) {
    return { isValid: true };
  }

  // Min length validation
  if (rules.minLength !== undefined) {
    const minLengthValidation = validateMinLength(value, rules.minLength, fieldName);
    if (!minLengthValidation.isValid) {
      return minLengthValidation;
    }
  }

  // Max length validation
  if (rules.maxLength !== undefined) {
    const maxLengthValidation = validateMaxLength(value, rules.maxLength, fieldName);
    if (!maxLengthValidation.isValid) {
      return maxLengthValidation;
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return {
      isValid: false,
      error: rules.patternMessage || `${fieldName} format is invalid`,
    };
  }

  return { isValid: true };
};

/**
 * Validate email format
 * @param email - The email to validate
 * @returns True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email || !email.trim()) return false;

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate email and return detailed validation result
 * @param email - The email to validate
 * @param fieldName - Field name for error messages
 * @param required - Whether the field is required
 * @returns Validation result with isValid and error message
 */
export const validateEmail = (
  email: string | null | undefined,
  fieldName: string = 'Email',
  required: boolean = false
): FieldValidationResult => {
  // Handle empty values
  if (!email || !email.trim()) {
    if (required) {
      return {
        isValid: false,
        error: `${fieldName} is required`,
      };
    }
    return { isValid: true }; // Empty optional fields are valid
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return {
      isValid: false,
      error: `${fieldName} is not a valid email address`,
    };
  }

  return { isValid: true };
};
