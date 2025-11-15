/**
 * Frontend Unit Tests: Profile Mapper (Section 5.1)
 *
 * Tests for profile → portfolio mapping logic
 */

import { mapProfileToPortfolio } from '../profile-mapper';

describe('Profile Mapper', () => {
  describe('mapProfileToPortfolio', () => {
    it('should map complete profile to portfolio', () => {
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        location: 'San Francisco, CA',
        title: 'Software Engineer',
        summary: 'Experienced developer',
        website: 'https://johndoe.com',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        twitter: 'https://twitter.com/johndoe',
        skills: ['JavaScript', 'TypeScript', 'React'],
        experience: [
          {
            company: 'Tech Corp',
            position: 'Senior Engineer',
            startDate: '2020-01',
            endDate: '2023-01',
            description: 'Built web apps',
            current: false,
          },
        ],
        education: [
          {
            institution: 'University',
            degree: 'BS Computer Science',
            startDate: '2015-09',
            endDate: '2019-05',
            description: 'Studied CS',
          },
        ],
        projects: [
          {
            name: 'Cool Project',
            description: 'A cool project',
            url: 'https://project.com',
            technologies: ['React', 'Node.js'],
          },
        ],
      };

      const result = mapProfileToPortfolio(profile);

      expect(result.title).toBe('John Doe');
      expect(result.subtitle).toBe('Software Engineer');
      expect(result.description).toBe('Experienced developer');
      expect(result.sections).toHaveLength(5); // hero, about, skills, experience, projects
      expect(result.socialLinks).toEqual({
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        twitter: 'https://twitter.com/johndoe',
        website: 'https://johndoe.com',
      });
    });

    it('should handle missing optional fields', () => {
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const result = mapProfileToPortfolio(profile);

      expect(result.title).toBe('Jane Smith');
      expect(result.subtitle).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect(result.sections).toBeDefined();
      expect(result.socialLinks).toEqual({});
    });

    it('should handle null values', () => {
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'Test',
        lastName: 'User',
        email: null,
        phone: null,
        location: null,
        title: null,
        summary: null,
        website: null,
        linkedin: null,
        github: null,
        twitter: null,
        skills: null,
        experience: null,
        education: null,
        projects: null,
      };

      const result = mapProfileToPortfolio(profile);

      expect(result.title).toBe('Test User');
      expect(result.sections).toBeDefined();
      expect(result.socialLinks).toEqual({});
    });

    it('should map skills correctly', () => {
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
      };

      const result = mapProfileToPortfolio(profile);

      const skillsSection = result.sections.find((s) => s.type === 'skills');
      expect(skillsSection).toBeDefined();
      expect(skillsSection?.content.skills).toEqual([
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'Python',
      ]);
    });

    it('should map experience with current job', () => {
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        experience: [
          {
            company: 'Current Company',
            position: 'Senior Engineer',
            startDate: '2022-01',
            endDate: null,
            description: 'Current role',
            current: true,
          },
          {
            company: 'Previous Company',
            position: 'Engineer',
            startDate: '2020-01',
            endDate: '2021-12',
            description: 'Previous role',
            current: false,
          },
        ],
      };

      const result = mapProfileToPortfolio(profile);

      const expSection = result.sections.find((s) => s.type === 'experience');
      expect(expSection).toBeDefined();
      expect(expSection?.content.items).toHaveLength(2);
      expect(expSection?.content.items[0].current).toBe(true);
      expect(expSection?.content.items[0].endDate).toBeNull();
    });

    it('should map education with incomplete dates', () => {
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        education: [
          {
            institution: 'University',
            degree: 'BS',
            startDate: '2015',
            endDate: undefined,
            description: null,
          },
        ],
      };

      const result = mapProfileToPortfolio(profile);

      const eduSection = result.sections.find((s) => s.type === 'education');
      expect(eduSection).toBeDefined();
      expect(eduSection?.content.items).toHaveLength(1);
      expect(eduSection?.content.items[0].startDate).toBe('2015');
    });

    it('should map projects with technologies', () => {
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        projects: [
          {
            name: 'Project 1',
            description: 'Description 1',
            url: 'https://project1.com',
            technologies: ['React', 'TypeScript'],
            image: 'https://image.com/1.png',
          },
          {
            name: 'Project 2',
            description: 'Description 2',
            url: null,
            technologies: [],
            image: null,
          },
        ],
      };

      const result = mapProfileToPortfolio(profile);

      const projectsSection = result.sections.find((s) => s.type === 'projects');
      expect(projectsSection).toBeDefined();
      expect(projectsSection?.content.items).toHaveLength(2);
      expect(projectsSection?.content.items[0].technologies).toEqual([
        'React',
        'TypeScript',
      ]);
      expect(projectsSection?.content.items[1].url).toBeNull();
    });

    it('should handle edge case: empty arrays', () => {
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        skills: [],
        experience: [],
        education: [],
        projects: [],
      };

      const result = mapProfileToPortfolio(profile);

      expect(result.sections.find((s) => s.type === 'skills')).toBeUndefined();
      expect(result.sections.find((s) => s.type === 'experience')).toBeUndefined();
      expect(result.sections.find((s) => s.type === 'education')).toBeUndefined();
      expect(result.sections.find((s) => s.type === 'projects')).toBeUndefined();
    });

    it('should sanitize HTML in descriptions', () => {
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        summary: '<script>alert("xss")</script>Clean summary',
        experience: [
          {
            company: 'Company',
            position: 'Role',
            startDate: '2020',
            endDate: '2021',
            description: '<img src=x onerror=alert(1)>Description',
            current: false,
          },
        ],
      };

      const result = mapProfileToPortfolio(profile);

      expect(result.description).not.toContain('<script>');
      const expSection = result.sections.find((s) => s.type === 'experience');
      expect(expSection?.content.items[0].description).not.toContain('<img');
    });

    it('should preserve valid URLs', () => {
      const profile = {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        website: 'https://example.com',
        linkedin: 'https://linkedin.com/in/test',
        github: 'https://github.com/test',
      };

      const result = mapProfileToPortfolio(profile);

      expect(result.socialLinks.website).toBe('https://example.com');
      expect(result.socialLinks.linkedin).toBe('https://linkedin.com/in/test');
      expect(result.socialLinks.github).toBe('https://github.com/test');
    });
  });
});
