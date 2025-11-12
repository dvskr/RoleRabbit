/**
 * Date helper utilities
 */

/**
 * Get date range
 */
export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  return { start, end };
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return d.toDateString() === today.toDateString();
}

/**
 * Check if date is in this week
 */
export function isThisWeek(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return d >= weekAgo && d <= today;
}

/**
 * Check if date is in this month
 */
export function isThisMonth(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

/**
 * Validation result for date validation
 */
export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate if a date string is in MM/YYYY format
 * @param date - The date string to validate
 * @returns True if the date is in MM/YYYY format, false otherwise
 */
export const isValidDateFormat = (date: string | null | undefined): boolean => {
  if (!date || !date.trim()) return false;

  const trimmed = date.trim();

  // Check MM/YYYY format
  const mmyyyyRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  if (!mmyyyyRegex.test(trimmed)) {
    return false;
  }

  // Extract month and year
  const [month, year] = trimmed.split('/').map(Number);

  // Validate month (1-12)
  if (month < 1 || month > 12) {
    return false;
  }

  // Validate year (reasonable range: 1900 - current year + 10)
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear + 10) {
    return false;
  }

  return true;
};

/**
 * Validate a date string and return detailed validation result
 * @param date - The date string to validate
 * @param fieldName - Optional field name for error messages
 * @param required - Whether the field is required (default: false)
 * @returns Validation result with isValid and error message
 */
export const validateDate = (
  date: string | null | undefined,
  fieldName: string = 'Date',
  required: boolean = false
): DateValidationResult => {
  // Handle empty values
  if (!date || !date.trim()) {
    if (required) {
      return {
        isValid: false,
        error: `${fieldName} is required`,
      };
    }
    return { isValid: true }; // Empty optional fields are valid
  }

  const trimmed = date.trim();

  // Check for "Present" or "Current" (special case for end dates)
  if (trimmed.toLowerCase() === 'present' || trimmed.toLowerCase() === 'current') {
    return { isValid: true };
  }

  // Validate MM/YYYY format
  if (!isValidDateFormat(trimmed)) {
    return {
      isValid: false,
      error: `${fieldName} must be in MM/YYYY format (e.g., 01/2023)`,
    };
  }

  return { isValid: true };
};

/**
 * Compare two dates in MM/YYYY format
 * @param startDate - Start date in MM/YYYY format
 * @param endDate - End date in MM/YYYY format or "Present"
 * @returns True if start date is before or equal to end date, false otherwise
 */
export const isStartBeforeEnd = (
  startDate: string | null | undefined,
  endDate: string | null | undefined
): boolean => {
  if (!startDate || !endDate) return true; // Can't compare if either is missing

  // If end date is "Present", it's always valid
  const endTrimmed = endDate.trim().toLowerCase();
  if (endTrimmed === 'present' || endTrimmed === 'current') {
    return true;
  }

  // Validate both dates
  if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
    return true; // Can't compare invalid dates, let other validation catch it
  }

  // Parse dates
  const [startMonth, startYear] = startDate.split('/').map(Number);
  const [endMonth, endYear] = endDate.split('/').map(Number);

  // Compare years first, then months
  if (startYear < endYear) return true;
  if (startYear > endYear) return false;
  return startMonth <= endMonth;
};

/**
 * Validate date range (start and end dates)
 * @param startDate - Start date in MM/YYYY format
 * @param endDate - End date in MM/YYYY format or "Present"
 * @returns Validation result with isValid and error message
 */
export const validateDateRange = (
  startDate: string | null | undefined,
  endDate: string | null | undefined
): DateValidationResult => {
  // Validate start date
  const startValidation = validateDate(startDate, 'Start date', false);
  if (!startValidation.isValid) {
    return startValidation;
  }

  // Validate end date
  const endValidation = validateDate(endDate, 'End date', false);
  if (!endValidation.isValid) {
    return endValidation;
  }

  // Check if start is before end
  if (startDate && endDate && !isStartBeforeEnd(startDate, endDate)) {
    return {
      isValid: false,
      error: 'Start date must be before or equal to end date',
    };
  }

  return { isValid: true };
};
