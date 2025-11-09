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
  links?: string[];
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

const normalizeArray = <T>(value: T[] | undefined | null): T[] => (Array.isArray(value) ? value : []);

export const mapBaseResumeToEditor = (resume?: Partial<BaseResumeRecord> | null): ResumeSnapshot => {
  const normalizedResume = resume?.data || {};
  const contact = normalizedResume.contact || {};

  const editorResume: ResumeData = {
    ...createDefaultResumeData(),
    name: contact.name || '',
    title: contact.title || '',
    email: contact.email || '',
    phone: contact.phone || '',
    location: contact.location || '',
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

const normalizeEndPeriod = (endPeriod: string | undefined | null): { endDate?: string; isCurrent?: boolean } => {
  if (!endPeriod) return {};
  const normalized = endPeriod.trim().toLowerCase();
  if (normalized === 'present' || normalized === 'current' || normalized === 'ongoing') {
    return { isCurrent: true };
  }
  return { endDate: endPeriod };
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

  const normalizedData: NormalizedResumeData = {
    summary: resumeData.summary || '',
    contact: {
      name: resumeData.name || undefined,
      title: resumeData.title || undefined,
      email: resumeData.email || undefined,
      phone: resumeData.phone || undefined,
      location: resumeData.location || undefined
    },
    skills: {
      technical: normalizeArray(resumeData.skills)
    },
    experience: resumeData.experience.map((exp) => {
      return {
        id: String(exp.id ?? ''),
        company: exp.company || undefined,
        role: exp.position || undefined,
        startDate: exp.period || undefined,
        ...normalizeEndPeriod(exp.endPeriod),
        location: exp.location || undefined,
        environment: normalizeArray(exp.environment),
        bullets: normalizeArray(exp.bullets)
      };
    }),
    education: resumeData.education.map((edu) => ({
      id: String(edu.id ?? ''),
      institution: edu.school || undefined,
      degree: edu.degree || undefined,
      startDate: edu.startDate || undefined,
      endDate: edu.endDate || undefined
    })),
    projects: resumeData.projects.map((proj) => ({
      id: String(proj.id ?? ''),
      name: proj.name || undefined,
      summary: proj.description || undefined,
      link: proj.link || undefined,
      bullets: normalizeArray(proj.bullets),
      technologies: normalizeArray(proj.skills)
    })),
    certifications: resumeData.certifications.map((cert) => ({
      id: String(cert.id ?? ''),
      name: cert.name || undefined,
      issuer: cert.issuer || undefined,
      link: cert.link || undefined,
      skills: normalizeArray(cert.skills)
    }))
  };

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
