/**
 * Validation Tests
 * Testing input validation utilities
 */

const {
  validateEmail,
  validatePassword,
  validateRequired,
  validateLength
} = require('../../utils/validation');

describe('Validation Utilities Tests', () => {
  describe('Email Validation', () => {
    test('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email@domain.co.uk')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('should accept passwords with at least 8 characters', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('password')).toBe(true);
    });

    test('should reject passwords shorter than 8 characters or non strings', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });
  });

  describe('Required Field Validation', () => {
    test('should validate when all required fields are present', () => {
      const result = validateRequired(['field', 'count'], {
        field: 'value',
        count: 1
      });

      expect(result).toEqual({ isValid: true, missing: [] });
    });

    test('should list missing required fields', () => {
      const result = validateRequired(['field', 'other'], {
        field: '',
        other: null
      });

      expect(result.isValid).toBe(false);
      expect(result.missing).toEqual(['field', 'other']);
    });
  });

  describe('Length Validation', () => {
    test('should validate string lengths within range', () => {
      expect(validateLength('Label', 'text', 1, 10)).toEqual({ isValid: true });
      expect(validateLength('Label', 'longer text', 5, 15)).toEqual({ isValid: true });
    });

    test('should reject invalid lengths and provide messages', () => {
      expect(validateLength('Label', '', 1, 5)).toEqual({ isValid: false, message: 'Label is required' });
      expect(validateLength('Label', 'short', 10, 20)).toEqual({ isValid: false, message: 'Label must be at least 10 characters' });
      expect(validateLength('Label', 'this is too long', 1, 5)).toEqual({ isValid: false, message: 'Label must be at most 5 characters' });
    });
  });

});

