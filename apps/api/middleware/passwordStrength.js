/**
 * Password Strength Validation Middleware
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * - No common passwords (from list)
 * - Not similar to email/username
 * 
 * Usage:
 *   router.post('/api/auth/register', validatePasswordStrength, handler);
 */

const zxcvbn = require('zxcvbn');

// Common weak passwords to reject
const COMMON_PASSWORDS = [
  'password', 'password123', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567890', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
  'bailey', 'passw0rd', 'shadow', '123123', '654321',
  'superman', 'qazwsx', 'michael', 'football', 'welcome',
];

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {object} userData - User data (email, name) for similarity check
 * @returns {object} Validation result
 */
function validatePassword(password, userData = {}) {
  const errors = [];
  const warnings = [];

  // Check minimum length
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check maximum length (prevent DoS)
  if (password && password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password');
  }

  // Check similarity to email/username
  if (userData.email) {
    const emailUsername = userData.email.split('@')[0].toLowerCase();
    if (password.toLowerCase().includes(emailUsername)) {
      warnings.push('Password should not contain your email username');
    }
  }

  if (userData.name) {
    const nameLower = userData.name.toLowerCase();
    if (password.toLowerCase().includes(nameLower)) {
      warnings.push('Password should not contain your name');
    }
  }

  // Use zxcvbn for advanced strength analysis
  const strength = zxcvbn(password, [
    userData.email,
    userData.name,
    'roleready',
    'resume',
  ]);

  // Require minimum strength score of 3 (out of 4)
  if (strength.score < 3) {
    errors.push(`Password is too weak. ${strength.feedback.warning || 'Try a longer password with more variety'}`);
    
    if (strength.feedback.suggestions.length > 0) {
      warnings.push(...strength.feedback.suggestions);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    strength: {
      score: strength.score,
      crackTime: strength.crack_times_display.offline_slow_hashing_1e4_per_second,
    },
  };
}

/**
 * Middleware to validate password strength
 */
function validatePasswordStrength(req, res, next) {
  const { password, email, name } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Password is required',
      code: 'PASSWORD_REQUIRED',
    });
  }

  const validation = validatePassword(password, { email, name });

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Password does not meet strength requirements',
      code: 'WEAK_PASSWORD',
      details: {
        errors: validation.errors,
        warnings: validation.warnings,
        requirements: [
          'Minimum 8 characters',
          'At least 1 uppercase letter',
          'At least 1 lowercase letter',
          'At least 1 number',
          'At least 1 special character',
          'Not a common password',
        ],
      },
    });
  }

  // Add warnings to response if any (but allow request to proceed)
  if (validation.warnings.length > 0) {
    req.passwordWarnings = validation.warnings;
  }

  next();
}

/**
 * Generate a strong random password
 * @param {number} length - Password length (default: 16)
 * @returns {string} Random password
 */
function generateStrongPassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = uppercase + lowercase + numbers + special;

  let password = '';

  // Ensure at least one of each required type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if password has been compromised (using Have I Been Pwned API)
 * @param {string} password - Password to check
 * @returns {Promise<boolean>} True if compromised
 */
async function isPasswordCompromised(password) {
  const crypto = require('crypto');
  const https = require('https');

  // Hash password with SHA-1
  const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  return new Promise((resolve, reject) => {
    https.get(`https://api.pwnedpasswords.com/range/${prefix}`, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        // Check if our hash suffix is in the response
        const compromised = data.split('\n').some(line => {
          const [hashSuffix] = line.split(':');
          return hashSuffix === suffix;
        });

        resolve(compromised);
      });
    }).on('error', (error) => {
      console.error('Failed to check password breach:', error);
      // Don't block on API error
      resolve(false);
    });
  });
}

module.exports = {
  validatePassword,
  validatePasswordStrength,
  generateStrongPassword,
  isPasswordCompromised,
};

