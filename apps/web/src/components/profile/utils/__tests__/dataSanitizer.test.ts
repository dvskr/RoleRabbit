/**
 * Unit tests for dataSanitizer utilities
 */

import {
  sanitizeWorkExperiences,
  sanitizeSkills,
  sanitizeLanguages,
  sanitizeEducation,
  sanitizeCertifications,
  sanitizeProjects,
  VALID_WORK_EXPERIENCE_TYPES
} from '../dataSanitizer';
import type { Skill, Education } from '../../types/profile';

describe('sanitizeWorkExperiences', () => {
  it('should handle empty input', () => {
    expect(sanitizeWorkExperiences(null)).toEqual([]);
    expect(sanitizeWorkExperiences(undefined)).toEqual([]);
    expect(sanitizeWorkExperiences([])).toEqual([]);
  });

  it('should normalize array input', () => {
    const input = [
      {
        company: 'Test Company',
        role: 'Developer',
        startDate: '2020-01',
        endDate: '2021-01',
        isCurrent: false
      }
    ];
    const result = sanitizeWorkExperiences(input);
    expect(result).toHaveLength(1);
    expect(result[0].company).toBe('Test Company');
    expect(result[0].role).toBe('Developer');
  });

  it('should trim string values', () => {
    const input = [{
      company: '  Test Company  ',
      role: '  Developer  ',
      startDate: '2020-01'
    }];
    const result = sanitizeWorkExperiences(input, { keepDrafts: false });
    expect(result[0].company).toBe('Test Company');
    expect(result[0].role).toBe('Developer');
  });

  it('should handle isCurrent flag', () => {
    const input = [{
      company: 'Test Company',
      role: 'Developer',
      startDate: '2020-01',
      isCurrent: true
    }];
    const result = sanitizeWorkExperiences(input);
    expect(result[0].isCurrent).toBe(true);
    expect(result[0].endDate).toBe('');
  });

  it('should normalize projectType to valid type', () => {
    const input = [{
      company: 'Test Company',
      role: 'Developer',
      startDate: '2020-01',
      projectType: 'full-time'
    }];
    const result = sanitizeWorkExperiences(input);
    expect(result[0].projectType).toBe('Full-time');
  });

  it('should handle technologies array', () => {
    const input = [{
      company: 'Test Company',
      role: 'Developer',
      startDate: '2020-01',
      technologies: ['React', 'TypeScript', 'Node.js']
    }];
    const result = sanitizeWorkExperiences(input);
    expect(result[0].technologies).toEqual(['React', 'TypeScript', 'Node.js']);
  });

  it('should filter out experiences without content when keepDrafts is false', () => {
    const input = [{
      company: '',
      role: '',
      startDate: ''
    }];
    const result = sanitizeWorkExperiences(input, { keepDrafts: false });
    expect(result).toHaveLength(0);
  });
});

describe('sanitizeSkills', () => {
  it('should handle empty input', () => {
    expect(sanitizeSkills(null)).toEqual([]);
    expect(sanitizeSkills(undefined)).toEqual([]);
    expect(sanitizeSkills([])).toEqual([]);
  });

  it('should normalize string array to Skill objects', () => {
    const input = ['React', 'TypeScript', 'Node.js'];
    const result = sanitizeSkills(input);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('React');
    expect(result[1].name).toBe('TypeScript');
  });

  it('should remove duplicates (case-insensitive)', () => {
    const input = ['React', 'react', 'REACT', 'TypeScript'];
    const result = sanitizeSkills(input, { keepDrafts: false });
    expect(result).toHaveLength(2);
  });

  it('should handle Skill objects with yearsOfExperience', () => {
    const input: Skill[] = [
      { name: 'React', yearsOfExperience: 3 },
      { name: 'TypeScript', yearsOfExperience: 2 }
    ];
    const result = sanitizeSkills(input);
    expect(result[0].yearsOfExperience).toBe(3);
    expect(result[1].yearsOfExperience).toBe(2);
  });

  it('should preserve verified flag', () => {
    const input: Skill[] = [
      { name: 'React', verified: true },
      { name: 'TypeScript', verified: false }
    ];
    const result = sanitizeSkills(input);
    expect(result[0].verified).toBe(true);
    expect(result[1].verified).toBe(false);
  });
});

describe('sanitizeLanguages', () => {
  it('should handle empty input', () => {
    expect(sanitizeLanguages(null)).toEqual([]);
    expect(sanitizeLanguages(undefined)).toEqual([]);
    expect(sanitizeLanguages([])).toEqual([]);
  });

  it('should normalize string array to Language objects', () => {
    const input = ['English', 'Spanish', 'French'];
    const result = sanitizeLanguages(input);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('English');
    expect(result[0].proficiency).toBe('Native');
  });

  it('should handle Language objects with proficiency', () => {
    const input = [
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: 'Fluent' }
    ];
    const result = sanitizeLanguages(input);
    expect(result[0].proficiency).toBe('Native');
    expect(result[1].proficiency).toBe('Fluent');
  });

  it('should remove duplicates (case-insensitive)', () => {
    const input = ['English', 'english', 'ENGLISH'];
    const result = sanitizeLanguages(input, { keepDrafts: false });
    expect(result).toHaveLength(1);
  });
});

