import {
  ResumeData,
  CustomSection,
  SectionVisibility,
  ExperienceItem,
  ProjectItem,
  CertificationItem,
  CustomField,
  EducationItem
} from '../types/resume';
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_FORMATTING,
  createDefaultResumeData
} from './resumeDefaults';
import {
  normalizeResumeData as normalizeCanonicalResumeData,
  NormalizedResumeData
} from '@roleready/resume-normalizer';

let placeholderIdCounter = 0;
const nextPlaceholderId = () => {
  placeholderIdCounter += 1;
  return -1 * (Date.now() + placeholderIdCounter);
};

const createEmptyExperienceItem = (): ExperienceItem => ({
  id: nextPlaceholderId(),
  company: '',
  position: '',
  period: '',
  endPeriod: '',
  location: '',
  bullets: [''],
  environment: [''],
  customFields: []
});

const createEmptyEducationItem = (): EducationItem => ({
  id: nextPlaceholderId(),
  school: '',
  degree: '',
  startDate: '',
  endDate: '',
  customFields: []
});

const createEmptyProjectItem = (): ProjectItem => ({
  id: nextPlaceholderId(),
  name: '',
  description: '',
  link: '',
  bullets: [''],
  skills: [''],
  customFields: []
});

const createEmptyCertificationItem = (): CertificationItem => ({
  id: nextPlaceholderId(),
  name: '',
  issuer: '',
  link: '',
  skills: [''],
  customFields: []
});

export interface NormalizedContact {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  links?: Array<string | { url?: string | null } | null | undefined>;
}

export interface NormalizedSkillGroup {
  technical?: string[];
  tools?: string[];
  soft?: string[];
}

export interface NormalizedExperience {
  id?: string;
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  bullets?: string[];
  environment?: string[];
}

export interface NormalizedEducation {
  id?: string;
  institution?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  bullets?: string[];
}

export interface NormalizedProject {
  id?: string;
  name?: string;
  summary?: string;
  link?: string;
  bullets?: string[];
  technologies?: string[];
}

export interface NormalizedCertification {
  id?: string;
  name?: string;
  issuer?: string;
  issueDate?: string;
  expirationDate?: string;
  link?: string;
  skills?: string[];
}

export interface NormalizedResumeData {
  summary?: string;
  contact?: NormalizedContact;
  skills?: NormalizedSkillGroup;
  experience?: NormalizedExperience[];
  education?: NormalizedEducation[];
  projects?: NormalizedProject[];
  certifications?: NormalizedCertification[];
}

export interface BaseResumeMetadata {
  sectionOrder?: string[];
  sectionVisibility?: SectionVisibility;
  customSections?: CustomSection[];
  customFields?: CustomField[];
}

export interface BaseResumeRecord {
  id: string;
  userId?: string;
  slotNumber?: number;
  name?: string;
  data?: NormalizedResumeData;
  formatting?: Record<string, any> | null;
  metadata?: BaseResumeMetadata | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  isActive?: boolean;
}

export interface ResumeSnapshot {
  resumeData: ResumeData;
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
  customSections: CustomSection[];
  formatting: typeof DEFAULT_FORMATTING;
  customFields: CustomField[];
}

const toNumberId = (value: string | number | undefined, fallback: number) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeArray = <T>(value: T[] | Record<string, T> | undefined | null): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === 'object') {
    const entries = Object.keys(value)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => (value as Record<string, T>)[key]);
    if (entries.length > 0) {
      return entries;
    }
  }
  return [];
};

const toCleanString = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const normalizeLinkEntries = (value: unknown): string[] => {
  const rawEntries = normalizeArray<any>(value as any);
  const result: string[] = [];
  const seen = new Set<string>();

  rawEntries.forEach((entry) => {
    let url = '';
    if (typeof entry === 'string') {
      url = entry.trim();
    } else if (entry && typeof entry === 'object') {
      const candidate = (entry as { url?: unknown }).url;
      if (typeof candidate === 'string') {
        url = candidate.trim();
      }
    }

    if (!url) {
      return;
    }

    const normalized = url.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(url);
    }
  });

  return result;
};

