/**
 * Validation utilities for profile data
 * @module utils/validation
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateEmail(email) {
  if (!email) return { valid: true }; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: emailRegex.test(email),
    error: emailRegex.test(email) ? null : 'Invalid email format'
  };
}

/**
 * Validate phone number format (supports various formats)
 * @param {string} phone - Phone number to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validatePhone(phone) {
  if (!phone) return { valid: true }; // Optional field
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s().-]/g, '');
  // Allow formats: +1234567890, 1234567890, (123) 456-7890, etc.
  const phoneRegex = /^\+?[\d\s().-]{10,15}$/;
  return {
    valid: phoneRegex.test(cleaned) && cleaned.replace(/\D/g, '').length >= 10,
    error: phoneRegex.test(cleaned) && cleaned.replace(/\D/g, '').length >= 10 
      ? null 
      : 'Invalid phone number format'
  };
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @param {string} [fieldName='URL'] - Field name for error message
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateURL(url, fieldName = 'URL') {
  if (!url) return { valid: true }; // Optional field
  try {
    // Allow URLs with or without protocol
    const urlToTest = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    new URL(urlToTest);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: `Invalid ${fieldName} format`
    };
  }
}

/**
 * Validate date format (MM/YYYY)
 * @param {string} date - Date string in MM/YYYY format or 'Present'
 * @param {string} [fieldName='Date'] - Field name for error message
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateDate(date, fieldName = 'Date') {
  if (!date) return { valid: true }; // Optional field
  if (date === 'Present' || date === 'Current') return { valid: true };
  
  const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  if (!dateRegex.test(date)) {
    return {
      valid: false,
      error: `${fieldName} must be in MM/YYYY format`
    };
  }
  
  const [month, year] = date.split('/');
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (monthNum < 1 || monthNum > 12) {
    return {
      valid: false,
      error: 'Invalid month (must be 01-12)'
    };
  }
  
  if (yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
    return {
      valid: false,
      error: 'Invalid year'
    };
  }
  
  return { valid: true };
}

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} maxLength - Maximum allowed length
 * @param {string} [fieldName='Text'] - Field name for error message
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateTextLength(text, maxLength, fieldName = 'Text') {
  if (!text) return { valid: true }; // Optional field
  if (typeof text !== 'string') {
    return {
      valid: false,
      error: `${fieldName} must be a string`
    };
  }
  return {
    valid: text.length <= maxLength,
    error: text.length > maxLength 
      ? `${fieldName} must be ${maxLength} characters or less (current: ${text.length})`
      : null
  };
}

/**
 * Validate required field
 * @param {*} value - Value to check
 * @param {string} fieldName - Field name for error message
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateRequired(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }
  return { valid: true };
}

/**
 * Validate array
 * @param {*} value - Value to validate as array
 * @param {string} [fieldName='Array'] - Field name for error message
 * @param {Object} [options={}] - Validation options
 * @param {number} [options.minLength] - Minimum array length
 * @param {number} [options.maxLength] - Maximum array length
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validateArray(value, fieldName = 'Array', options = {}) {
  if (!value) return { valid: true }; // Optional field
  
  if (!Array.isArray(value)) {
    return {
      valid: false,
      error: `${fieldName} must be an array`
    };
  }
  
  if (options.minLength !== undefined && value.length < options.minLength) {
    return {
      valid: false,
      error: `${fieldName} must have at least ${options.minLength} item(s)`
    };
  }
  
  if (options.maxLength !== undefined && value.length > options.maxLength) {
    return {
      valid: false,
      error: `${fieldName} must have at most ${options.maxLength} item(s)`
    };
  }
  
  return { valid: true };
}

/**
 * Validate profile data object
 * @param {Object} data - Profile data to validate
 * @param {string} [data.email] - Email address
 * @param {string} [data.phone] - Phone number
 * @param {string} [data.linkedin] - LinkedIn URL
 * @param {string} [data.github] - GitHub URL
 * @param {string} [data.portfolio] - Portfolio URL
 * @param {string} [data.website] - Website URL
 * @param {string} [data.professionalBio] - Professional bio text
 * @param {Array} [data.workExperiences] - Array of work experiences
 * @param {Array} [data.projects] - Array of projects
 * @returns {{valid: boolean, errors: Object}} Validation result with errors object
 */
