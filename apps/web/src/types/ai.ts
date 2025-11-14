import type { ResumeData } from './resume';

export interface ATSActionableTip {
  type?: string;
  priority?: 'low' | 'medium' | 'high';
  impact?: string;
  action: string;
  skills?: string[];
}

export interface ATSBreakdownSection {
  score: number;
  weight?: number;
  contribution?: number;
  matched?: string[];
  missing?: string[];
  requiredMatched?: number;
  requiredTotal?: number;
  preferredMatched?: number;
  preferredTotal?: number;
  years?: number;
  required?: number;
  analysis?: Record<string, unknown>;
}

export interface ATSBreakdown {
  technicalSkills?: ATSBreakdownSection;
  experience?: ATSBreakdownSection;
  skillQuality?: ATSBreakdownSection;
  education?: ATSBreakdownSection;
  format?: ATSBreakdownSection;
  [key: string]: ATSBreakdownSection | undefined;
}

export interface ATSSenioritySummary {
  detected?: string | null;
  aligned?: boolean;
}

export interface ATSMeta {
  analysis_method?: string;
  job_extraction_method?: string;
  used_semantic_matching?: boolean;
  duration_ms?: number;
  cost?: string;
  from_cache?: boolean;
  timestamp?: string;
}

export interface ATSAnalysisResult {
  overall: number;
  keywords?: number;
  format?: number;
  content?: number;
  experience?: number;
  strengths?: string[];
  improvements?: string[];
  matchedKeywords?: string[];
  missingKeywords?: string[];
  actionable_tips?: ATSActionableTip[];
  actionableTips?: ATSActionableTip[];
  estimated_score_if_improved?: number;
  estimatedScoreIfImproved?: number;
  seniority?: ATSSenioritySummary;
  breakdown?: ATSBreakdown;
  meta?: ATSMeta;
  generatedAt?: string;
  resumeUpdatedAt?: string | Date | null;
  evidenceBySkill?: Record<string, { evidence: string[]; reasoning?: string; proficiency?: string }>;
}

export interface TailorDiffEntry {
  path: string;
  before: unknown;
  after: unknown;
  confidence?: number;
}

export interface TailorResult {
  tailoredResume: ResumeData | null;
  diff: TailorDiffEntry[];
  diffChanges?: Array<{
    type: 'added' | 'removed' | 'modified' | 'unchanged';
    section: string;
    field?: string;
    index?: number;
    oldValue?: string;
    newValue?: string;
    path: string;
  }>;
  warnings: string[];
  recommendedKeywords: string[];
  ats?: {
    before?: ATSAnalysisResult | null;
    after?: ATSAnalysisResult | null;
  } | null;
  confidence?: number | null;
  mode?: 'PARTIAL' | 'FULL';
  tailoredVersionId?: string | number | null;
}

export interface CoverLetterDraft {
  subject: string;
  greeting: string;
  bodyParagraphs: string[];
  closing: string;
  signature: string;
  jobTitle?: string | null;
  company?: string | null;
  tone?: string | null;
}

export interface PortfolioProjectEntry {
  name: string;
  summary: string;
  technologies: string[];
}

export interface PortfolioDraft {
  headline: string;
  tagline: string;
  about: string;
  highlights: string[];
  selectedProjects: PortfolioProjectEntry[];
  tone?: string | null;
}
