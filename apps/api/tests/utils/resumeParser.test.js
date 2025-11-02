/**
 * Tests for resumeParser utilities
 */

describe('resumeParser', () => {
  const sampleResume = `
John Quincy Developer
San Francisco, CA
Email: john.developer@example.com
Phone: (555) 123-4567

SUMMARY
Full-stack engineer with 8 years of experience building SaaS products.

EXPERIENCE
RoleReady Inc. Senior Software Engineer Jan 2020 - Present

SKILLS
JavaScript, React, Node.js, Postgres

EDUCATION
State University B.S. Computer Science 2010 - 2014

CERTIFICATIONS
AWS Certified Solutions Architect - 2022

PROJECTS
Portfolio Platform

linkedin.com/in/johnqdev
github.com/johnqdev
`;

  afterEach(() => {
    jest.resetModules();
    delete process.env.OPENAI_API_KEY;
  });

  it('parses resume text using regex fallback when OpenAI is not configured', async () => {
    delete process.env.OPENAI_API_KEY;
    const { parseResumeText } = require('../../utils/resumeParser');

    const parsed = await parseResumeText(sampleResume);

    expect(parsed.personalInfo.firstName).toBe('John');
    expect(parsed.personalInfo.lastName).toBe('Quincy Developer');
    expect(parsed.personalInfo.email).toBe('john.developer@example.com');
    expect(parsed.personalInfo.phone).toContain('555');
    expect(parsed.professionalSummary).toContain('Full-stack engineer');
    expect(parsed.skills).toEqual(expect.arrayContaining(['JavaScript', 'React']));
    expect(parsed.experience[0]).toEqual(
      expect.objectContaining({
        company: 'RoleReady Inc.',
        position: 'Senior Software Engineer',
        startDate: '2020-01',
        isCurrent: true
      })
    );
    expect(parsed.education[0]).toEqual(
      expect.objectContaining({
        school: expect.stringContaining('State University'),
        startDate: '2010',
        endDate: '2014'
      })
    );
  });

  it('normalizes regex output into consistent structure', () => {
    const { parseWithRegex } = require('../../utils/resumeParser');
    const parsed = parseWithRegex(sampleResume);

    expect(parsed.personalInfo).toEqual(
      expect.objectContaining({
        firstName: 'John',
        lastName: 'Quincy Developer',
        email: 'john.developer@example.com'
      })
    );
    expect(Array.isArray(parsed.skills)).toBe(true);
    expect(Array.isArray(parsed.experience)).toBe(true);
    expect(parsed.experience[0]).toEqual(
      expect.objectContaining({
        company: 'RoleReady Inc.',
        position: 'Senior Software Engineer'
      })
    );
    expect(parsed.experience[0].period).toContain('2020');
    expect(Array.isArray(parsed.education)).toBe(true);
    expect(parsed.links.linkedin).toBe('https://linkedin.com/in/johnqdev');
    expect(parsed.links.github).toBe('https://github.com/johnqdev');
  });
});


