/**
 * Data sanitization utilities for profile data
 * @module components/profile/utils/dataSanitizer
 */

import type { Skill, Education, WorkExperience } from '../types/profile';
import { normalizeToArray } from './dataNormalizer';

export { normalizeToArray };

type Language = { name: string; proficiency: string };

/**
 * Valid work experience types
 */
export const VALID_WORK_EXPERIENCE_TYPES = [
  'Client Project',
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Consulting',
  'Internship'
] as const;

/**
 * Sanitize work experiences array
 * @param {any} experiences - Work experiences to sanitize
 * @param {Object} [options] - Sanitization options
 * @param {boolean} [options.keepDrafts=true] - Whether to keep draft entries
 * @returns {WorkExperience[]} Sanitized work experiences
 */
export function sanitizeWorkExperiences(experiences: any, options?: { keepDrafts?: boolean }): WorkExperience[] {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(experiences);

  return (normalizedArray as any[])
    .map((exp) => {
      if (!exp || typeof exp !== 'object') {
        return null;
      }

      const id = exp.id || exp._id || null;
      const company = typeof exp.company === 'string' ? exp.company.trim() : '';
      const role = typeof exp.role === 'string' ? exp.role.trim() : '';
      const location = typeof exp.location === 'string' ? exp.location.trim() : null;
      const startDate = typeof exp.startDate === 'string' ? exp.startDate.trim() : '';
      const endDate = typeof exp.endDate === 'string' ? exp.endDate.trim() : null;
      const isCurrent = Boolean(exp.isCurrent);
      const description = typeof exp.description === 'string' ? exp.description.trim() : null;

      // Normalize projectType
      let normalizedProjectType: WorkExperience['projectType'] = 'Full-time';
      if (exp.projectType && VALID_WORK_EXPERIENCE_TYPES.includes(exp.projectType as any)) {
        normalizedProjectType = exp.projectType as WorkExperience['projectType'];
      }

      // Handle technologies - normalize to array
      let technologies: string[] = [];
      if (exp.technologies) {
        if (Array.isArray(exp.technologies)) {
          technologies = exp.technologies
            .map((t: any) => {
              if (typeof t === 'string') {
                return t.trim();
              }
              return String(t || '').trim();
            })
            .filter((t: string) => t.length > 0);
        } else if (typeof exp.technologies === 'string') {
          // Handle comma-separated string
          technologies = exp.technologies
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0);
        } else if (typeof exp.technologies === 'object') {
          // Handle object with numeric keys
          technologies = Object.keys(exp.technologies)
            .sort((a, b) => {
              const aNum = Number(a);
              const bNum = Number(b);
              if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
                return aNum - bNum;
              }
              return a.localeCompare(b);
            })
            .map(key => exp.technologies[key])
            .filter(value => value !== undefined && value !== null)
            .map(value => (typeof value === 'string' ? value.trim() : String(value || '').trim()))
            .filter(value => value.length > 0 && value !== 'null' && value !== 'undefined');
        }
      }

      const sanitized = {
        ...(id ? { id } : {}),
        company,
        role,
        location,
        startDate,
        endDate: isCurrent ? '' : endDate,
        isCurrent,
        description,
        technologies,
        projectType: normalizedProjectType,
      };

      const hasContent =
        !!sanitized.isCurrent ||
        [sanitized.company, sanitized.role, sanitized.location, sanitized.startDate, sanitized.endDate, description].some(
          (field) => typeof field === 'string' && field.trim().length > 0
        );

      if (!hasContent) {
        if (keepDrafts && (id || exp?.__keepDraft)) {
          return sanitized;
        }
        return null;
      }

      return sanitized;
    })
    .filter(Boolean) as WorkExperience[];
}

/**
 * Sanitize skills array
 * @param {any} skills - Skills to sanitize
 * @param {Object} [options] - Sanitization options
 * @param {boolean} [options.keepDrafts=true] - Whether to keep draft entries
 * @returns {Skill[]} Sanitized skills
 */