const findLinkByDomains = (links: string[], domains: string[], exclude: Set<string>): string => {
  if (!links.length || !domains.length) {
    return '';
  }
  const normalizedDomains = domains.map((domain) => domain.toLowerCase());
  for (const link of links) {
    const normalizedLink = link.toLowerCase();
    if (exclude.has(normalizedLink)) {
      continue;
    }
    if (normalizedDomains.some((domain) => normalizedLink.includes(domain))) {
      return link;
    }
  }
  return '';
};

const findFirstAvailableLink = (links: string[], exclude: Set<string>): string => {
  if (!links.length) {
    return '';
  }
  for (const link of links) {
    const normalizedLink = link.toLowerCase();
    if (!exclude.has(normalizedLink)) {
      return link;
    }
  }
  return '';
};

export const mapBaseResumeToEditor = (resume?: Partial<BaseResumeRecord> | null): ResumeSnapshot => {
  const normalizedResume = normalizeCanonicalResumeData(resume?.data || {});
  const resumeId = typeof resume?.id === 'string' ? resume.id : undefined;
  const contact = normalizedResume.contact || {};
  const contactLinks = normalizeLinkEntries(contact.links);
  const usedContactLinks = new Set<string>();

  const linkedinUrl =
    toCleanString(contact.linkedin) ||
    findLinkByDomains(contactLinks, ['linkedin.com', 'lnkd.in'], usedContactLinks);
  if (linkedinUrl) {
    usedContactLinks.add(linkedinUrl.toLowerCase());
  }

  const githubUrl =
    toCleanString(contact.github) ||
    findLinkByDomains(contactLinks, ['github.com'], usedContactLinks);
  if (githubUrl) {
    usedContactLinks.add(githubUrl.toLowerCase());
  }

  const websiteUrl =
    toCleanString(contact.website) ||
    findFirstAvailableLink(contactLinks, usedContactLinks);
  if (websiteUrl) {
    usedContactLinks.add(websiteUrl.toLowerCase());
  }

  const editorResume: ResumeData = {
    ...createDefaultResumeData(),
    id: resumeId,
    name: contact.name || '',
    title: contact.title || '',
    email: contact.email || '',
    phone: contact.phone || '',
    location: contact.location || '',
    linkedin: linkedinUrl || '',
    github: githubUrl || '',
    website: websiteUrl || '',
    summary: normalizedResume.summary || '',
    skills: normalizeArray(normalizedResume.skills?.technical)
      .concat(normalizeArray(normalizedResume.skills?.tools))
      .concat(normalizeArray(normalizedResume.skills?.soft))
  };

  editorResume.experience = normalizeArray(normalizedResume.experience).map((exp, index) => {
    const experienceId = toNumberId(exp.id, index + 1);
    const endValue = exp.isCurrent ? 'Present' : (exp.endDate || '');
    const experienceItem: ExperienceItem = {
      id: experienceId,
      company: exp.company || '',
      position: exp.role || '',
      period: exp.startDate || '',
      endPeriod: endValue,
      location: exp.location || '',
      bullets: normalizeArray(exp.bullets),
      environment: normalizeArray(exp.environment),
      customFields: []
    };
    return experienceItem;
  });

  editorResume.education = normalizeArray(normalizedResume.education).map((edu, index) => {
    return {
      id: toNumberId(edu.id, index + 1),
      school: edu.institution || '',
      degree: edu.degree || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      customFields: []
    } as EducationItem;
  });

  editorResume.projects = normalizeArray(normalizedResume.projects).map((proj, index) => {
    const project: ProjectItem = {
      id: toNumberId(proj.id, index + 1),
      name: proj.name || '',
      description: proj.summary || '',
      link: proj.link || '',
      bullets: normalizeArray(proj.bullets),
      skills: normalizeArray(proj.technologies),
      customFields: []
    };
    return project;
  });

  editorResume.certifications = normalizeArray(normalizedResume.certifications).map((cert, index) => {
    const certification: CertificationItem = {
      id: toNumberId(cert.id, index + 1),
      name: cert.name || '',
      issuer: cert.issuer || '',
      link: cert.link || '',
      skills: normalizeArray(cert.skills),
      customFields: []
    };
    return certification;
  });

  const metadata = resume?.metadata || {};
  const sectionOrderFromMetadata = Array.isArray(metadata.sectionOrder) && metadata.sectionOrder.length > 0
    ? [...metadata.sectionOrder]
    : [];

  const sectionOrder = [...sectionOrderFromMetadata];
  DEFAULT_SECTION_ORDER.forEach((section) => {
    if (!sectionOrder.includes(section)) {
      sectionOrder.push(section);
    }
  });

  if (!editorResume.experience.length) {
    editorResume.experience.push(createEmptyExperienceItem());
  }

  if (!editorResume.education.length) {
    editorResume.education.push(createEmptyEducationItem());
  }

  if (!editorResume.projects.length) {
    editorResume.projects.push(createEmptyProjectItem());
  }

  if (!editorResume.certifications.length) {
    editorResume.certifications.push(createEmptyCertificationItem());
  }

  const sectionVisibility: SectionVisibility = {
    ...DEFAULT_SECTION_VISIBILITY,
    ...(typeof metadata.sectionVisibility === 'object' ? metadata.sectionVisibility : {})
  };

  const customSections = Array.isArray(metadata.customSections) ? [...metadata.customSections] : [];
  const customFields = Array.isArray(metadata.customFields) ? [...metadata.customFields] : [];

  const formattingSource = resume?.formatting && typeof resume.formatting === 'object'
    ? resume.formatting
    : {};

  const formatting = {
    ...DEFAULT_FORMATTING,
    ...formattingSource
  } as typeof DEFAULT_FORMATTING;

  return {
    resumeData: editorResume,
    sectionOrder,
    sectionVisibility,
    customSections,
    formatting,
    customFields
  };
};

