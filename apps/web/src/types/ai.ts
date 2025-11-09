export interface ATSAnalysisResult {
  overall: number;
  keywords: number;
  format: number;
  content: number;
  experience: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
}

export interface TailorDiffEntry {
  path: string;
  before: unknown;
  after: unknown;
  confidence?: number;
}

export interface TailorResult {
  tailoredResume: Record<string, any> | null;
  diff: TailorDiffEntry[];
  warnings: string[];
  recommendedKeywords: string[];
  ats?: {
    before?: ATSAnalysisResult | null;
    after?: ATSAnalysisResult | null;
  } | null;
  confidence?: number | null;
  mode?: 'PARTIAL' | 'FULL';
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