function validateProfileData(data) {
  const errors = {};
  
  // Basic fields
  if (data.email !== undefined) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) errors.email = emailValidation.error;
  }
  
  if (data.phone !== undefined) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.valid) errors.phone = phoneValidation.error;
  }
  
  // URLs
  if (data.linkedin !== undefined) {
    const linkedinValidation = validateURL(data.linkedin, 'LinkedIn URL');
    if (!linkedinValidation.valid) errors.linkedin = linkedinValidation.error;
  }
  
  if (data.github !== undefined) {
    const githubValidation = validateURL(data.github, 'GitHub URL');
    if (!githubValidation.valid) errors.github = githubValidation.error;
  }
  
  if (data.portfolio !== undefined) {
    const portfolioValidation = validateURL(data.portfolio, 'Portfolio URL');
    if (!portfolioValidation.valid) errors.portfolio = portfolioValidation.error;
  }
  
  if (data.website !== undefined) {
    const websiteValidation = validateURL(data.website, 'Website URL');
    if (!websiteValidation.valid) errors.website = websiteValidation.error;
  }
  
  // Text fields
  if (data.professionalBio !== undefined) {
    const bioValidation = validateTextLength(data.professionalBio, 5000, 'Professional Bio');
    if (!bioValidation.valid) errors.professionalBio = bioValidation.error;
  }
  
  // Arrays - only validate if value is actually an array (skip if null, undefined, or non-array)
  if (data.workExperiences !== undefined && data.workExperiences !== null && Array.isArray(data.workExperiences)) {
    // Validate each work experience
    data.workExperiences.forEach((exp, index) => {
      if (exp) {
        if (exp.company) {
          const companyValidation = validateTextLength(exp.company, 200, 'Company name');
          if (!companyValidation.valid) {
            errors[`workExperiences.${index}.company`] = companyValidation.error;
          }
        }
        if (exp.role) {
          const roleValidation = validateTextLength(exp.role, 200, 'Role');
          if (!roleValidation.valid) {
            errors[`workExperiences.${index}.role`] = roleValidation.error;
          }
        }
        if (exp.startDate) {
          const startDateValidation = validateDate(exp.startDate, 'Start date');
          if (!startDateValidation.valid) {
            errors[`workExperiences.${index}.startDate`] = startDateValidation.error;
          }
        }
        if (exp.endDate && exp.endDate !== 'Present') {
          const endDateValidation = validateDate(exp.endDate, 'End date');
          if (!endDateValidation.valid) {
            errors[`workExperiences.${index}.endDate`] = endDateValidation.error;
          }
        }
        if (exp.description) {
          const descValidation = validateTextLength(exp.description, 10000, 'Description');
          if (!descValidation.valid) {
            errors[`workExperiences.${index}.description`] = descValidation.error;
          }
        }
      }
    });
  }
  
  if (data.projects !== undefined && data.projects !== null && Array.isArray(data.projects)) {
    data.projects.forEach((project, index) => {
      if (project) {
        if (project.title) {
          const titleValidation = validateTextLength(project.title, 200, 'Project title');
          if (!titleValidation.valid) {
            errors[`projects.${index}.title`] = titleValidation.error;
          }
        }
        if (project.description) {
          const descValidation = validateTextLength(project.description, 10000, 'Project description');
          if (!descValidation.valid) {
            errors[`projects.${index}.description`] = descValidation.error;
          }
        }
      }
    });
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
function validatePassword(password) {
  if (!password) {
    return {
      valid: false,
      error: 'Password is required'
    };
  }
  
  // Check minimum length
  if (password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters'
    };
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one uppercase letter'
    };
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one lowercase letter'
    };
  }
  
  // Check for number
  if (!/\d/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one number'
    };
  }
  
  return { valid: true };
}

module.exports = {
  validateEmail,
  validatePhone,
  validateURL,
  validateDate,
  validateTextLength,
  validateRequired,
  validateArray,
  validateProfileData,
  validatePassword
};