export function sanitizeSkills(skills: any, options?: { keepDrafts?: boolean }): Skill[] {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(skills);
  const seen = new Set<string>();

  const sanitized: Skill[] = [];
  
  normalizedArray.forEach((skill, index) => {
    if (!skill) {
      if (keepDrafts) {
        sanitized.push({
          name: '',
          yearsOfExperience: undefined,
          verified: false,
        });
      }
      return;
    }

    let rawName = '';
    if (typeof skill === 'string') {
      rawName = skill.trim();
    } else if (skill && typeof skill === 'object') {
      rawName = String(skill.name || skill.skill || '').trim();
    }

    const trimmedName = rawName.trim();
    if (!trimmedName) {
      if (keepDrafts) {
        sanitized.push({
          name: rawName,
          yearsOfExperience: undefined,
          verified: Boolean(skill?.verified),
        });
      }
      return;
    }

    const key = trimmedName.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    let yearsOfExperience: number | undefined;
    if (skill?.yearsOfExperience !== undefined && skill?.yearsOfExperience !== null && skill?.yearsOfExperience !== '') {
      const parsedYears = Number(skill.yearsOfExperience);
      if (Number.isFinite(parsedYears)) {
        yearsOfExperience = parsedYears;
      }
    }

    sanitized.push({
      name: keepDrafts ? rawName : trimmedName,
      yearsOfExperience,
      verified: Boolean(skill?.verified),
    });
  });

  if (!keepDrafts) {
    return sanitized.map((skill) => ({
      name: skill.name.trim(),
      yearsOfExperience: skill.yearsOfExperience,
      verified: skill.verified,
    }));
  }

  return sanitized;
}

/**
 * Sanitize languages array
 * @param {any} languages - Languages to sanitize
 * @param {Object} [options] - Sanitization options
 * @param {boolean} [options.keepDrafts=true] - Whether to keep draft entries
 * @returns {Language[]} Sanitized languages
 */
export function sanitizeLanguages(languages: any, options?: { keepDrafts?: boolean }): Language[] {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(languages);
  const seen = new Set<string>();

  const toStringSafe = (value: any): string => {
    if (value === null || value === undefined) return '';
    return typeof value === 'string' ? value : String(value);
  };

  return (normalizedArray as any[])
    .map((lang, index) => {
      if (!lang) {
        if (keepDrafts) {
          return { name: '', proficiency: 'Native' } as Language;
        }
        return null;
      }

      if (typeof lang === 'string') {
        const raw = toStringSafe(lang);
        const key = raw.trim().toLowerCase();

        if (!key) {
          if (keepDrafts) {
            return { name: raw, proficiency: 'Native' } as Language;
          }
          return null;
        }

        if (seen.has(key)) {
          return null;
        }
        seen.add(key);

        return {
          name: keepDrafts ? raw : raw.trim(),
          proficiency: 'Native',
        } as Language;
      }

      if (typeof lang === 'object') {
        const name = toStringSafe(lang.name || lang.language || '');
        const proficiency = toStringSafe(lang.proficiency || lang.level || 'Native');
        const key = name.trim().toLowerCase();

        if (!key) {
          if (keepDrafts) {
            return { name, proficiency: proficiency || 'Native' } as Language;
          }
          return null;
        }

        if (seen.has(key)) {
          return null;
        }
        seen.add(key);

        return {
          name: keepDrafts ? name : name.trim(),
          proficiency: proficiency || 'Native',
        } as Language;
      }

      return null;
    })
    .filter(Boolean) as Language[];
}

/**
 * Sanitize education array
 * @param {any} education - Education entries to sanitize
 * @param {Object} [options] - Sanitization options
 * @param {boolean} [options.keepDrafts=true] - Whether to keep draft entries
 * @returns {Education[]} Sanitized education entries
 */
export function sanitizeEducation(education: any, options?: { keepDrafts?: boolean }): Education[] {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(education);

  return (normalizedArray as any[])
    .map((edu) => {
      if (!edu || typeof edu !== 'object') {
        if (keepDrafts) {
          return {
            id: undefined,
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            gpa: '',
            honors: '',
            location: '',
            description: '',
          } as Education;
        }
        return null;
      }

      const id = edu.id || edu._id || undefined;
      const institution = typeof edu.institution === 'string' ? edu.institution.trim() : '';
      const degree = typeof edu.degree === 'string' ? edu.degree.trim() : '';
      const field = typeof edu.field === 'string' ? edu.field.trim() : '';
      const startDate = typeof edu.startDate === 'string' ? edu.startDate.trim() : '';
      const endDate = typeof edu.endDate === 'string' ? edu.endDate.trim() : '';
      const gpa = typeof edu.gpa === 'string' ? edu.gpa.trim() : '';
      const honors = typeof edu.honors === 'string' ? edu.honors.trim() : '';
      const location = typeof edu.location === 'string' ? edu.location.trim() : '';
      const description = typeof edu.description === 'string' ? edu.description.trim() : '';

      const hasContent = [institution, degree, field, startDate, endDate].some(
        (field) => typeof field === 'string' && field.trim().length > 0
      );

      if (!hasContent) {
        if (keepDrafts && (id || edu?.__keepDraft)) {
          return {
            ...(id ? { id } : {}),
            institution,
            degree,
            field,
            startDate,
            endDate,
            gpa,
            honors,
            location,
            description,
          } as Education;
        }
        return null;
      }

      return {
        ...(id ? { id } : {}),
        institution,
        degree,
        field,
        startDate,
        endDate,
        gpa,
        honors,
        location,
        description,
      } as Education;
    })
    .filter(Boolean) as Education[];
}

