/**
 * Validation Tests
 * Testing input validation utilities
 */

const {
  validateEmail,
  validatePassword,
  validateRequired,
  validateLength,
  validateResumeData,
  validateJobApplication
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
    test('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('SecurePassword456@')).toBe(true);
    });

    test('should reject weak passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('onlylowercaseletters')).toBe(false);
    });
  });

  describe('Required Field Validation', () => {
    test('should validate required fields', () => {
      expect(validateRequired('field', 'value')).toBe(true);
      expect(validateRequired('field', 0)).toBe(true);
    });

    test('should reject empty required fields', () => {
      expect(validateRequired('field', '')).toBe(false);
      expect(validateRequired('field', null)).toBe(false);
      expect(validateRequired('field', undefined)).toBe(false);
    });
  });

  describe('Length Validation', () => {
    test('should validate string length', () => {
      expect(validateLength('test', 4, 4)).toBe(true);
      expect(validateLength('longer text', 5, 15)).toBe(true);
    });

    test('should reject invalid lengths', () => {
      expect(validateLength('short', 10, 20)).toBe(false);
      expect(validateLength('this is too long', 1, 5)).toBe(false);
    });
  });

  describe('Resume Data Validation', () => {
    test('should validate complete resume data', () => {
      const resumeData = {
        name: 'Test Resume',
        sections: []
      };

      expect(validateResumeData(resumeData).isValid).toBe(true);
    });

    test('should reject incomplete resume data', () => {
      const resumeData = {};
      const validation = validateResumeData(resumeData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toBeDefined();
    });
  });

  describe('Job Application Validation', () => {
    test('should validate complete job application', () => {
      const jobData = {
        title: 'Software Engineer',
        company: 'Test Company',
        location: 'Remote',
        status: 'applied'
      };

      expect(validateJobApplication(jobData).isValid).toBe(true);
    });

    test('should reject incomplete job application', () => {
      const jobData = {
        title: 'Software Engineer'
        // Missing required fields
      };

      const validation = validateJobApplication(jobData);
      expect(validation.isValid).toBe(false);
    });
  });
});

