/**
 * Resume data manipulation helper functions
 */

import {
  ResumeData,
  SectionVisibility,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertificationItem,
} from '../../../types/resume';
import { logger } from '../../../utils/logger';

export interface DuplicateResumeState {
  resumeFileName: string;
  resumeData: ResumeData;
  customSections: any[];
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
}

/**
 * Remove duplicate entries from resume data
 */
export function removeDuplicateResumeEntries(resumeData: ResumeData): { data: ResumeData; removedCount: number } {
  const cleanedResumeData = { ...resumeData };
  let removedCount = 0;
  
  // Remove duplicate experiences
  if (cleanedResumeData.experience && cleanedResumeData.experience.length > 0) {
    const seen = new Set();
    const unique = cleanedResumeData.experience.filter((exp: any) => {
      const key = `${exp.company}-${exp.position}-${exp.period}`;
      if (seen.has(key)) {
        removedCount++;
        return false;
      }
      seen.add(key);
      return true;
    });
    cleanedResumeData.experience = unique;
  }
  
  // Remove duplicate skills
  if (cleanedResumeData.skills && cleanedResumeData.skills.length > 0) {
    const uniqueSkills = Array.from(new Set(cleanedResumeData.skills));
    removedCount += cleanedResumeData.skills.length - uniqueSkills.length;
    cleanedResumeData.skills = uniqueSkills;
  }
  
  // Remove duplicate education
  if (cleanedResumeData.education && cleanedResumeData.education.length > 0) {
    const seen = new Set();
    const unique = cleanedResumeData.education.filter((edu: any) => {
      const key = `${edu.school}-${edu.degree}`;
      if (seen.has(key)) {
        removedCount++;
        return false;
      }
      seen.add(key);
      return true;
    });
    cleanedResumeData.education = unique;
  }
  
  // Remove duplicate projects
  if (cleanedResumeData.projects && cleanedResumeData.projects.length > 0) {
    const seen = new Set();
    const unique = cleanedResumeData.projects.filter((proj: any) => {
      const key = `${proj.name}-${proj.description}`;
      if (seen.has(key)) {
        removedCount++;
        return false;
      }
      seen.add(key);
      return true;
    });
    cleanedResumeData.projects = unique;
  }
  
  // Remove duplicate certifications
  if (cleanedResumeData.certifications && cleanedResumeData.certifications.length > 0) {
    const seen = new Set();
    const unique = cleanedResumeData.certifications.filter((cert: any) => {
      const key = `${cert.name}-${cert.issuer}`;
      if (seen.has(key)) {
        removedCount++;
        return false;
      }
      seen.add(key);
      return true;
    });
    cleanedResumeData.certifications = unique;
  }
  
  return { data: cleanedResumeData, removedCount };
}

const PLACEHOLDER_VALUES = new Set([
  'your name',
  'your title',
  'your designation',
  'your email',
  'your phone',
  'your location',
  'email',
  'phone',
  'location',
]);

const EMPTY_RESUME: ResumeData = {
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

const sanitizeString = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\s+/g, ' ').trim();
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeString(item)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,•·\-]+/g)
      .map((item) => sanitizeString(item))
      .filter(Boolean);
  }
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((entry) => normalizeStringArray(entry))
      .flat();
  }
  return [];
};

const normalizeArrayField = <T>(value: unknown): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (typeof value === 'object') {
    return Object.values(value as Record<string, T>);
  }
  return [];
};

const coerceNumericId = (value: unknown): number => {
  const num = Number(value);
  if (Number.isFinite(num) && num > 0) {
    return num;
  }
  return Math.floor(Date.now() / 1000 + Math.random() * 1000);
};

const mergeEntryLists = <T extends Record<string, any>>(
  baseList: T[] | undefined,
  tailoredList: T[] | undefined,
  keyFn: (item: T) => string,
  normalizer: (item: Partial<T>) => T
): T[] => {
  const result = new Map<string, T>();

  const baseEntries = normalizeArrayField<T>(baseList);
  const tailoredEntries = normalizeArrayField<T>(tailoredList);

  baseEntries.forEach((item) => {
    const key = keyFn(item);
    if (!result.has(key)) {
      result.set(key, normalizer(item));
    }
  });

  tailoredEntries.forEach((item) => {
    const key = keyFn(item);
    const normalized = normalizer(item);
    if (result.has(key)) {
      result.set(key, {
        ...result.get(key),
        ...normalized,
      });
    } else {
      result.set(key, normalized);
    }
  });

  return Array.from(result.values());
};

const mergeSkills = (baseSkills: unknown, tailoredSkills: unknown): string[] => {
  const combined = [
    ...normalizeStringArray(baseSkills),
    ...normalizeStringArray(tailoredSkills),
  ];

  return Array.from(new Set(combined));
};

const chooseContactValue = (tailored: unknown, base: unknown): string => {
  const tailoredString = sanitizeString(tailored);
  if (tailoredString && !PLACEHOLDER_VALUES.has(tailoredString.toLowerCase())) {
    return tailoredString;
  }
  const baseString = sanitizeString(base);
  return baseString;
};

