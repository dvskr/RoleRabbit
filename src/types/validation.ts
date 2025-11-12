/**
 * Shared validation types
 * @module types/validation
 */

/**
 * Generic validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Field validation rules
 */
export interface FieldValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: string) => ValidationResult;
}

/**
 * Validator function type
 */
export type ValidatorFunction = (
  value: string | null | undefined,
  fieldName?: string
) => ValidationResult;

/**
 * Multi-field validator
 */
export type MultiFieldValidator = (
  fields: Record<string, string | null | undefined>
) => Record<string, ValidationResult>;

/**
 * Async validator function
 */
export type AsyncValidatorFunction = (
  value: string | null | undefined,
  fieldName?: string
) => Promise<ValidationResult>;

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Bulk validation result
 */
export interface BulkValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  validFields: string[];
  invalidFields: string[];
}

/**
 * URL validation result (extended)
 */
export interface UrlValidationResult extends ValidationResult {
  normalized?: string;
}

/**
 * Date validation result (extended)
 */
export interface DateValidationResult extends ValidationResult {
  parsed?: Date;
}

/**
 * Email validation result (extended)
 */
export interface EmailValidationResult extends ValidationResult {
  normalized?: string;
}
