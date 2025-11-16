/**
 * Unit Tests for Validation Utilities
 */

import {
  validateEmail,
  validatePhone,
  validateURL,
  validateResumeData,
  validateContactInfo,
  validateExperience,
  validateEducation,
  validateSkills
} from '../validation';

describe('Validation Utilities', () => {
  // ============================================================================
  // EMAIL VALIDATION TESTS
  // ============================================================================

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@company.co.uk',
        'test+tag@domain.com',
        'user123@test-domain.com',
        'a@b.co'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
        'user@domain',
        '',
        'user@@example.com'
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
      expect(validateEmail('   ')).toBe(false);
    });
  });

  // ============================================================================
  // PHONE VALIDATION TESTS
  // ============================================================================

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = [
        '555-0100',
        '(555) 555-0100',
        '+1 555 555 0100',
        '555.555.0100',
        '5555550100',
        '+44 20 7123 4567'
      ];

      validPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        'abc-defg',
        '555-555',
        '',
        '++1234567890'
      ];

      invalidPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(false);
      });
    });

    it('should handle optional phone numbers', () => {
      expect(validatePhone('', true)).toBe(true);
      expect(validatePhone(null as any, true)).toBe(true);
      expect(validatePhone(undefined as any, true)).toBe(true);
    });
  });

  // ============================================================================
  // URL VALIDATION TESTS
  // ============================================================================

  describe('validateURL', () => {
    it('should validate correct URLs', () => {
      const validURLs = [
        'https://example.com',
        'http://www.example.com',
        'https://example.com/path',
        'https://example.com/path?query=value',
        'https://subdomain.example.com',
        'https://example.com:8080'
      ];

      validURLs.forEach(url => {
        expect(validateURL(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidURLs = [
        'not-a-url',
        'example.com',
        'ftp://example.com',
        'javascript:alert(1)',
        '',
        '//example.com'
      ];

      invalidURLs.forEach(url => {
        expect(validateURL(url)).toBe(false);
      });
    });

    it('should handle optional URLs', () => {
      expect(validateURL('', true)).toBe(true);
      expect(validateURL(null as any, true)).toBe(true);
      expect(validateURL(undefined as any, true)).toBe(true);
    });
  });

  // ============================================================================
  // CONTACT INFO VALIDATION TESTS
  // ============================================================================

  describe('validateContactInfo', () => {
    it('should validate complete contact info', () => {
      const validContact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0100',
        location: 'New York, NY',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe'
      };

      const result = validateContactInfo(validContact);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should require name and email', () => {
      const invalidContact = {
        name: '',
        email: '',
        phone: '555-0100'
      };

      const result = validateContactInfo(invalidContact);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
    });

    it('should validate email format', () => {
      const invalidContact = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '555-0100'
      };

      const result = validateContactInfo(invalidContact);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain('valid email');
    });

    it('should validate optional fields', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
        linkedin: 'not-a-url'
      };

      const result = validateContactInfo(contact);
      expect(result.isValid).toBe(false);
      expect(result.errors.linkedin).toBeDefined();
    });
  });

  // ============================================================================
  // EXPERIENCE VALIDATION TESTS
  // ============================================================================

  describe('validateExperience', () => {
    it('should validate complete experience entry', () => {
      const validExperience = {
        company: 'Tech Corp',
        role: 'Software Engineer',
        startDate: '2020-01',
        endDate: '2023-12',
        location: 'San Francisco, CA',
        bullets: [
          'Developed features',
          'Improved performance'
        ]
      };

      const result = validateExperience(validExperience);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should require company and role', () => {
      const invalidExperience = {
        company: '',
        role: '',
        startDate: '2020-01'
      };

      const result = validateExperience(invalidExperience);
      expect(result.isValid).toBe(false);
      expect(result.errors.company).toBeDefined();
      expect(result.errors.role).toBeDefined();
    });

    it('should validate date order', () => {
      const invalidExperience = {
        company: 'Tech Corp',
        role: 'Engineer',
        startDate: '2023-01',
        endDate: '2020-01'
      };

      const result = validateExperience(invalidExperience);
      expect(result.isValid).toBe(false);
      expect(result.errors.endDate).toContain('after start date');
    });

    it('should allow current position (no end date)', () => {
      const currentPosition = {
        company: 'Tech Corp',
        role: 'Engineer',
        startDate: '2020-01',
        endDate: ''
      };

      const result = validateExperience(currentPosition);
      expect(result.isValid).toBe(true);
    });

    it('should validate bullets array', () => {
      const experienceWithInvalidBullets = {
        company: 'Tech Corp',
        role: 'Engineer',
        startDate: '2020-01',
        bullets: ['', '   ', 'Valid bullet']
      };

      const result = validateExperience(experienceWithInvalidBullets);
      expect(result.isValid).toBe(false);
      expect(result.errors.bullets).toContain('empty');
    });
  });

  // ============================================================================
  // EDUCATION VALIDATION TESTS
  // ============================================================================

  describe('validateEducation', () => {
    it('should validate complete education entry', () => {
      const validEducation = {
        institution: 'University of Example',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2016-09',
        endDate: '2020-05',
        gpa: '3.8'
      };

      const result = validateEducation(validEducation);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should require institution and degree', () => {
      const invalidEducation = {
        institution: '',
        degree: '',
        field: 'Computer Science'
      };

      const result = validateEducation(invalidEducation);
      expect(result.isValid).toBe(false);
      expect(result.errors.institution).toBeDefined();
      expect(result.errors.degree).toBeDefined();
    });

    it('should validate GPA format', () => {
      const invalidGPA = {
        institution: 'University',
        degree: 'BS',
        field: 'CS',
        gpa: '5.0' // Invalid: > 4.0
      };

      const result = validateEducation(invalidGPA);
      expect(result.isValid).toBe(false);
      expect(result.errors.gpa).toContain('0.0 and 4.0');
    });

    it('should allow current student (no end date)', () => {
      const currentStudent = {
        institution: 'University',
        degree: 'BS',
        field: 'CS',
        startDate: '2020-09',
        endDate: ''
      };

      const result = validateEducation(currentStudent);
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================================================
  // SKILLS VALIDATION TESTS
  // ============================================================================

  describe('validateSkills', () => {
    it('should validate skills object', () => {
      const validSkills = {
        technical: ['JavaScript', 'Python', 'React'],
        tools: ['Git', 'Docker'],
        soft: ['Communication', 'Leadership']
      };

      const result = validateSkills(validSkills);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should require at least one skill category', () => {
      const emptySkills = {
        technical: [],
        tools: [],
        soft: []
      };

      const result = validateSkills(emptySkills);
      expect(result.isValid).toBe(false);
      expect(result.errors.skills).toContain('at least one skill');
    });

    it('should filter out empty strings', () => {
      const skillsWithEmpty = {
        technical: ['JavaScript', '', '   ', 'Python'],
        tools: []
      };

      const result = validateSkills(skillsWithEmpty);
      expect(result.isValid).toBe(true);
      // Should only count non-empty skills
    });
  });

  // ============================================================================
  // RESUME DATA VALIDATION TESTS
  // ============================================================================

  describe('validateResumeData', () => {
    it('should validate complete resume data', () => {
      const validResume = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-0100'
        },
        summary: 'Experienced software engineer',
        experience: [
          {
            company: 'Tech Corp',
            role: 'Engineer',
            startDate: '2020-01',
            endDate: '2023-12',
            bullets: ['Developed features']
          }
        ],
        education: [
          {
            institution: 'University',
            degree: 'BS',
            field: 'CS',
            startDate: '2016-09',
            endDate: '2020-05'
          }
        ],
        skills: {
          technical: ['JavaScript', 'Python']
        }
      };

      const result = validateResumeData(validResume);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate all sections', () => {
      const invalidResume = {
        contact: {
          name: '',
          email: 'invalid-email'
        },
        summary: '',
        experience: [],
        education: [],
        skills: {
          technical: []
        }
      };

      const result = validateResumeData(invalidResume);
      expect(result.isValid).toBe(false);
      expect(result.errors.contact).toBeDefined();
      expect(result.errors.summary).toBeDefined();
    });

    it('should handle special characters in text fields', () => {
      const resumeWithSpecialChars = {
        contact: {
          name: "John O'Doe",
          email: 'john+test@example.com'
        },
        summary: 'Expert in C++ & Python (5+ years)',
        skills: {
          technical: ['C++', 'C#', 'Node.js']
        }
      };

      const result = validateResumeData(resumeWithSpecialChars);
      expect(result.isValid).toBe(true);
    });

    it('should enforce maximum lengths', () => {
      const resumeWithLongText = {
        contact: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        summary: 'A'.repeat(2000), // Assuming max is 1000
        skills: {
          technical: ['JavaScript']
        }
      };

      const result = validateResumeData(resumeWithLongText);
      expect(result.isValid).toBe(false);
      expect(result.errors.summary).toContain('too long');
    });
  });
});