const experienceKey = (exp: Partial<ExperienceItem>): string => {
  if (exp?.id !== undefined && exp?.id !== null) {
    return `id:${exp.id}`;
  }
  const company = sanitizeString(exp?.company);
  const position = sanitizeString(exp?.position);
  const period = sanitizeString((exp as any)?.period || (exp as any)?.startDate);
  return `company:${company}|position:${position}|period:${period}`;
};

const normalizeExperienceItem = (exp: Partial<ExperienceItem>): ExperienceItem => ({
  id: coerceNumericId(exp?.id),
  company: sanitizeString(exp?.company),
  position: sanitizeString(exp?.position),
  period: sanitizeString(exp?.period),
  endPeriod: sanitizeString(exp?.endPeriod),
  location: sanitizeString(exp?.location),
  bullets: normalizeStringArray(exp?.bullets),
  environment: normalizeStringArray(exp?.environment),
  customFields: Array.isArray(exp?.customFields) ? (exp?.customFields as any[]) : [],
});

const projectKey = (proj: Partial<ProjectItem>): string => {
  if (proj?.id !== undefined && proj?.id !== null) {
    return `id:${proj.id}`;
  }
  const name = sanitizeString(proj?.name);
  const description = sanitizeString(proj?.description);
  return `name:${name}|description:${description}`;
};

const normalizeProjectItem = (proj: Partial<ProjectItem>): ProjectItem => ({
  id: coerceNumericId(proj?.id),
  name: sanitizeString(proj?.name),
  description: sanitizeString(proj?.description),
  link: sanitizeString(proj?.link),
  bullets: normalizeStringArray(proj?.bullets),
  skills: normalizeStringArray(proj?.skills),
  customFields: Array.isArray(proj?.customFields) ? (proj?.customFields as any[]) : [],
});

const educationKey = (edu: Partial<EducationItem>): string => {
  if (edu?.id !== undefined && edu?.id !== null) {
    return `id:${edu.id}`;
  }
  const school = sanitizeString(edu?.school);
  const degree = sanitizeString(edu?.degree);
  return `school:${school}|degree:${degree}`;
};

const normalizeEducationItem = (edu: Partial<EducationItem>): EducationItem => ({
  id: coerceNumericId(edu?.id),
  school: sanitizeString(edu?.school),
  degree: sanitizeString(edu?.degree),
  startDate: sanitizeString(edu?.startDate),
  endDate: sanitizeString(edu?.endDate),
  customFields: Array.isArray(edu?.customFields) ? (edu?.customFields as any[]) : [],
});

const certificationKey = (cert: Partial<CertificationItem>): string => {
  if (cert?.id !== undefined && cert?.id !== null) {
    return `id:${cert.id}`;
  }
  const name = sanitizeString(cert?.name);
  const issuer = sanitizeString(cert?.issuer);
  return `name:${name}|issuer:${issuer}`;
};

const normalizeCertificationItem = (cert: Partial<CertificationItem>): CertificationItem => ({
  id: coerceNumericId(cert?.id),
  name: sanitizeString(cert?.name),
  issuer: sanitizeString(cert?.issuer),
  link: sanitizeString(cert?.link),
  skills: normalizeStringArray(cert?.skills),
  customFields: Array.isArray(cert?.customFields) ? (cert?.customFields as any[]) : [],
});

export function mergeTailoredResume(
  base: ResumeData | null | undefined,
  tailored: ResumeData | null | undefined
): ResumeData {
  const baseData = base ?? EMPTY_RESUME;
  const tailoredData = tailored ?? EMPTY_RESUME;

  const merged: ResumeData = {
    name: chooseContactValue(tailoredData.name, baseData.name),
    title: chooseContactValue(tailoredData.title, baseData.title),
    email: chooseContactValue(tailoredData.email, baseData.email),
    phone: chooseContactValue(tailoredData.phone, baseData.phone),
    location: chooseContactValue(tailoredData.location, baseData.location),
    summary: sanitizeString(tailoredData.summary) || sanitizeString(baseData.summary),
    skills: mergeSkills(baseData.skills, tailoredData.skills),
    experience: mergeEntryLists<ExperienceItem>(
      baseData.experience,
      tailoredData.experience,
      experienceKey,
      normalizeExperienceItem
    ),
    education: mergeEntryLists<EducationItem>(
      baseData.education,
      tailoredData.education,
      educationKey,
      normalizeEducationItem
    ),
    projects: mergeEntryLists<ProjectItem>(
      baseData.projects,
      tailoredData.projects,
      projectKey,
      normalizeProjectItem
    ),
    certifications: mergeEntryLists<CertificationItem>(
      baseData.certifications,
      tailoredData.certifications,
      certificationKey,
      normalizeCertificationItem
    ),
  };

  return merged;
}

/**
 * Duplicate resume state for creating a copy
 */
export function duplicateResumeState(
  resumeFileName: string,
  resumeData: ResumeData,
  customSections: any[],
  sectionOrder: string[],
  sectionVisibility: SectionVisibility
): DuplicateResumeState {
  return {
    resumeFileName: `${resumeFileName} - Copy`,
    resumeData: JSON.parse(JSON.stringify(resumeData)),
    customSections: JSON.parse(JSON.stringify(customSections)),
    sectionOrder: [...sectionOrder],
    sectionVisibility: { ...sectionVisibility },
  };
}

