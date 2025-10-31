export interface AIPanelProps {
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
  aiMode: string;
  setAiMode: (mode: string) => void;
  jobDescription: string;
  setJobDescription: (desc: string) => void;
  isAnalyzing: boolean;
  matchScore: number;
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
  aiConversation: any[];
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isMobile: boolean;
  resumeData: any;
  onAnalyzeJobDescription: () => void;
  onApplyAIRecommendations: () => void;
  onSendAIMessage: () => void;
  onResumeUpdate?: (updatedData: any) => void;
}

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

export interface ToneOption {
  id: string;
  name: string;
  icon: any;
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
  icon: any;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

