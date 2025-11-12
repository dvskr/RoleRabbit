import type { LucideIcon } from 'lucide-react';
import type { ResumeData } from '../../../types/resume';
import type { ATSAnalysisResult, TailorResult, CoverLetterDraft, PortfolioDraft } from '../../../types/ai';

export interface AIPanelProps {
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
  aiMode: string;
  setAiMode: (mode: string) => void;
  jobDescription: string;
  setJobDescription: (desc: string) => void;
  isAnalyzing: boolean;
  matchScore: ATSAnalysisResult | null;
  showATSScore: boolean;
  setShowATSScore: (show: boolean) => void;
  matchedKeywords: string[];
  missingKeywords: string[];
  aiRecommendations: string[];
  setAiRecommendations: (rec: string[]) => void;
  tailorEditMode: string;
  setTailorEditMode: (mode: string) => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  selectedLength: string;
  setSelectedLength: (length: string) => void;
  onResetTailoringPreferences?: () => void;
  isMobile: boolean;
  resumeData: ResumeData | null;
  onAnalyzeJobDescription: () => Promise<any | null> | void;
  onApplyAIRecommendations: () => Promise<any | null> | void;
  onTailorResume: () => Promise<any | null> | void;
  onGenerateCoverLetter: () => Promise<any | null> | void;
  onGeneratePortfolio: () => Promise<any | null> | void;
  tailorResult: TailorResult | null;
  setTailorResult: (result: TailorResult | null) => void;
  coverLetterDraft: CoverLetterDraft | null;
  setCoverLetterDraft: (draft: CoverLetterDraft | null) => void;
  portfolioDraft: PortfolioDraft | null;
  setPortfolioDraft: (draft: PortfolioDraft | null) => void;
  isTailoring: boolean;
  onConfirmTailorChanges?: () => Promise<boolean>;
  isSavingResume?: boolean;
  isGeneratingCoverLetter: boolean;
  isGeneratingPortfolio: boolean;
  onResumeUpdate?: (data: ResumeData) => void;
  // AI Progress tracking (optional for backwards compatibility)
  atsProgress?: any;
  tailorProgress?: any;
}

export interface ApplyChangesHandlerDeps {
  confirmTailorChanges?: () => Promise<boolean>;
  analyzeJobDescription?: () => Promise<any | null> | void;
  setApplyError: (value: string | null) => void;
  setBeforeScore: (value: number | null) => void;
}

export interface ToneOption {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

export interface LengthOption {
  id: string;
  name: string;
  description: string;
}

export interface QuickAction {
  name: string;
  icon: LucideIcon;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