/**
 * Sanitize certifications array
 * @param {any} certifications - Certifications to sanitize
 * @param {Object} [options] - Sanitization options
 * @param {boolean} [options.keepDrafts=true] - Whether to keep draft entries
 * @returns {any[]} Sanitized certifications
 */
export function sanitizeCertifications(certifications: any, options?: { keepDrafts?: boolean }): any[] {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(certifications);

  return (normalizedArray as any[])
    .map((cert) => {
      if (!cert || typeof cert !== 'object') {
        if (keepDrafts) {
          return {
            id: undefined,
            name: '',
            issuer: '',
            date: '',
            expiryDate: '',
            credentialUrl: ''
          };
        }
        return null;
      }

      const id = cert.id || cert._id || undefined;
      const name = typeof cert.name === 'string' ? cert.name.trim() : '';
      const issuer = typeof cert.issuer === 'string' ? cert.issuer.trim() : '';
      const date = typeof cert.date === 'string' ? cert.date.trim() : '';
      const expiryDate = typeof cert.expiryDate === 'string' ? cert.expiryDate.trim() : '';
      const credentialUrl = typeof cert.credentialUrl === 'string' ? cert.credentialUrl.trim() : '';

      const hasContent = [name, issuer, date].some(
        (field) => typeof field === 'string' && field.trim().length > 0
      );

      if (!hasContent) {
        if (keepDrafts && (id || cert?.__keepDraft)) {
          return {
            ...(id ? { id } : {}),
            name,
            issuer,
            date,
            expiryDate,
            credentialUrl
          };
        }
        return null;
      }

      return {
        ...(id ? { id } : {}),
        name,
        issuer,
        date,
        expiryDate,
        credentialUrl
      };
    })
    .filter(Boolean);
}

/**
 * Sanitize projects array
 * @param {any} projects - Projects to sanitize
 * @param {Object} [options] - Sanitization options
 * @param {boolean} [options.keepDrafts=true] - Whether to keep draft entries
 * @returns {any[]} Sanitized projects
 */
export function sanitizeProjects(projects: any, options?: { keepDrafts?: boolean }): any[] {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(projects);

  return (normalizedArray as any[])
    .map((proj) => {
      if (!proj || typeof proj !== 'object') {
        if (keepDrafts) {
          return {
            id: undefined,
            title: '',
            description: '',
            technologies: [],
            date: '',
            link: '',
            github: ''
          };
        }
        return null;
      }

      const id = proj.id || proj._id || undefined;
      const title = typeof proj.title === 'string' ? proj.title.trim() : '';
      const description = typeof proj.description === 'string' ? proj.description.trim() : '';
      const date = typeof proj.date === 'string' ? proj.date.trim() : '';
      const link = typeof proj.link === 'string' ? proj.link.trim() : '';
      const github = typeof proj.github === 'string' ? proj.github.trim() : '';

      // Handle technologies
      let technologies: string[] = [];
      if (proj.technologies) {
        if (Array.isArray(proj.technologies)) {
          technologies = proj.technologies
            .map((t: any) => (typeof t === 'string' ? t.trim() : String(t || '').trim()))
            .filter((t: string) => t.length > 0);
        } else if (typeof proj.technologies === 'string') {
          technologies = proj.technologies
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0);
        }
      }

      const hasContent = [title, description].some(
        (field) => typeof field === 'string' && field.trim().length > 0
      );

      if (!hasContent) {
        if (keepDrafts && (id || proj?.__keepDraft)) {
          return {
            ...(id ? { id } : {}),
            title,
            description,
            technologies,
            date,
            link,
            github
          };
        }
        return null;
      }

      return {
        ...(id ? { id } : {}),
        title,
        description,
        technologies,
        date,
        link,
        github
      };
    })
    .filter(Boolean);
}

