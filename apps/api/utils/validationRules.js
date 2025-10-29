/**
 * Advanced Validation Rules
 * Comprehensive validation functions for various data types
 */

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number (US format)
 */
function isValidPhone(phone) {
  const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

/**
 * Validate date
 */
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate ISO date string
 */
function isValidISODate(dateString) {
  const date = new Date(dateString);
  return date.toISOString() === dateString;
}

/**
 * Validate credit card number (Luhn algorithm)
 */
function isValidCreditCard(cardNumber) {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate strong password
 */
function isStrongPassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

/**
 * Validate username
 */
function isValidUsername(username) {
  // 3-20 characters, alphanumeric and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate file extension
 */
function isValidFileExtension(filename, allowedExtensions) {
  const ext = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(ext);
}

/**
 * Validate file size
 */
function isValidFileSize(fileSize, maxSizeBytes) {
  return fileSize <= maxSizeBytes;
}

module.exports = {
  isValidEmail,
  isValidUrl,
  isValidPhone,
  isValidDate,
  isValidISODate,
  isValidCreditCard,
  isStrongPassword,
  isValidUsername,
  isValidFileExtension,
  isValidFileSize
};

