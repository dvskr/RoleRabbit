/**
 * Password validation utilities
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a password according to requirements
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must include lowercase letters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include uppercase letters');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must include at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates password change data
 */
export const validatePasswordChange = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): PasswordValidationResult => {
  const errors: string[] = [];

  if (!currentPassword || !newPassword || !confirmPassword) {
    errors.push('All password fields are required');
    return { isValid: false, errors };
  }

  if (newPassword !== confirmPassword) {
    errors.push('New password and confirm password do not match');
  }

  const passwordValidation = validatePassword(newPassword);
  errors.push(...passwordValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