describe('sanitizeEducation', () => {
  it('should handle empty input', () => {
    expect(sanitizeEducation(null)).toEqual([]);
    expect(sanitizeEducation(undefined)).toEqual([]);
    expect(sanitizeEducation([])).toEqual([]);
  });

  it('should normalize Education objects', () => {
    const input: Education[] = [
      {
        institution: 'Test University',
        degree: 'Bachelor',
        field: 'Computer Science',
        startDate: '2016',
        endDate: '2020'
      }
    ];
    const result = sanitizeEducation(input);
    expect(result).toHaveLength(1);
    expect(result[0].institution).toBe('Test University');
    expect(result[0].degree).toBe('Bachelor');
  });

  it('should trim string values when keepDrafts is false', () => {
    const input: Education[] = [
      {
        institution: '  Test University  ',
        degree: '  Bachelor  '
      }
    ];
    const result = sanitizeEducation(input, { keepDrafts: false });
    expect(result[0].institution).toBe('Test University');
    expect(result[0].degree).toBe('Bachelor');
  });

  it('should preserve id when present', () => {
    const input: Education[] = [
      {
        id: 'edu-123',
        institution: 'Test University',
        degree: 'Bachelor'
      }
    ];
    const result = sanitizeEducation(input);
    expect(result[0].id).toBe('edu-123');
  });
});

describe('sanitizeCertifications', () => {
  it('should handle empty input', () => {
    expect(sanitizeCertifications(null)).toEqual([]);
    expect(sanitizeCertifications(undefined)).toEqual([]);
    expect(sanitizeCertifications([])).toEqual([]);
  });

  it('should normalize Certification objects', () => {
    const input = [
      {
        name: 'AWS Certified',
        issuer: 'Amazon',
        date: '2023-01'
      }
    ];
    const result = sanitizeCertifications(input);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('AWS Certified');
    expect(result[0].issuer).toBe('Amazon');
  });

  it('should trim string values', () => {
    const input = [
      {
        name: '  AWS Certified  ',
        issuer: '  Amazon  '
      }
    ];
    const result = sanitizeCertifications(input, { keepDrafts: false });
    expect(result[0].name).toBe('AWS Certified');
    expect(result[0].issuer).toBe('Amazon');
  });
});

describe('sanitizeProjects', () => {
  it('should handle empty input', () => {
    expect(sanitizeProjects(null)).toEqual([]);
    expect(sanitizeProjects(undefined)).toEqual([]);
    expect(sanitizeProjects([])).toEqual([]);
  });

  it('should normalize Project objects', () => {
    const input = [
      {
        title: 'Test Project',
        description: 'A test project',
        technologies: ['React', 'Node.js'],
        date: '2023-01'
      }
    ];
    const result = sanitizeProjects(input);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test Project');
    expect(result[0].technologies).toEqual(['React', 'Node.js']);
  });

  it('should handle technologies as comma-separated string', () => {
    const input = [
      {
        title: 'Test Project',
        technologies: 'React, Node.js, TypeScript'
      }
    ];
    const result = sanitizeProjects(input);
    expect(result[0].technologies).toEqual(['React', 'Node.js', 'TypeScript']);
  });

  it('should trim technology strings', () => {
    const input = [
      {
        title: 'Test Project',
        technologies: ['  React  ', '  Node.js  ']
      }
    ];
    const result = sanitizeProjects(input, { keepDrafts: false });
    expect(result[0].technologies).toEqual(['React', 'Node.js']);
  });

  it('should filter out empty technologies', () => {
    const input = [
      {
        title: 'Test Project',
        technologies: ['React', '', '  ', 'Node.js']
      }
    ];
    const result = sanitizeProjects(input, { keepDrafts: false });
    expect(result[0].technologies).toEqual(['React', 'Node.js']);
  });
});

describe('VALID_WORK_EXPERIENCE_TYPES', () => {
  it('should contain expected work experience types', () => {
    expect(VALID_WORK_EXPERIENCE_TYPES).toContain('Full-time');
    expect(VALID_WORK_EXPERIENCE_TYPES).toContain('Part-time');
    expect(VALID_WORK_EXPERIENCE_TYPES).toContain('Contract');
    expect(VALID_WORK_EXPERIENCE_TYPES).toContain('Freelance');
    expect(VALID_WORK_EXPERIENCE_TYPES).toContain('Client Project');
  });
});

