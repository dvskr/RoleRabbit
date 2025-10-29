/**
 * Enhanced Validator
 * Common validation functions
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
const PHONE_REGEX = /^\+?[\d\s-()]+$/;

function validateEmail(email) {
  return EMAIL_REGEX.test(email);
}

function validateURL(url) {
  return URL_REGEX.test(url);
}

function validatePhone(phone) {
  return PHONE_REGEX.test(phone);
}

function validateRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

function validateMinLength(value, min) {
  return value && value.length >= min;
}

function validateMaxLength(value, max) {
  return value && value.length <= max;
}

function validateNumber(value, min, max) {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

module.exports = {
  validateEmail,
  validateURL,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumber
};

