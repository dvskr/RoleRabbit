/**
 * Validation Utilities
 * Common validation functions for API requests
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate password strength
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  // At least 8 characters
  if (password.length < 8) return false;
  return true;
}

/**
 * Validate required fields
 */
function validateRequired(fields, data) {
  if (!Array.isArray(fields) || !data) {
    return { isValid: false, missing: [] };
  }
  
  const missing = fields.filter(field => !data[field] || 
    (typeof data[field] === 'string' && data[field].trim().length === 0)
  );
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Validate string length
 */
function validateLength(label, value, min, max) {
  if (!value || typeof value !== 'string') {
    return { isValid: false, message: `${label} is required` };
  }
  if (min !== undefined && value.length < min) {
    return { isValid: false, message: `${label} must be at least ${min} characters` };
  }
  if (max !== undefined && value.length > max) {
    return { isValid: false, message: `${label} must be at most ${max} characters` };
  }
  return { isValid: true };
}

/**
 * Validate resume data structure
 * Frontend sends: {name, data: JSON.stringify(resumeData), templateId}
 */
function validateResumeData(data) {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: { message: 'Resume data must be an object' }
    };
  }
  
  // Check required field: name
  if (!data.name || typeof data.name !== 'string') {
    return {
      isValid: false,
      errors: { name: 'Resume name is required' }
    };
  }
  
  // Validate data field (can be string or object)
  if (data.data !== undefined) {
    if (typeof data.data !== 'string' && typeof data.data !== 'object') {
      return {
        isValid: false,
        errors: { data: 'Resume data must be a string or object' }
      };
    }
  }
  
  // Email validation is optional since email is inside the resume data string
  // The actual resume content will be validated when parsed
  
  return {
    isValid: true,
    errors: {}
  };
}

/**
 * Validate job application data
 */
function validateJobApplication(data) {
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: { message: 'Job data must be an object' }
    };
  }
  
  // Check required fields
  const requiredFields = ['title', 'company'];
  const errors = {};
  
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      errors[field] = `${field} is required and must be a string`;
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return {
      isValid: false,
      errors: errors
    };
  }
  
  return {
    isValid: true,
    errors: {}
  };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateRequired,
  validateLength,
  validateResumeData,
  validateJobApplication
};

