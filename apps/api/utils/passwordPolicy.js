/**
 * Password Policy Utility
 * 
 * Implements password strength requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */

const bcrypt = require('bcrypt');

// Password policy configuration
const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/**
 * Validate password against policy
 * 
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validatePassword(password) {
  const errors = [];
  
  if (!password) {
    return {
      valid: false,
      errors: ['Password is required']
    };
  }
  
  // Check length
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
  }
  
  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must be at most ${PASSWORD_POLICY.maxLength} characters long`);
  }
  
  // Check uppercase
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check lowercase
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check number
  if (PASSWORD_POLICY.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check special character
  if (PASSWORD_POLICY.requireSpecialChar) {
    const specialCharRegex = new RegExp(`[${PASSWORD_POLICY.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharRegex.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate password strength
 * 
 * @param {string} password - Password to check
 * @returns {Object} - { score: number (0-4), feedback: string }
 */
function calculatePasswordStrength(password) {
  let score = 0;
  const feedback = [];
  
  if (!password) {
    return { score: 0, feedback: ['Password is empty'] };
  }
  
  // Length score
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Character variety score
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (new RegExp(`[${PASSWORD_POLICY.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) score++;
  
  // Normalize score to 0-4
  score = Math.min(4, Math.floor(score / 1.5));
  
  // Generate feedback
  if (score === 0) {
    feedback.push('Very weak password');
  } else if (score === 1) {
    feedback.push('Weak password');
  } else if (score === 2) {
    feedback.push('Fair password');
  } else if (score === 3) {
    feedback.push('Strong password');
  } else if (score === 4) {
    feedback.push('Very strong password');
  }
  
  if (password.length < 12) {
    feedback.push('Consider using a longer password');
  }
  
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    feedback.push('Use both uppercase and lowercase letters');
  }
  
  if (!/\d/.test(password)) {
    feedback.push('Add numbers to your password');
  }
  
  if (!new RegExp(`[${PASSWORD_POLICY.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
    feedback.push('Add special characters to your password');
  }
  
  return { score, feedback };
}

/**
 * Check if password is common/weak
 * 
 * @param {string} password - Password to check
 * @returns {boolean} - Whether password is common
 */
function isCommonPassword(password) {
  // List of common passwords (top 100)
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
    'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
    'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
    'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang',
    'password1', '123456789', '12345', 'password123', '1234', 'admin', 'root'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Hash password
 * 
 * @param {string} password - Password to hash
 * @returns {string} - Hashed password
 */
async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 * 
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} - Whether password matches
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Middleware to validate password on registration/change
 * 
 * @returns {Function} - Express middleware
 */
function validatePasswordMiddleware() {
  return (req, res, next) => {
    const password = req.body.password || req.body.newPassword;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
        code: 'PASSWORD_REQUIRED'
      });
    }
    
    // Validate password
    const validation = validatePassword(password);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        code: 'PASSWORD_INVALID',
        details: validation.errors
      });
    }
    
    // Check if common password
    if (isCommonPassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password is too common. Please choose a stronger password.',
        code: 'PASSWORD_TOO_COMMON'
      });
    }
    
    next();
  };
}

/**
 * Generate password requirements message
 * 
 * @returns {string} - Requirements message
 */
function getPasswordRequirements() {
  return `Password must:
- Be at least ${PASSWORD_POLICY.minLength} characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)
- Contain at least one special character (${PASSWORD_POLICY.specialChars})`;
}

module.exports = {
  PASSWORD_POLICY,
  validatePassword,
  calculatePasswordStrength,
  isCommonPassword,
  hashPassword,
  comparePassword,
  validatePasswordMiddleware,
  getPasswordRequirements
};