export const normalizedDataToResumeData = (
  data: NormalizedResumeData | null | undefined
): ResumeData => {
  return mapBaseResumeToEditor({ data: data ?? undefined }).resumeData;
};

export interface EditorStateForMapping {
  resumeData: ResumeData;
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
  customSections: CustomSection[];
  formatting: typeof DEFAULT_FORMATTING;
  customFields?: CustomField[];
  name?: string;
}

export const mapEditorStateToBasePayload = (
  state: EditorStateForMapping
): {
  data: NormalizedResumeData;
  metadata: BaseResumeMetadata;
  formatting: typeof DEFAULT_FORMATTING;
  name?: string;
} => {
  const {
    resumeData,
    sectionOrder,
    sectionVisibility,
    customSections,
    formatting,
    customFields,
    name
  } = state;

  const contactLinks = [
    resumeData.linkedin,
    resumeData.github,
    resumeData.website
  ]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value): value is string => !!value);

  const normalizedData = normalizeCanonicalResumeData({
    summary: resumeData.summary,
    contact: {
      name: resumeData.name,
      title: resumeData.title,
      email: resumeData.email,
      phone: resumeData.phone,
      location: resumeData.location,
      linkedin: resumeData.linkedin,
      github: resumeData.github,
      website: resumeData.website,
      links: contactLinks
    },
    skills: {
      technical: resumeData.skills
    },
    experience: resumeData.experience.map((exp) => ({
      id: exp.id,
      company: exp.company,
      role: exp.position,
      startDate: exp.period,
      endDate: exp.endPeriod,
      location: exp.location,
      environment: exp.environment,
      bullets: exp.bullets
    })),
    education: resumeData.education.map((edu) => ({
      id: edu.id,
      institution: edu.school,
      degree: edu.degree,
      startDate: edu.startDate,
      endDate: edu.endDate
    })),
    projects: resumeData.projects.map((proj) => ({
      id: proj.id,
      name: proj.name,
      summary: proj.description,
      link: proj.link,
      bullets: proj.bullets,
      technologies: proj.skills
    })),
    certifications: resumeData.certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      link: cert.link,
      skills: cert.skills
    }))
  });

  const metadata: BaseResumeMetadata = {
    sectionOrder: sectionOrder && sectionOrder.length ? [...sectionOrder] : [...DEFAULT_SECTION_ORDER],
    sectionVisibility: { ...DEFAULT_SECTION_VISIBILITY, ...sectionVisibility },
    customSections: [...customSections],
    customFields: customFields ? [...customFields] : []
  };

  const normalizedFormatting = {
    ...DEFAULT_FORMATTING,
    ...formatting
  } as typeof DEFAULT_FORMATTING;

  return {
    name,
    data: normalizedData,
    metadata,
    formatting: normalizedFormatting
  };
};
